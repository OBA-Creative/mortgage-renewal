// Browser-side IP geolocation with sessionStorage cache.
// Prefetched once on app load; components read synchronously from cache.

const STORAGE_KEY = "geoip:v1";

const CA_PROVINCE_CODES = {
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

let inFlight = null;

export function getCachedLocation() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function prefetchLocation() {
  if (typeof window === "undefined") return Promise.resolve(null);

  const cached = getCachedLocation();
  if (cached) return Promise.resolve(cached);
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const response = await fetch("https://get.geojs.io/v1/ip/geo.json", {
        cache: "no-store",
      });
      if (!response.ok) return null;
      const data = await response.json();

      const provinceCode =
        data?.country_code === "CA"
          ? CA_PROVINCE_CODES[data.region] || null
          : data.region || null;

      if (!data?.city || !provinceCode || !data.country_code) return null;

      const loc = {
        city: data.city,
        province: provinceCode,
        formatted: `${data.city}, ${provinceCode}`,
        country: data.country_code,
      };

      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
      } catch {
        // sessionStorage may be unavailable (private mode, quota); ignore
      }
      return loc;
    } catch {
      return null;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}
