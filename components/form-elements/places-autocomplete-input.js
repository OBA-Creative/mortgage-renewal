"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import LabelWithHelper from "./label-with-helper";

// Helper function to get user location from IP
const getLocationFromIP = async () => {
  try {
    // Using ipapi.co service (free tier allows 30,000 requests/month)
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    if (data.city && data.region) {
      // Format to match Canadian province codes
      const provinceMap = {
        Alberta: "AB",
        "British Columbia": "BC",
        Manitoba: "MB",
        "New Brunswick": "NB",
        "Newfoundland and Labrador": "NL",
        "Northwest Territories": "NT",
        "Nova Scotia": "NS",
        Nunavut: "NU",
        Ontario: "ON",
        "Prince Edward Island": "PE",
        Quebec: "QC",
        Saskatchewan: "SK",
        Yukon: "YT",
      };

      const province = provinceMap[data.region] || data.region_code;
      const formattedLocation = `${data.city}, ${province}`;

      return {
        city: data.city,
        province: province,
        formatted: formattedLocation,
        country: data.country_code,
      };
    }
  } catch (error) {
    console.warn("Failed to get location from IP:", error);
  }
  return null;
};

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
  const [ipLocation, setIpLocation] = useState(null);
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
      if (window?.google?.maps?.places?.AutocompleteService) {
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

  // Fetch IP-based location on component mount
  useEffect(() => {
    // Only fetch IP location if no default value is provided (meaning no store value)
    if (!defaultValue) {
      setIsLoadingLocation(true);
      getLocationFromIP().then((location) => {
        if (location && location.country === "CA") {
          // Only use Canadian locations
          setIpLocation(location);
        }
        setIsLoadingLocation(false);
      });
    }
  }, [defaultValue]);

  // Initialize with default value or IP location
  useEffect(() => {
    // Prevent re-initialization if we've already set a value
    if (hasInitializedRef.current || query) {
      return;
    }

    // Priority: 1. Store value (defaultValue), 2. IP location, 3. Empty
    const valueToUse = defaultValue || ipLocation?.formatted;

    if (valueToUse) {
      hasInitializedRef.current = true;
      isSettingDefaultRef.current = true;

      setQuery(valueToUse);
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
      setLastSelectedLabel(valueToUse);
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
      !window?.google?.maps?.places?.AutocompleteService
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

    const service = new window.google.maps.places.AutocompleteService();
    ensureSessionToken();

    setLoading(true);
    timeoutIdRef.current = setTimeout(() => {
      service.getPlacePredictions(
        {
          input: query,
          sessionToken: sessionTokenRef.current,
          types: ["(cities)"], // only cities
          componentRestrictions: { country }, // Canada only
        },
        (res, status) => {
          setLoading(false);
          if (
            status === window.google?.maps?.places?.PlacesServiceStatus?.OK &&
            Array.isArray(res)
          ) {
            setPredictions(res);
            setOpen(true);
            setActiveIndex(res.length ? 0 : -1);
          } else {
            setPredictions([]);
            setOpen(false);
            setActiveIndex(-1);
          }
        }
      );
    }, 150);

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, [query, country, isGoogleMapsReady]);

  const fetchDetails = (placeId) =>
    new Promise((resolve) => {
      if (!window?.google?.maps?.places?.PlacesService) return resolve(null);
      const svc = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
      const fields = [
        "address_components",
        "geometry",
        "place_id",
        "formatted_address",
        "name",
        "types",
      ];
      svc.getDetails(
        { placeId, fields, sessionToken: sessionTokenRef.current },
        (details, status) => {
          if (status === window.google?.maps?.places?.PlacesServiceStatus?.OK)
            resolve(details);
          else resolve(null);
        }
      );
    });

  const getComp = (components, type, key = "long_name") =>
    components?.find((c) => c.types.includes(type))?.[key] || "";

  const parseCityProvince = (details) => {
    const city =
      getComp(details.address_components, "locality") ||
      getComp(details.address_components, "postal_town") ||
      getComp(details.address_components, "administrative_area_level_3") ||
      getComp(details.address_components, "administrative_area_level_2");

    const province = getComp(
      details.address_components,
      "administrative_area_level_1",
      "short_name" // BC, ON...
    );

    const lat = details.geometry?.location?.lat?.();
    const lng = details.geometry?.location?.lng?.();

    return { city, province, lat, lng };
  };

  const displayFromPrediction = (p) => {
    const city = p.structured_formatting?.main_text || "";
    const sec = p.structured_formatting?.secondary_text || ""; // "BC, Canada"
    const prov = sec.replace(/,\s*Canada$/, "");
    return prov ? `${city}, ${prov}` : p.description || city;
  };

  const handleSelect = async (prediction) => {
    suppressFetchRef.current = true;
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    const display = displayFromPrediction(prediction);

    setSelectedPlaceId(prediction.place_id);
    setLastSelectedLabel(display);
    clearErrors?.(id);

    setQuery(display);
    setValue(id, display, { shouldValidate: true, shouldDirty: true });

    setOpen(false);
    setPredictions([]);
    setActiveIndex(-1);

    const details = await fetchDetails(prediction.place_id);
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
        placeId: prediction.place_id,
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
        <div className="mt-2 p-3 bg-blue-100 border border-gray-300 rounded-md">
          {helpTexts}
        </div>
      )}

      {/* visible input */}
      <input
        id={id}
        type="text"
        {...registerRest}
        ref={mergedRef}
        className="w-full rounded-md border border-gray-300 bg-white py-4 px-4 text-lg"
        autoComplete="off"
        value={query || ""} // Ensure value is always a string
        disabled={!isGoogleMapsReady || isLoadingLocation}
        placeholder={
          isLoadingLocation
            ? "Getting your location..."
            : !isGoogleMapsReady
            ? "Loading..."
            : ""
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
            className="absolute z-50 mt-1 w-full max-h-72 overflow-auto rounded-md border border-gray-300 bg-white shadow-lg"
          >
            {loading && (
              <li className="px-4 py-3 text-gray-500 text-sm">Searching…</li>
            )}
            {!loading &&
              predictions.map((p, i) => (
                <li
                  key={p.place_id}
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
                    {p.structured_formatting?.main_text}
                    {p.structured_formatting?.secondary_text
                      ? `, ${p.structured_formatting.secondary_text.replace(
                          /,\s*Canada$/,
                          ""
                        )}`
                      : ""}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </div>
  );
}
