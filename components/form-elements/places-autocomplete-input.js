"use client";

import { useEffect, useRef, useState } from "react";

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
}) {
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [lastSelectedLabel, setLastSelectedLabel] = useState("");

  const sessionTokenRef = useRef(null);
  const timeoutIdRef = useRef(null);
  const suppressFetchRef = useRef(false);

  const rules = requiredText ? { required: requiredText } : undefined;
  const { ref: registerRef, ...registerRest } = register(id, rules);
  const mergedRef = (el) => {
    inputRef.current = el;
    registerRef(el);
  };

  const ensureSessionToken = () => {
    if (window?.google && !sessionTokenRef.current) {
      sessionTokenRef.current =
        new window.google.maps.places.AutocompleteSessionToken();
    }
  };

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
    if (!window?.google) return;

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
            status === window.google.maps.places.PlacesServiceStatus.OK &&
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
  }, [query, country]);

  const fetchDetails = (placeId) =>
    new Promise((resolve) => {
      if (!window?.google) return resolve(null);
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
          if (status === window.google.maps.places.PlacesServiceStatus.OK)
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
      <label htmlFor={id} className="text-xl font-semibold">
        {label}
      </label>

      {/* visible input */}
      <input
        id={id}
        type="text"
        {...registerRest}
        ref={mergedRef}
        className="w-full rounded-md border border-gray-300 bg-white py-4 px-4 text-lg"
        autoComplete="off"
        value={query}
        onChange={(e) => {
          const v = e.target.value;
          setQuery(v);
          setValue(id, v, { shouldDirty: true });
          if (!open) setOpen(true);

          // user typed -> invalidate prior selection & clear hidden province
          if (selectedPlaceId) setSelectedPlaceId(null);
          if (provinceFieldId)
            setValue(provinceFieldId, "", { shouldDirty: true });

          setError?.(id, {
            type: "manual",
            message: "Please select a city from the suggestions",
          });
        }}
        onFocus={() => {
          if (predictions.length) setOpen(true);
        }}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        placeholder=""
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
