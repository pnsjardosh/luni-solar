export function readInitialState(defaults) {
  const params = new URLSearchParams(window.location.search);
  const lat = Number.parseFloat(params.get("lat"));
  const lon = Number.parseFloat(params.get("lon"));
  const at = params.get("at");

  return {
    locationName: params.get("loc") || defaults.locationName,
    lat: Number.isFinite(lat) ? lat : defaults.lat,
    lon: Number.isFinite(lon) ? lon : defaults.lon,
    date: at ? new Date(at) : new Date()
  };
}

let lastUrlWrite = 0;

export function writeAppStateToUrl(state, force = false) {
  const now = performance.now();
  if (!force && now - lastUrlWrite < 1200) return;
  lastUrlWrite = now;

  const params = new URLSearchParams(window.location.search);
  params.set("loc", state.locationName);
  params.set("lat", Number(state.lat).toFixed(4));
  params.set("lon", Number(state.lon).toFixed(4));
  params.set("at", state.date.toISOString());

  const nextUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState(null, "", nextUrl);
}
