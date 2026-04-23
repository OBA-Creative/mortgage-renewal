"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import LabelWithHelper from "./label-with-helper";
import { getCachedLocation, prefetchLocation } from "@/lib/geoip";

export default function PlacesAutocompleteInput({
  label,
  id, // visible input (e.g., "cityDisplay")
  register,
  requiredText,
  error,
  setValue,
  setError,
  clearErrors,
  onCityProvince, // optional: ({ city, province, placeId, lat, lng }) => void
  provinceFieldId, // 👈 name for the hidden province field
  country = "ca",
  defaultValue = "", // Add default value support
  helpTexts, // Add helpTexts support
}) {
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);
  // Read cached IP location synchronously so there's zero perceived wait.
  const [ipLocation, setIpLocation] = useState(() => {
    if (defaultValue) return null;
    const cached = getCachedLocation();
    return cached && cached.country === "CA" ? cached : null;
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [activeHelp, setActiveHelp] = useState(null);

  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [lastSelectedLabel, setLastSelectedLabel] = useState("");

  const sessionTokenRef = useRef(null);
  const timeoutIdRef = useRef(null);
  const suppressFetchRef = useRef(false);
  const isSettingDefaultRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const toggleHelp = (key) =>
    setActiveHelp((prev) => (prev === key ? null : key));

  const rules = requiredText ? { required: requiredText } : undefined;
  const { ref: registerRef, ...registerRest } = register(id, rules);
  const mergedRef = (el) => {
    inputRef.current = el;
    registerRef(el);
  };

  const ensureSessionToken = () => {
    if (
      window?.google?.maps?.places?.AutocompleteSessionToken &&
      !sessionTokenRef.current
    ) {
      sessionTokenRef.current =
        new window.google.maps.places.AutocompleteSessionToken();
    }
  };

  // Check if Google Maps API is ready
  useEffect(() => {
    const checkGoogleMapsReady = () => {
      if (window?.google?.maps?.places?.AutocompleteSuggestion) {
        setIsGoogleMapsReady(true);
        return true;
      }
      return false;
    };

    if (checkGoogleMapsReady()) {
      return;
    }

    // Poll for Google Maps API availability
    const interval = setInterval(() => {
      if (checkGoogleMapsReady()) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Fallback: if cache was empty (prefetch hadn't completed), kick off the
  // shared in-flight fetch. Usually a no-op because the root layout already prefetched.
  useEffect(() => {
    if (defaultValue || ipLocation) return;
    setIsLoadingLocation(true);
    prefetchLocation().then((loc) => {
      if (loc && loc.country === "CA") setIpLocation(loc);
      setIsLoadingLocation(false);
    });
  }, [defaultValue, ipLocation]);

  // Initialize with default value or IP location
  useEffect(() => {
    // Prevent re-initialization if we've already set a value
    if (hasInitializedRef.current || query) {
      return;
    }

    // Priority: 1. Store value (defaultValue), 2. IP location, 3. Empty
    let valueToUse, displayValue;

    if (defaultValue) {
      valueToUse = defaultValue;
      displayValue = defaultValue;
    } else if (ipLocation) {
      // For IP location, use just the city name for the form value, but display with province
      valueToUse = ipLocation.city;
      displayValue = ipLocation.formatted;
    }

    if (valueToUse) {
      hasInitializedRef.current = true;
      isSettingDefaultRef.current = true;

      setQuery(displayValue);
      setValue(id, valueToUse, { shouldValidate: false });

      // If using IP location, also set the province field
      if (!defaultValue && ipLocation) {
        if (provinceFieldId) {
          setValue(provinceFieldId, ipLocation.province, {
            shouldValidate: false,
          });
        }
        // Call the callback if provided
        onCityProvince?.({
          city: ipLocation.city,
          province: ipLocation.province,
          placeId: null,
          lat: null,
          lng: null,
        });
      }

      // Mark this as a selected value
      setSelectedPlaceId(defaultValue ? "default" : "ip-location");
      setLastSelectedLabel(displayValue);
      suppressFetchRef.current = true;

      setTimeout(() => {
        isSettingDefaultRef.current = false;
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue, ipLocation]);

  // Reset initialization flag when user starts typing
  useEffect(() => {
    if (query && !isSettingDefaultRef.current) {
      hasInitializedRef.current = false;
    }
  }, [query]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Debounced predictions
  useEffect(() => {
    // Check if Google Maps API is available
    if (
      !isGoogleMapsReady ||
      !window?.google?.maps?.places?.AutocompleteSuggestion
    ) {
      return;
    }

    if (suppressFetchRef.current) {
      suppressFetchRef.current = false;
      return;
    }

    if (!query.trim()) {
      setPredictions([]);
      setOpen(false);
      return;
    }

    ensureSessionToken();
    setLoading(true);

    timeoutIdRef.current = setTimeout(async () => {
      try {
        const { suggestions } =
          await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
            {
              input: query,
              sessionToken: sessionTokenRef.current,
              includedPrimaryTypes: [
                "locality",
                "postal_town",
                "administrative_area_level_3",
                "administrative_area_level_2",
              ],
              includedRegionCodes: [country],
            },
          );

        setLoading(false);
        const placePredictions = suggestions
          .filter((s) => s.placePrediction)
          .map((s) => s.placePrediction);

        if (placePredictions.length > 0) {
          setPredictions(placePredictions);
          setOpen(true);
          setActiveIndex(0);
        } else {
          setPredictions([]);
          setOpen(false);
          setActiveIndex(-1);
        }
      } catch {
        setLoading(false);
        setPredictions([]);
        setOpen(false);
        setActiveIndex(-1);
      }
    }, 150);

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, [query, country, isGoogleMapsReady]);

  const fetchDetails = async (placeId) => {
    if (!window?.google?.maps?.places?.Place) return null;
    try {
      const place = new window.google.maps.places.Place({ id: placeId });
      await place.fetchFields({
        fields: [
          "addressComponents",
          "location",
          "id",
          "formattedAddress",
          "displayName",
          "types",
        ],
        sessionToken: sessionTokenRef.current,
      });
      return place;
    } catch {
      return null;
    }
  };

  const getComp = (components, type, key = "longText") =>
    components?.find((c) => c.types.includes(type))?.[key] || "";

  const parseCityProvince = (place) => {
    const city =
      getComp(place.addressComponents, "locality") ||
      getComp(place.addressComponents, "postal_town") ||
      getComp(place.addressComponents, "administrative_area_level_3") ||
      getComp(place.addressComponents, "administrative_area_level_2");

    const province = getComp(
      place.addressComponents,
      "administrative_area_level_1",
      "shortText", // BC, ON...
    );

    const lat = place.location?.lat?.();
    const lng = place.location?.lng?.();

    return { city, province, lat, lng };
  };

  const displayFromPrediction = (p) => {
    const city = p.mainText?.text || "";
    const sec = p.secondaryText?.text || ""; // "BC, Canada"
    const prov = sec.replace(/,\s*Canada$/, "");
    return prov ? `${city}, ${prov}` : p.text?.text || city;
  };

  const handleSelect = async (prediction) => {
    suppressFetchRef.current = true;
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    const display = displayFromPrediction(prediction);

    setSelectedPlaceId(prediction.placeId);
    setLastSelectedLabel(display);
    clearErrors?.(id);

    setQuery(display);
    setValue(id, display, { shouldValidate: true, shouldDirty: true });

    setOpen(false);
    setPredictions([]);
    setActiveIndex(-1);

    const details = await fetchDetails(prediction.placeId);
    if (details) {
      const { city, province, lat, lng } = parseCityProvince(details);

      // 👇 set the hidden province field
      if (provinceFieldId) {
        setValue(provinceFieldId, province ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        clearErrors?.(provinceFieldId);
      }

      onCityProvince?.({
        city,
        province,
        placeId: prediction.placeId,
        lat,
        lng,
      });
    }

    sessionTokenRef.current = null;
  };

  const onKeyDown = (e) => {
    if (!open || !predictions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % predictions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + predictions.length) % predictions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = activeIndex >= 0 ? predictions[activeIndex] : predictions[0];
      if (pick) handleSelect(pick);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const onBlur = () => {
    setTimeout(() => {
      setOpen(false);
      setActiveIndex(-1);

      // hard enforce selection; clear province if invalid
      if (!selectedPlaceId || query !== lastSelectedLabel) {
        // Allow IP location to be valid without Google Places selection
        if (selectedPlaceId === "ip-location" && query === lastSelectedLabel) {
          return; // IP location is valid, don't clear it
        }

        setSelectedPlaceId(null);
        setLastSelectedLabel("");
        setQuery("");
        setValue(id, "", { shouldValidate: true, shouldDirty: true });
        if (provinceFieldId)
          setValue(provinceFieldId, "", { shouldDirty: true });
        setError?.(id, {
          type: "manual",
          message: "Please select a city from the suggestions",
        });
      }
    }, 0);
  };

  return (
    <div className="flex flex-col space-y-2" ref={containerRef}>
      <LabelWithHelper
        htmlFor={id}
        label={label}
        onHelpClick={helpTexts ? () => toggleHelp(id) : undefined}
      />
      {activeHelp === id && helpTexts && (
        <div className="p-3 mt-2 bg-blue-100 border border-gray-300 rounded-md">
          {helpTexts}
        </div>
      )}

      {/* visible input */}
      <input
        id={id}
        type="text"
        {...registerRest}
        ref={mergedRef}
        className="w-full px-4 py-4 text-lg bg-white border border-gray-300 rounded-md"
        autoComplete="off"
        value={query || ""} // Ensure value is always a string
        disabled={!isGoogleMapsReady || isLoadingLocation}
        placeholder={
          isLoadingLocation
            ? "Getting your location..."
            : !isGoogleMapsReady
              ? "Loading..."
              : "Enter city"
        }
        onChange={(e) => {
          const v = e.target.value;
          setQuery(v);
          setValue(id, v, { shouldDirty: true });

          // Only skip popup/validation logic if we're programmatically setting default
          if (!isSettingDefaultRef.current) {
            if (!open) setOpen(true);

            // user typed -> invalidate prior selection & clear hidden province
            if (selectedPlaceId) {
              setSelectedPlaceId(null);
              setLastSelectedLabel("");
            }
            if (provinceFieldId)
              setValue(provinceFieldId, "", { shouldDirty: true });

            setError?.(id, {
              type: "manual",
              message: "Please select a city from the suggestions",
            });
          }
        }}
        onFocus={() => {
          // Show predictions on focus if we have some and it's not a fresh default value
          if (predictions.length && selectedPlaceId !== "default") {
            setOpen(true);
          }
        }}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
      />

      {/* 👇 hidden province field that submits with the form */}
      {provinceFieldId && (
        <input
          type="hidden"
          id={provinceFieldId}
          {...register(provinceFieldId, { value: "" })}
        />
      )}

      {open && (predictions.length > 0 || loading) && (
        <div className="relative">
          <ul
            role="listbox"
            className="absolute z-50 w-full mt-1 overflow-auto bg-white border border-gray-300 rounded-md shadow-lg max-h-72"
          >
            {loading && (
              <li className="px-4 py-3 text-sm text-gray-500">Searching…</li>
            )}
            {!loading &&
              predictions.map((p, i) => (
                <li
                  key={p.placeId}
                  role="option"
                  aria-selected={i === activeIndex}
                  className={`px-4 py-3 cursor-pointer ${
                    i === activeIndex ? "bg-gray-100" : "bg-white"
                  } hover:bg-gray-100`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(p)}
                >
                  <span className="font-medium">
                    {p.mainText?.text}
                    {p.secondaryText?.text
                      ? `, ${p.secondaryText.text.replace(/,\s*Canada$/, "")}`
                      : ""}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {error && <p className="mt-1 text-red-600">{error.message}</p>}
    </div>
  );
}
