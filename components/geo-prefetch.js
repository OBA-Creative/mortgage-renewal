"use client";

import { useEffect } from "react";
import { prefetchLocation } from "@/lib/geoip";

/**
 * Fires IP geolocation once on app load and caches it in sessionStorage.
 * Renders nothing.
 */
export default function GeoPrefetch() {
  useEffect(() => {
    prefetchLocation();
  }, []);
  return null;
}
