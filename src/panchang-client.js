const cache = new Map();
const MAX_CACHE_ENTRIES = 288;

function cacheKey({ date, location, timeZone, tradition }) {
  const bucket = Math.floor(date.getTime() / (5 * 60 * 1000));
  return `${bucket}:${location.lat.toFixed(4)}:${location.lon.toFixed(4)}:${timeZone || ""}:${tradition}`;
}

export async function fetchProductionPanchang({ config, date, location, timeZone }) {
  if (config?.mode !== "production") return null;
  const tradition = config.tradition || "gujarati-vikram";
  const key = cacheKey({ date, location, timeZone, tradition });
  if (cache.has(key)) return cache.get(key);

  const base = config.apiBase || "";
  const url = new URL(`${base}/api/panchang`, window.location.origin);
  url.searchParams.set("lat", location.lat.toFixed(6));
  url.searchParams.set("lon", location.lon.toFixed(6));
  url.searchParams.set("at", date.toISOString());
  url.searchParams.set("tradition", tradition);
  if (timeZone) url.searchParams.set("tz", timeZone);

  const promise = fetch(url.toString(), { headers: { Accept: "application/json" } })
    .then((response) => {
      if (!response.ok) throw new Error(`Panchang API failed: ${response.status}`);
      return response.json();
    })
    .catch(() => null);
  if (cache.has(key)) cache.delete(key);
  cache.set(key, promise);
  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  return promise;
}
