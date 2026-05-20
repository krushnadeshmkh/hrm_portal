import { useState, useEffect, useMemo } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

const cache = {};

function fetchSection(section) {
  if (!cache[section]) {
    cache[section] = {
      data: null,
      promise: axios
        .get(`${API}/api/website-settings/${section}`)
        .then((res) => {
          if (res.data.success) {
            cache[section].data = res.data.data || {};
          } else {
            cache[section].data = {};
          }

          return cache[section].data;
        })
        .catch((err) => {
          console.error(`Settings fetch error [${section}]:`, err);

          cache[section].data = {};

          return {};
        }),
    };
  }

  return cache[section];
}

export function useWebsiteSettings(section) {
  const entry = useMemo(() => fetchSection(section), [section]);

  const [data, setData] = useState(entry.data || {});

  useEffect(() => {
    if (entry.data) return;

    let cancelled = false;

    entry.promise.then((result) => {
      if (!cancelled) {
        setData(result || {});
      }
    });

    return () => {
      cancelled = true;
    };
  }, [entry]);

  return {
    data,
    loading: !entry.data,
  };
}

fetchSection("header");
fetchSection("footer");