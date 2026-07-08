"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hash-based URL router for single-page apps.
 *
 * Enables bookmarkable, shareable URLs with working browser back/forward.
 * Format: #/section?param=value
 *
 * Examples:
 *   #/home          → { section: "home", params: {} }
 *   #/trade?coin=BTC → { section: "trade", params: { coin: "BTC" } }
 *   #/admin/users    → { section: "users", params: {} }
 *
 * On first load with no hash, falls back to `defaultSection`.
 */
export interface HashRoute {
  section: string;
  params: URLSearchParams;
}

function parseHash(defaultSection: string): HashRoute {
  if (typeof window === "undefined") return { section: defaultSection, params: new URLSearchParams() };

  const hash = window.location.hash.slice(1); // remove #
  if (!hash) return { section: defaultSection, params: new URLSearchParams() };

  // Split path and query: /trade?coin=BTC
  const [path, query] = hash.split("?");
  const section = path.replace(/^\//, "") || defaultSection;
  const params = new URLSearchParams(query || "");

  return { section, params };
}

export function useHashRoute(defaultSection: string) {
  const [route, setRoute] = useState<HashRoute>(() => parseHash(defaultSection));

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(defaultSection));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [defaultSection]);

  // Navigate to a new section with optional params
  const navigate = useCallback((section: string, params?: Record<string, string>) => {
    let hash = `#/${section}`;
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      hash += `?${searchParams.toString()}`;
    }
    if (window.location.hash === hash) {
      // Same hash — just update state to force re-render
      setRoute(parseHash(defaultSection));
    } else {
      window.location.hash = hash;
    }
  }, [defaultSection]);

  return { route, navigate };
}

/** Helper to build a hash URL for display or links */
export function buildHashUrl(section: string, params?: Record<string, string>): string {
  let hash = `#/${section}`;
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    hash += `?${searchParams.toString()}`;
  }
  return hash;
}
