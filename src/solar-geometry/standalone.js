import { initSolarGeometryTimeline, updateSolarGeometryPanel } from "./view.js";

const locationInput = document.querySelector("#solarStandaloneLocation");
const latInput = document.querySelector("#solarStandaloneLat");
const lonInput = document.querySelector("#solarStandaloneLon");
const dateInput = document.querySelector("#solarStandaloneDate");
const timeInput = document.querySelector("#solarStandaloneTime");
const nowButton = document.querySelector("#solarStandaloneNow");

function pad(value) {
  return String(value).padStart(2, "0");
}

function toLocalDateInputValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toLocalTimeInputValue(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function parseStandaloneDate() {
  const dateValue = dateInput?.value;
  const timeValue = timeInput?.value || "00:00:00";
  if (!dateValue) return new Date();
  const normalizedTime = timeValue.length === 5 ? `${timeValue}:00` : timeValue;
  const parsed = new Date(`${dateValue}T${normalizedTime}`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function readLocation() {
  const lat = Number.parseFloat(latInput?.value);
  const lon = Number.parseFloat(lonInput?.value);
  return {
    name: locationInput?.value?.trim() || "Selected location",
    lat: Number.isFinite(lat) ? lat : 0,
    lon: Number.isFinite(lon) ? lon : 0
  };
}

function formatDateTime(date) {
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function syncInputsFromDate(date) {
  if (dateInput) dateInput.value = toLocalDateInputValue(date);
  if (timeInput) timeInput.value = toLocalTimeInputValue(date);
}

function applyQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const loc = params.get("loc");
  const lat = params.get("lat");
  const lon = params.get("lon");
  const at = params.get("at");
  if (loc && locationInput) locationInput.value = loc;
  if (lat && latInput) latInput.value = lat;
  if (lon && lonInput) lonInput.value = lon;
  syncInputsFromDate(at ? new Date(at) : new Date());
}

function renderStandaloneSolarGeometry() {
  updateSolarGeometryPanel({
    date: parseStandaloneDate(),
    location: readLocation(),
    formatDateTime
  });
}

applyQueryParams();
initSolarGeometryTimeline();
renderStandaloneSolarGeometry();

[locationInput, latInput, lonInput, dateInput, timeInput].forEach((input) => {
  input?.addEventListener("input", renderStandaloneSolarGeometry);
  input?.addEventListener("change", renderStandaloneSolarGeometry);
});

nowButton?.addEventListener("click", () => {
  syncInputsFromDate(new Date());
  renderStandaloneSolarGeometry();
});
