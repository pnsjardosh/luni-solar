export function getApiBaseUrl() {
  const runtimeConfig = window.LUNI_SOLAR_CONFIG || {};
  if (typeof runtimeConfig.apiBaseUrl === "string" && runtimeConfig.apiBaseUrl.trim()) {
    return runtimeConfig.apiBaseUrl.replace(/\/$/, "");
  }

  const configured = document.querySelector("meta[name='luni-solar-api-base']")?.getAttribute("content") || "";
  if (configured.trim()) return configured.trim().replace(/\/$/, "");

  if (window.location.hostname.endsWith("github.io")) {
    return "";
  }

  return "";
}

