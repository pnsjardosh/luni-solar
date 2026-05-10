import { APP_CONFIG } from "./src/config.js";
import { readInitialState, writeAppStateToUrl } from "./src/url-state.js";

const urlParams = new URLSearchParams(window.location.search);
const isEmbedded = urlParams.get("embed") === "1";

if (isEmbedded) {
  document.body.classList.add("embed-mode");
}

const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];
const nakshatraSanskrit = [
  "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशीर्ष", "आर्द्रा", "पुनर्वसु", "पुष्य", "आश्लेषा",
  "मघा", "पूर्व फाल्गुनी", "उत्तर फाल्गुनी", "हस्त", "चित्रा", "स्वाति", "विशाखा", "अनुराधा", "ज्येष्ठा",
  "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्व भाद्रपदा", "उत्तर भाद्रपदा", "रेवती"
];
const nakshatraCommon = [
  "Beta Arietis region", "Aries region", "Pleiades", "Aldebaran region", "Orion region", "Betelgeuse region", "Gemini region", "Cancer region", "Hydra region",
  "Regulus region", "Leo region", "Denebola region", "Corvus region", "Spica region", "Arcturus region", "Libra region", "Scorpius region", "Antares region",
  "Galactic center region", "Sagittarius region", "Sagittarius-Capricorn region", "Altair region", "Delphinus region", "Aquarius region", "Pegasus region", "Pegasus-Andromeda region", "Pisces region"
];

const rashis = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];
const rashiVedic = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"
];
const rashisHindi = [
  "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"
];

const rashiSigns = ["\u2648\ufe0e", "\u2649\ufe0e", "\u264a\ufe0e", "\u264b\ufe0e", "\u264c\ufe0e", "\u264d\ufe0e", "\u264e\ufe0e", "\u264f\ufe0e", "\u2650\ufe0e", "\u2651\ufe0e", "\u2652\ufe0e", "\u2653\ufe0e"];
const rashiSanskritNames = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"];
const rashiCommon = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

const CHART_SCALE = 3840 / 720;
const CHART = {
  size: 3840,
  center: 1920,
  scale: CHART_SCALE,
  outerRadius: 326 * CHART_SCALE,
  nakshatraInnerRadius: 226 * CHART_SCALE,
  rashiOuterRadius: 222 * CHART_SCALE,
  rashiInnerRadius: 184 * CHART_SCALE,
  starFieldRadius: 210 * CHART_SCALE,
  sunOrbitRadius: 154 * CHART_SCALE,
  moonOrbitRadius: 122 * CHART_SCALE,
  nakshatraLabelRadius: 334 * CHART_SCALE,
  rashiLabelRadius: 202 * CHART_SCALE,
  rashiSymbolRadius: 188 * CHART_SCALE,
  rashiBadgeRadius: 188 * CHART_SCALE
};

const tithis = [
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi", "Amavasya"
];
const tithiCommon = [
  "1st lunar day", "2nd lunar day", "3rd lunar day", "4th lunar day", "5th lunar day", "6th lunar day", "7th lunar day", "8th lunar day", "9th lunar day", "10th lunar day",
  "11th lunar day", "12th lunar day", "13th lunar day", "14th lunar day", "Full moon",
  "1st lunar day", "2nd lunar day", "3rd lunar day", "4th lunar day", "5th lunar day", "6th lunar day", "7th lunar day", "8th lunar day", "9th lunar day", "10th lunar day",
  "11th lunar day", "12th lunar day", "13th lunar day", "14th lunar day", "New moon"
];

const gujaratiMonths = [
  ["Kartak", "Krittika", "Diwali / Bestu Varas"],
  ["Magshar", "Mrigashira", "Gita Jayanti"],
  ["Posh", "Pushya", "Paush Purnima"],
  ["Maha", "Magha", "Maha Shivratri"],
  ["Fagan", "Phalguni", "Holi"],
  ["Chaitra", "Chitra", "Ram Navami"],
  ["Vaishakh", "Vishakha", "Buddha Purnima"],
  ["Jeth", "Jyeshtha", "Ganga Dussehra"],
  ["Ashadh", "Purva Ashadha", "Rath Yatra"],
  ["Shravan", "Shravana", "Raksha Bandhan"],
  ["Bhadarvo", "Purva Bhadrapada", "Ganesh Chaturthi"],
  ["Aaso", "Ashwini", "Navratri / Dussehra"]
];

const svg = document.querySelector("#skyWheel");
const starSvg = document.querySelector("#starChart");
const sunVisual = document.querySelector("#sunVisual");
const wheelWrap = document.querySelector(".wheel-wrap");
const dateInput = document.querySelector("#dateInput");
const nowButton = document.querySelector("#nowButton");
const geoButton = document.querySelector("#geoButton");
const phaseChipVisual = document.querySelector("#phaseChipVisual");
const locationInput = document.querySelector("#locationInput");
const locationResults = document.querySelector("#locationResults");
const manualCoordinates = document.querySelector(".manual-coordinates");
const latInput = document.querySelector("#latInput");
const lonInput = document.querySelector("#lonInput");
const reverseButton = document.querySelector("#reverseButton");
const pauseButton = document.querySelector("#pauseButton");
const forwardButton = document.querySelector("#forwardButton");
const dayBackButton = document.querySelector("#dayBackButton");
const dayForwardButton = document.querySelector("#dayForwardButton");
const earthCore = document.querySelector(".earth-core");
const earthCanvas = document.querySelector("#earthCanvas");
const earthContext = earthCanvas.getContext("2d", { willReadFrequently: true });
const earthTexture = new Image();
earthTexture.src = APP_CONFIG.assets.earthTexture;
let earthTextureData = null;
let earthRenderKey = "";
let playbackTimer = null;
let playbackDirection = 0;
let playbackStep = "minutes";
let playbackFrame = null;
let lastPlaybackTick = 0;
let virtualTime = Date.now();
let lastInputSync = 0;
let lastVisualRender = 0;
const moonImageCache = new Map();
let starsInitialized = false;
let nakshatraSkyInitialized = false;
let embedHeightFrame = null;
let locationSearchTimer = null;
let lastLocationQuery = "";
const nowThresholdMs = 5 * 60000;
let wheelZoom = 1;
let wheelPanX = 0;
let wheelPanY = 0;
let isWheelDragging = false;
let wheelDragStartX = 0;
let wheelDragStartY = 0;
let wheelPanStartX = 0;
let wheelPanStartY = 0;
const locationTimezoneCache = new Map();
const locationTimezonePending = new Set();
const timeZoneFormatterCache = new Map();
const tithiWindowCache = new Map();

const brightStars = [
  { name: "Sirius", ra: 6.7525, dec: -16.7161, mag: -1.46 },
  { name: "Canopus", ra: 6.3992, dec: -52.6957, mag: -0.74 },
  { name: "Arcturus", ra: 14.2610, dec: 19.1825, mag: -0.05 },
  { name: "Vega", ra: 18.6156, dec: 38.7837, mag: 0.03 },
  { name: "Capella", ra: 5.2782, dec: 45.9980, mag: 0.08 },
  { name: "Rigel", ra: 5.2423, dec: -8.2016, mag: 0.13 },
  { name: "Procyon", ra: 7.6550, dec: 5.2250, mag: 0.34 },
  { name: "Betelgeuse", ra: 5.9195, dec: 7.4071, mag: 0.42 },
  { name: "Altair", ra: 19.8464, dec: 8.8683, mag: 0.77 },
  { name: "Aldebaran", ra: 4.5987, dec: 16.5093, mag: 0.85 },
  { name: "Antares", ra: 16.4901, dec: -26.4320, mag: 1.06 },
  { name: "Spica", ra: 13.4199, dec: -11.1613, mag: 0.98 },
  { name: "Pollux", ra: 7.7553, dec: 28.0262, mag: 1.14 },
  { name: "Fomalhaut", ra: 22.9608, dec: -29.6222, mag: 1.16 },
  { name: "Deneb", ra: 20.6905, dec: 45.2803, mag: 1.25 },
  { name: "Regulus", ra: 10.1395, dec: 11.9672, mag: 1.35 },
  { name: "Castor", ra: 7.5767, dec: 31.8883, mag: 1.58 },
  { name: "Shaula", ra: 17.5601, dec: -37.1038, mag: 1.62 },
  { name: "Bellatrix", ra: 5.4189, dec: 6.3497, mag: 1.64 },
  { name: "Elnath", ra: 5.4382, dec: 28.6075, mag: 1.65 },
  { name: "Alnilam", ra: 5.6036, dec: -1.2019, mag: 1.69 },
  { name: "Alnair", ra: 22.1372, dec: -46.9609, mag: 1.74 }
];

const namedStarColors = {
  Sirius: "#d8e5ff",
  Canopus: "#fff0c2",
  Arcturus: "#ffad62",
  Vega: "#dce8ff",
  Capella: "#ffe2a1",
  Rigel: "#c8d9ff",
  Procyon: "#fff1d0",
  Betelgeuse: "#ff7a4e",
  Altair: "#eef5ff",
  Aldebaran: "#ff9a5c",
  Antares: "#ff6950",
  Spica: "#cbdcff",
  Pollux: "#ffd38a",
  Fomalhaut: "#f0f6ff",
  Deneb: "#d8e5ff",
  Regulus: "#dfeaff",
  Castor: "#e8f0ff",
  Shaula: "#cbdcff",
  Bellatrix: "#cbdcff",
  Elnath: "#d9e6ff",
  Alnilam: "#c5d8ff",
  Alnair: "#dce8ff"
};

function toInputValue(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function wrap(value, max = 360) {
  return ((value % max) + max) % max;
}

function sinDeg(value) {
  return Math.sin(value * Math.PI / 180);
}

function cosDeg(value) {
  return Math.cos(value * Math.PI / 180);
}

function asinDeg(value) {
  return Math.asin(Math.max(-1, Math.min(1, value))) * 180 / Math.PI;
}

function atan2Deg(y, x) {
  return Math.atan2(y, x) * 180 / Math.PI;
}

function julianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function lahiriAyanamsha(date) {
  const yearsSinceJ2000 = (julianDay(date) - 2451545) / 365.2425;
  return 23.85675 + yearsSinceJ2000 * 0.013968;
}

function sunLongitude(date) {
  const d = julianDay(date) - 2451545;
  const L = wrap(280.46646 + 0.98564736 * d);
  const g = wrap(357.52911 + 0.98560028 * d);
  const center = 1.914602 * sinDeg(g) + 0.019993 * sinDeg(2 * g) + 0.000289 * sinDeg(3 * g);
  return wrap(L + center);
}

function moonLongitude(date) {
  const d = julianDay(date) - 2451545;
  const L = wrap(218.3164477 + 13.17639648 * d);
  const Mm = wrap(134.9633964 + 13.06499295 * d);
  const Ms = wrap(357.5291092 + 0.98560028 * d);
  const D = wrap(297.8501921 + 12.19074912 * d);
  const F = wrap(93.2720950 + 13.22935024 * d);

  return wrap(
    L +
    6.288774 * sinDeg(Mm) +
    1.274027 * sinDeg(2 * D - Mm) +
    0.658314 * sinDeg(2 * D) +
    0.213618 * sinDeg(2 * Mm) -
    0.185116 * sinDeg(Ms) -
    0.114332 * sinDeg(2 * F) +
    0.058793 * sinDeg(2 * D - 2 * Mm) +
    0.057066 * sinDeg(2 * D - Ms - Mm) +
    0.053322 * sinDeg(2 * D + Mm) +
    0.045758 * sinDeg(2 * D - Ms)
  );
}

function currentLocation() {
  const lat = Number.parseFloat(latInput.value);
  const lon = Number.parseFloat(lonInput.value);
  return {
    name: locationInput.value || "Selected location",
    lat: Number.isFinite(lat) ? lat : APP_CONFIG.defaults.lat,
    lon: Number.isFinite(lon) ? lon : APP_CONFIG.defaults.lon
  };
}

function formatCoordinate(value, axis) {
  const positive = axis === "lat" ? "N" : "E";
  const negative = axis === "lat" ? "S" : "W";
  const direction = value >= 0 ? positive : negative;
  return `${Math.abs(value).toFixed(4)}° ${direction}`;
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatWindow(start, end) {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function formatLocationClock(date, location) {
  const key = locationCacheKey(location);
  const locationTimeZone = locationTimezoneCache.get(key);
  if (locationTimeZone) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: locationTimeZone });
  }
  const shifted = new Date(date.getTime() + localUtcOffsetMinutes(date, location) * 60000);
  return shifted.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
}

function formatLocationDateTime(date, location) {
  const key = locationCacheKey(location);
  const locationTimeZone = locationTimezoneCache.get(key);
  if (locationTimeZone) {
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: locationTimeZone
    });
  }
  const shifted = new Date(date.getTime() + localUtcOffsetMinutes(date, location) * 60000);
  return shifted.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC"
  });
}

function timezoneStatus(date, location) {
  const key = locationCacheKey(location);
  const locationTimeZone = locationTimezoneCache.get(key);
  if (locationTimeZone) {
    const profile = detectTimeProfileForZone(date, locationTimeZone);
    return `Location timezone (${locationTimeZone}, UTC${profile.activeOffset >= 0 ? "+" : ""}${(profile.activeOffset / 60).toFixed(profile.activeOffset % 60 === 0 ? 0 : 1)}${profile.dstActive ? ", DST" : ""})`;
  }
  if (APP_CONFIG.time?.autoDetectFromBrowser) {
    const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Browser";
    const profile = detectBrowserTimeProfile(date);
    return `Browser fallback (${browserZone}, UTC${profile.activeOffset >= 0 ? "+" : ""}${(profile.activeOffset / 60).toFixed(profile.activeOffset % 60 === 0 ? 0 : 1)}${profile.dstActive ? ", DST" : ""})`;
  }
  const approx = Math.round(location.lon * 4);
  return `Longitude fallback (UTC${approx >= 0 ? "+" : ""}${(approx / 60).toFixed(approx % 60 === 0 ? 0 : 1)})`;
}

function localSiderealTime(date, lon) {
  const jd = julianDay(date);
  const t = (jd - 2451545.0) / 36525;
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * t * t - (t * t * t) / 38710000;
  return wrap(gmst + lon);
}

function equatorialToAltAz(star, date, location) {
  const lst = localSiderealTime(date, location.lon);
  const hourAngle = wrap(lst - star.ra * 15 + 180) - 180;
  const alt = asinDeg(
    sinDeg(star.dec) * sinDeg(location.lat) +
    cosDeg(star.dec) * cosDeg(location.lat) * cosDeg(hourAngle)
  );
  const az = wrap(atan2Deg(
    -sinDeg(hourAngle),
    Math.tan(star.dec * Math.PI / 180) * cosDeg(location.lat) - sinDeg(location.lat) * cosDeg(hourAngle)
  ));
  return { alt, az };
}

function equatorialToSiderealEcliptic(star, date) {
  const epsilon = 23.4393;
  const ra = star.ra * 15;
  const dec = star.dec;
  const y = sinDeg(ra) * cosDeg(epsilon) + Math.tan(dec * Math.PI / 180) * sinDeg(epsilon);
  const x = cosDeg(ra);
  const lonTropical = wrap(atan2Deg(y, x));
  const lat = asinDeg(sinDeg(dec) * cosDeg(epsilon) - cosDeg(dec) * sinDeg(epsilon) * sinDeg(ra));
  return {
    lon: wrap(lonTropical - lahiriAyanamsha(date)),
    lat
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function starColorFromIndex(ci, spect = "") {
  const spectralType = spect.trim().charAt(0).toUpperCase();
  if (!Number.isFinite(ci)) {
    const fallback = {
      O: "#9db8ff",
      B: "#b7c9ff",
      A: "#d8e5ff",
      F: "#fff2d0",
      G: "#ffd98e",
      K: "#ffb15f",
      M: "#ff744d"
    };
    return fallback[spectralType] || "#eef7ff";
  }

  if (ci < -0.05) return "#aac2ff";
  if (ci < 0.25) return "#d6e4ff";
  if (ci < 0.55) return "#fff3d2";
  if (ci < 0.9) return "#ffd28a";
  if (ci < 1.45) return "#ff9b5f";
  return "#ff6f52";
}

function starVisual(star, active = false) {
  const mag = Number.isFinite(star.mag) ? star.mag : 4.5;
  const color = starColorFromIndex(star.ci, star.spect);
  const brightness = clamp((6.2 - mag) / 6.6, 0.1, 1.25);
  const radius = clamp((1.05 + brightness * 5.6) * CHART.scale, 5.5, 43);
  const glow = clamp((8 + brightness * 28) * CHART.scale / 5.333, 10, 52);
  return {
    color,
    radius: active ? radius * 1.12 : radius,
    glow: active ? glow * 1.28 : glow,
    glowColor: color,
    opacity: clamp(0.28 + brightness * 0.82, 0.3, 1)
  };
}

function sunDeclination(date) {
  const lambda = sunLongitude(date);
  const epsilon = 23.4393;
  return asinDeg(sinDeg(epsilon) * sinDeg(lambda));
}

function subsolarPoint(date) {
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600 + date.getUTCMilliseconds() / 3600000;
  return {
    lat: sunDeclination(date),
    lon: wrap(180 - utcHours * 15 + 180) - 180
  };
}

function localSunAltitude(date, location) {
  const subsolar = subsolarPoint(date);
  const hourAngle = wrap(location.lon - subsolar.lon + 180) - 180;
  return asinDeg(
    sinDeg(location.lat) * sinDeg(subsolar.lat) +
    cosDeg(location.lat) * cosDeg(subsolar.lat) * cosDeg(hourAngle)
  );
}

function earthViewCenter(location) {
  return {
    lat: clamp(location.lat, -75, 75),
    lon: location.lon
  };
}

function projectLocationOnGlobe(location, view) {
  const lat = location.lat * Math.PI / 180;
  const lon = location.lon * Math.PI / 180;
  const lat0 = view.lat * Math.PI / 180;
  const lon0 = view.lon * Math.PI / 180;
  const dLon = lon - lon0;
  const x = Math.cos(lat) * Math.sin(dLon);
  const y = Math.sin(lat) * Math.cos(lat0) - Math.cos(lat) * Math.sin(lat0) * Math.cos(dLon);
  const z = Math.sin(lat) * Math.sin(lat0) + Math.cos(lat) * Math.cos(lat0) * Math.cos(dLon);

  return {
    x: 50 + x * 48,
    y: 50 - y * 48,
    visible: z > 0
  };
}

function formatRashiName(index) {
  return `${rashis[index]} / ${rashiVedic[index]} / ${rashiSanskritNames[index]}`;
}

function updateEarthCore(date, location) {
  renderEarthGlobe(date, location);
  const marker = projectLocationOnGlobe(location, earthViewCenter(location));
  earthCore.style.setProperty("--marker-x", `${marker.x}%`);
  earthCore.style.setProperty("--marker-y", `${marker.y}%`);
  earthCore.style.setProperty("--marker-opacity", marker.visible ? "1" : "0.18");
  earthCore.style.setProperty("--earth-tilt", "0deg");
  earthCore.style.setProperty("--pin-counter-tilt", "45deg");
}

function updateSunVisual(state) {
  const [x, y] = polar(CHART.center, CHART.center, CHART.sunOrbitRadius, state.sun);
  sunVisual.style.setProperty("--sun-left", `${x / CHART.size * 100}%`);
  sunVisual.style.setProperty("--sun-top", `${y / CHART.size * 100}%`);
  if (wheelWrap) {
    wheelWrap.style.setProperty("--sun-left", `${x / CHART.size * 100}%`);
    wheelWrap.style.setProperty("--sun-top", `${y / CHART.size * 100}%`);
  }
}

function updateTransportButton() {
  const playing = playbackDirection !== 0;
  pauseButton.innerHTML = playing
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14"></path><path d="M16 5v14"></path></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7Z"></path></svg>';
  pauseButton.title = playing ? "Pause" : "Play";
  pauseButton.setAttribute("aria-label", playing ? "Pause" : "Play");
}

function notifyParentHeight() {
  if (!isEmbedded || window.parent === window) return;
  if (embedHeightFrame) cancelAnimationFrame(embedHeightFrame);
  embedHeightFrame = requestAnimationFrame(() => {
    const height = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );
    window.parent.postMessage({ type: "luni-solar:resize", height }, "*");
  });
}

function ensureEarthTexture() {
  if (earthTextureData || !earthTexture.complete || earthTexture.naturalWidth === 0) return earthTextureData;
  const offscreen = document.createElement("canvas");
  offscreen.width = earthTexture.naturalWidth;
  offscreen.height = earthTexture.naturalHeight;
  const context = offscreen.getContext("2d", { willReadFrequently: true });
  context.drawImage(earthTexture, 0, 0);
  earthTextureData = {
    width: offscreen.width,
    height: offscreen.height,
    pixels: context.getImageData(0, 0, offscreen.width, offscreen.height).data
  };
  return earthTextureData;
}

function renderEarthGlobe(date, location) {
  const texture = ensureEarthTexture();
  if (!texture) return;

  const coarseTime = Math.floor(date.getTime() / 600000);
  const view = earthViewCenter(location);
  const key = `${view.lat.toFixed(2)}:${view.lon.toFixed(2)}:${coarseTime}`;
  if (key === earthRenderKey) return;
  earthRenderKey = key;

  const size = earthCanvas.width;
  const radius = size * 0.48;
  const center = size / 2;
  const output = earthContext.createImageData(size, size);
  const lat0 = view.lat * Math.PI / 180;
  const lon0 = view.lon * Math.PI / 180;
  const sinLat0 = Math.sin(lat0);
  const cosLat0 = Math.cos(lat0);
  const sun = subsolarPoint(date);
  const sunLat = sun.lat * Math.PI / 180;
  const sunLon = sun.lon * Math.PI / 180;
  const sunVector = [
    Math.cos(sunLat) * Math.cos(sunLon),
    Math.cos(sunLat) * Math.sin(sunLon),
    Math.sin(sunLat)
  ];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x + 0.5 - center) / radius;
      const dy = (y + 0.5 - center) / radius;
      const rho2 = dx * dx + dy * dy;
      const out = (y * size + x) * 4;

      if (rho2 > 1) {
        output.data[out + 3] = 0;
        continue;
      }

      const z = Math.sqrt(1 - rho2);
      const lat = Math.asin(z * sinLat0 - dy * cosLat0);
      const lon = lon0 + Math.atan2(dx, z * cosLat0 + dy * sinLat0);
      const lonWrapped = ((lon + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;

      const u = Math.floor((lonWrapped + Math.PI) / (Math.PI * 2) * (texture.width - 1));
      const v = Math.floor((Math.PI / 2 - lat) / Math.PI * (texture.height - 1));
      const source = (v * texture.width + u) * 4;

      const surfaceVector = [
        Math.cos(lat) * Math.cos(lonWrapped),
        Math.cos(lat) * Math.sin(lonWrapped),
        Math.sin(lat)
      ];
      const sunDot = surfaceVector[0] * sunVector[0] + surfaceVector[1] * sunVector[1] + surfaceVector[2] * sunVector[2];
      const day = Math.max(0, Math.min(1, (sunDot + 0.08) / 0.24));
      const limb = Math.max(0, Math.min(1, z));
      const shade = (0.18 + day * 0.86) * (0.58 + limb * 0.48);
      const nightBlue = 20 + day * 0;

      output.data[out] = Math.min(255, texture.pixels[source] * shade + nightBlue * (1 - day));
      output.data[out + 1] = Math.min(255, texture.pixels[source + 1] * shade + 30 * (1 - day));
      output.data[out + 2] = Math.min(255, texture.pixels[source + 2] * shade + 52 * (1 - day));
      output.data[out + 3] = 255;
    }
  }

  earthContext.clearRect(0, 0, size, size);
  earthContext.putImageData(output, 0, 0);
}

function polar(cx, cy, radius, angle) {
  const rad = (angle - 90) * Math.PI / 180;
  return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
}

function arcPath(cx, cy, inner, outer, start, end) {
  const [o1x, o1y] = polar(cx, cy, outer, start);
  const [o2x, o2y] = polar(cx, cy, outer, end);
  const [i2x, i2y] = polar(cx, cy, inner, end);
  const [i1x, i1y] = polar(cx, cy, inner, start);
  const large = end - start > 180 ? 1 : 0;
  return `M ${o1x} ${o1y} A ${outer} ${outer} 0 ${large} 1 ${o2x} ${o2y} L ${i2x} ${i2y} A ${inner} ${inner} 0 ${large} 0 ${i1x} ${i1y} Z`;
}

function arcLinePath(cx, cy, radius, start, end) {
  const [x1, y1] = polar(cx, cy, radius, start);
  const [x2, y2] = polar(cx, cy, radius, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
}

function lunarAngle(date) {
  return wrap(moonLongitude(date) - sunLongitude(date));
}

function findAdjacentNewMoon(date, direction) {
  const step = 12 * 3600000 * direction;
  let end = new Date(date);
  let endAngle = lunarAngle(end);

  for (let i = 0; i < 80; i += 1) {
    const start = new Date(end.getTime() - step);
    const startAngle = lunarAngle(start);
    const crossed = direction > 0 ? startAngle > endAngle : startAngle < endAngle;
    if (crossed) {
      let low = direction > 0 ? start : end;
      let high = direction > 0 ? end : start;
      for (let j = 0; j < 24; j += 1) {
        const mid = new Date((low.getTime() + high.getTime()) / 2);
        const lowAngle = lunarAngle(low);
        const midAngle = lunarAngle(mid);
        if (lowAngle > midAngle) high = mid;
        else low = mid;
      }
      return new Date((low.getTime() + high.getTime()) / 2);
    }
    end = start;
    endAngle = startAngle;
  }

  return new Date(date.getTime() + direction * 29.53 * 86400000);
}

function isAdhikMonth(date) {
  const previousNewMoon = findAdjacentNewMoon(date, -1);
  const nextNewMoon = findAdjacentNewMoon(date, 1);
  const previousSunRashi = Math.floor(wrap(sunLongitude(previousNewMoon) - lahiriAyanamsha(previousNewMoon)) / 30);
  const nextSunRashi = Math.floor(wrap(sunLongitude(nextNewMoon) - lahiriAyanamsha(nextNewMoon)) / 30);
  return previousSunRashi === nextSunRashi;
}

function approximateState(date) {
  const sunTropical = sunLongitude(date);
  const moonTropical = moonLongitude(date);
  const ayanamsha = lahiriAyanamsha(date);
  const sun = wrap(sunTropical - ayanamsha);
  const moon = wrap(moonTropical - ayanamsha);
  const angle = wrap(moonTropical - sunTropical);
  const tithiIndex = Math.floor(angle / 12);
  const nakIndex = Math.floor(moon / (360 / 27));
  const sunRashiIndex = Math.floor(sun / 30);
  const moonRashiIndex = Math.floor(moon / 30);
  const monthIndex = Math.floor(wrap(sun + 195) / 30);

  return {
    sun,
    moon,
    angle,
    tithiIndex,
    nakIndex,
    sunRashiIndex,
    moonRashiIndex,
    monthIndex,
    isAdhikMonth: isAdhikMonth(date),
    paksha: tithiIndex < 15 ? "Shukla Paksha" : "Krishna Paksha",
    phase: angle < 20 || angle > 340 ? "New Moon" : angle < 170 ? "Waxing Moon" : angle < 190 ? "Full Moon" : "Waning Moon"
  };
}

function tithiIndexAt(date) {
  const angle = wrap(moonLongitude(date) - sunLongitude(date));
  return Math.floor(angle / 12);
}

function findTithiBoundary(anchorDate, direction, currentTithi) {
  const hourMs = 60 * 60 * 1000;
  let near = new Date(anchorDate);
  for (let i = 0; i < 96; i += 1) {
    const probe = new Date(near.getTime() + direction * hourMs);
    if (tithiIndexAt(probe) !== currentTithi) {
      let lo;
      let hi;
      if (direction > 0) {
        lo = near.getTime();
        hi = probe.getTime();
        while (hi - lo > 1000) {
          const mid = Math.floor((lo + hi) / 2);
          if (tithiIndexAt(new Date(mid)) === currentTithi) lo = mid;
          else hi = mid;
        }
        return new Date(hi);
      }
      lo = probe.getTime();
      hi = near.getTime();
      while (hi - lo > 1000) {
        const mid = Math.floor((lo + hi) / 2);
        if (tithiIndexAt(new Date(mid)) === currentTithi) hi = mid;
        else lo = mid;
      }
      return new Date(hi);
    }
    near = probe;
  }
  return new Date(anchorDate);
}

function currentTithiWindow(date) {
  const state = approximateState(date);
  const cacheKey = `${state.tithiIndex}:${Math.floor(date.getTime() / (6 * 60 * 60 * 1000))}`;
  const cached = tithiWindowCache.get(cacheKey);
  if (cached) return cached;
  const start = findTithiBoundary(date, -1, state.tithiIndex);
  const end = findTithiBoundary(date, 1, state.tithiIndex);
  const window = { start, end, tithiIndex: state.tithiIndex };
  tithiWindowCache.set(cacheKey, window);
  return window;
}

function moonPhaseVisual(angle) {
  const illuminated = (1 - Math.cos(angle * Math.PI / 180)) / 2;
  const stop = Math.round(illuminated * 100);
  const waxing = angle < 180;
  return {
    illuminated,
    stop,
    lit: waxing ? "#f4f1e7" : "#44505f",
    dark: waxing ? "#44505f" : "#f4f1e7"
  };
}

function dayOfYearUtc(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((current - start) / 86400000);
}

function locationCacheKey(location) {
  return `${location.lat.toFixed(3)}:${location.lon.toFixed(3)}`;
}

function getTimeZoneFormatter(timeZone) {
  if (timeZoneFormatterCache.has(timeZone)) return timeZoneFormatterCache.get(timeZone);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  timeZoneFormatterCache.set(timeZone, formatter);
  return formatter;
}

function offsetMinutesForTimeZone(date, timeZone) {
  const formatter = getTimeZoneFormatter(timeZone);
  const parts = formatter.formatToParts(date);
  const values = {};
  parts.forEach((part) => {
    if (part.type !== "literal") values[part.type] = part.value;
  });
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );
  return Math.round((asUtc - date.getTime()) / 60000);
}

function nthWeekdayOfMonth(year, monthOneBased, weekday, week) {
  const month = monthOneBased - 1;
  const firstDay = new Date(Date.UTC(year, month, 1));
  const firstWeekday = firstDay.getUTCDay();
  const firstOccurrence = 1 + ((7 + weekday - firstWeekday) % 7);
  if (week === 5) {
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    let day = firstOccurrence;
    while (day + 7 <= lastDay) day += 7;
    return day;
  }
  return firstOccurrence + (week - 1) * 7;
}

function browserOffsetMinutesAt(date) {
  return -new Date(date).getTimezoneOffset();
}

function detectTimeProfileForZone(date, timeZone) {
  const year = date.getFullYear();
  const january = new Date(Date.UTC(year, 0, 1, 12, 0, 0, 0));
  const july = new Date(Date.UTC(year, 6, 1, 12, 0, 0, 0));
  const janOffset = offsetMinutesForTimeZone(january, timeZone);
  const julOffset = offsetMinutesForTimeZone(july, timeZone);
  const standardOffset = Math.min(janOffset, julOffset);
  const activeOffset = offsetMinutesForTimeZone(date, timeZone);
  const dstOffsetMinutes = Math.max(0, activeOffset - standardOffset);
  return {
    standardOffset,
    activeOffset,
    dstActive: dstOffsetMinutes > 0,
    dstOffsetMinutes
  };
}

function detectBrowserTimeProfile(date) {
  const year = date.getFullYear();
  const january = new Date(year, 0, 1, 12, 0, 0, 0);
  const july = new Date(year, 6, 1, 12, 0, 0, 0);
  const janOffset = browserOffsetMinutesAt(january);
  const julOffset = browserOffsetMinutesAt(july);
  const standardOffset = Math.min(janOffset, julOffset);
  const activeOffset = browserOffsetMinutesAt(date);
  const dstOffsetMinutes = Math.max(0, activeOffset - standardOffset);
  return {
    standardOffset,
    activeOffset,
    dstActive: dstOffsetMinutes > 0,
    dstOffsetMinutes
  };
}

async function ensureLocationTimeZone(location) {
  const key = locationCacheKey(location);
  if (locationTimezoneCache.has(key) || locationTimezonePending.has(key)) return;
  locationTimezonePending.add(key);
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", location.lat.toFixed(4));
    url.searchParams.set("longitude", location.lon.toFixed(4));
    url.searchParams.set("current", "temperature_2m");
    url.searchParams.set("timezone", "auto");
    const response = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("timezone lookup failed");
    const data = await response.json();
    if (data?.timezone && typeof data.timezone === "string") {
      locationTimezoneCache.set(key, data.timezone);
      render();
    }
  } catch {
    // Ignore timezone lookup failures and keep fallback behavior.
  } finally {
    locationTimezonePending.delete(key);
  }
}

function baseUtcOffsetMinutes(location) {
  const key = locationCacheKey(location);
  const locationTimeZone = locationTimezoneCache.get(key);
  if (locationTimeZone) {
    return detectTimeProfileForZone(new Date(), locationTimeZone).standardOffset;
  }
  if (APP_CONFIG.time?.autoDetectFromBrowser) {
    const nowProfile = detectBrowserTimeProfile(new Date());
    return nowProfile.standardOffset;
  }
  if (Number.isFinite(APP_CONFIG.time?.utcOffsetMinutes)) return APP_CONFIG.time.utcOffsetMinutes;
  return Math.round(location.lon * 4);
}

function isDstActive(date, location, baseOffsetMinutes) {
  const key = locationCacheKey(location);
  const locationTimeZone = locationTimezoneCache.get(key);
  if (locationTimeZone) {
    return detectTimeProfileForZone(date, locationTimeZone).dstActive;
  }
  if (APP_CONFIG.time?.autoDetectFromBrowser) {
    return detectBrowserTimeProfile(date).dstActive;
  }
  const dstConfig = APP_CONFIG.time?.dst;
  if (!dstConfig?.enabled) return false;
  const localStandard = new Date(date.getTime() + baseOffsetMinutes * 60000);
  const year = localStandard.getUTCFullYear();

  const startDay = nthWeekdayOfMonth(year, dstConfig.start.month, dstConfig.start.weekday, dstConfig.start.week);
  const endDay = nthWeekdayOfMonth(year, dstConfig.end.month, dstConfig.end.weekday, dstConfig.end.week);
  const startLocal = Date.UTC(year, dstConfig.start.month - 1, startDay, dstConfig.start.hour, 0, 0, 0);
  const endLocal = Date.UTC(year, dstConfig.end.month - 1, endDay, dstConfig.end.hour, 0, 0, 0);
  const localStandardMs = localStandard.getTime();

  if (startLocal < endLocal) return localStandardMs >= startLocal && localStandardMs < endLocal;
  return localStandardMs >= startLocal || localStandardMs < endLocal;
}

function localUtcOffsetMinutes(date, location) {
  const key = locationCacheKey(location);
  const locationTimeZone = locationTimezoneCache.get(key);
  if (locationTimeZone) {
    return detectTimeProfileForZone(date, locationTimeZone).activeOffset;
  }
  if (APP_CONFIG.time?.autoDetectFromBrowser) {
    return detectBrowserTimeProfile(date).activeOffset;
  }
  const base = baseUtcOffsetMinutes(location);
  if (isDstActive(date, location, base)) return base + (APP_CONFIG.time?.dst?.offsetMinutes || 60);
  return base;
}

function solarEventMinutes(date, location, isSunrise) {
  const zenith = 90.833;
  const n = dayOfYearUtc(date);
  const lngHour = location.lon / 15;
  const t = n + ((isSunrise ? 6 : 18) - lngHour) / 24;
  const m = (0.9856 * t) - 3.289;
  let l = wrap(m + 1.916 * sinDeg(m) + 0.020 * sinDeg(2 * m) + 282.634);
  let ra = atan2Deg(0.91764 * Math.tan(l * Math.PI / 180), 1);
  ra = wrap(ra);
  const lQuadrant = Math.floor(l / 90) * 90;
  const raQuadrant = Math.floor(ra / 90) * 90;
  ra = (ra + lQuadrant - raQuadrant) / 15;

  const sinDec = 0.39782 * sinDeg(l);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (cosDeg(zenith) - sinDec * sinDeg(location.lat)) / (cosDec * cosDeg(location.lat));
  if (cosH > 1 || cosH < -1) return null;

  let h = isSunrise ? 360 - Math.acos(cosH) * 180 / Math.PI : Math.acos(cosH) * 180 / Math.PI;
  h /= 15;
  const localMean = h + ra - (0.06571 * t) - 6.622;
  const utcHours = wrap(localMean - lngHour, 24);
  return wrap(utcHours * 60 + localUtcOffsetMinutes(date, location), 1440);
}

function formatMinutes(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return "--";
  const minutes = Math.round(wrap(totalMinutes, 1440));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function formatMinuteWindow(start, end) {
  return `${formatMinutes(start)} - ${formatMinutes(end)}`;
}

function locationDayMinute(date, location) {
  const minutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  return wrap(minutes + localUtcOffsetMinutes(date, location), 1440);
}

function locationWeekday(date, location) {
  return new Date(date.getTime() + localUtcOffsetMinutes(date, location) * 60000).getUTCDay();
}

const chaughadiaLabels = {
  Amrit: { quality: "Favorable", tone: "good", meaning: "Highly auspicious period for important actions." },
  Shubh: { quality: "Favorable", tone: "good", meaning: "Good for ceremonies, meetings, and starts." },
  Labh: { quality: "Gainful", tone: "good", meaning: "Good for finance, trade, and practical progress." },
  Char: { quality: "Movable", tone: "neutral", meaning: "Supports travel, movement, and dynamic tasks." },
  Udveg: { quality: "Avoid", tone: "avoid", meaning: "Restless period; avoid high-stakes new beginnings." },
  Kaal: { quality: "Avoid", tone: "avoid", meaning: "Traditionally inauspicious for major starts." },
  Rog: { quality: "Avoid", tone: "avoid", meaning: "Traditionally linked with obstacles and strain." }
};

const dayChaughadia = [
  ["Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg"],
  ["Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit"],
  ["Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog"],
  ["Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh"],
  ["Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh"],
  ["Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char"],
  ["Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal"]
];

const nightChaughadia = [
  ["Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh"],
  ["Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char"],
  ["Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal"],
  ["Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg"],
  ["Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit"],
  ["Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char", "Rog"],
  ["Labh", "Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh"]
];

const rahuSegments = [8, 2, 7, 5, 6, 4, 3];
const yamagandaSegments = [5, 4, 3, 2, 1, 7, 6];
const gulikaSegments = [7, 6, 5, 4, 3, 2, 1];

function segmentWindow(start, length, oneBasedIndex) {
  const segmentStart = start + length * (oneBasedIndex - 1);
  return [segmentStart, segmentStart + length];
}

function computeMuhurta(date, location) {
  const sunrise = solarEventMinutes(date, location, true) ?? 360;
  const sunset = solarEventMinutes(date, location, false) ?? 1080;
  const dayLength = sunset > sunrise ? sunset - sunrise : 720;
  const nightLength = 1440 - dayLength;
  const daySegment = dayLength / 8;
  const nightSegment = nightLength / 8;
  const minute = locationDayMinute(date, location);
  const weekday = locationWeekday(date, location);
  const isDay = minute >= sunrise && minute < sunset;
  const sequence = isDay ? dayChaughadia[weekday] : nightChaughadia[weekday];
  const base = isDay ? sunrise : sunset;
  const length = isDay ? daySegment : nightSegment;
  const elapsed = isDay ? minute - sunrise : wrap(minute - sunset, 1440);
  const activeIndex = Math.min(7, Math.floor(elapsed / length));
  const activeName = sequence[activeIndex];
  const activeStart = base + activeIndex * length;
  const activeEnd = activeStart + length;
  const rahu = segmentWindow(sunrise, daySegment, rahuSegments[weekday]);
  const yamaganda = segmentWindow(sunrise, daySegment, yamagandaSegments[weekday]);
  const gulika = segmentWindow(sunrise, daySegment, gulikaSegments[weekday]);

  const periods = sequence.map((name, index) => ({
    name,
    label: `${isDay ? "Day Chaughadia" : "Night Chaughadia"}`,
    start: base + index * length,
    end: base + (index + 1) * length,
    active: index === activeIndex,
    periodIndex: index + 1,
    ...chaughadiaLabels[name]
  }));

  return {
    sunrise,
    sunset,
    rahu,
    yamaganda,
    gulika,
    active: {
      name: activeName,
      period: isDay ? "Day" : "Night",
      quality: chaughadiaLabels[activeName].quality,
      tone: chaughadiaLabels[activeName].tone,
      start: activeStart,
      end: activeEnd
    },
    periods
  };
}

function nasaMoonFrameUrl(date) {
  const start = Date.UTC(2026, 0, 1, 0, 0, 0);
  const end = Date.UTC(2027, 0, 1, 0, 0, 0);
  const time = date.getTime();
  if (time < start || time >= end) return "";

  const frame = Math.floor((time - start) / 3600000) + 1;
  const padded = String(frame).padStart(4, "0");
  return `${APP_CONFIG.assets.nasaMoonFrameBase}/moon.${padded}.jpg`;
}

function preloadMoonFrame(date) {
  const url = nasaMoonFrameUrl(date);
  if (!url || moonImageCache.has(url)) return url;

  const image = new Image();
  image.decoding = "async";
  image.src = url;
  moonImageCache.set(url, image);
  return url;
}

function preloadNearbyMoonFrames(date) {
  preloadMoonFrame(date);
  [-2, -1, 1, 2].forEach((hourOffset) => {
    preloadMoonFrame(new Date(date.getTime() + hourOffset * 3600000));
  });
}

function drawWheel(state, date, location) {
  svg.innerHTML = "";
  const cx = CHART.center;
  const cy = CHART.center;
  const ns = "http://www.w3.org/2000/svg";
  const make = (name, attrs = {}) => {
    const el = document.createElementNS(ns, name);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    svg.appendChild(el);
    return el;
  };

  make("circle", { cx, cy, r: CHART.outerRadius, fill: "rgba(1, 2, 7, 0.82)", stroke: "rgba(168, 206, 228, 0.18)", "stroke-width": 0.9 * CHART.scale });
  make("circle", { cx, cy, r: CHART.nakshatraInnerRadius - CHART.scale, fill: "rgba(0, 0, 0, 0.78)", stroke: "rgba(255,255,255,0.18)", "stroke-width": CHART.scale });
  const defs = make("defs");

  nakshatras.forEach((name, index) => {
    const start = index * 360 / 27;
    const end = (index + 1) * 360 / 27;
    const active = index === state.nakIndex;
    make("path", {
      d: arcPath(
        cx,
        cy,
        CHART.outerRadius + 4 * CHART.scale,
        CHART.outerRadius + 26 * CHART.scale,
        start + 0.9,
        end - 0.9
      ),
      class: `nakshatra-slice-frame${active ? " active" : ""}`
    });
    make("path", {
      d: arcPath(cx, cy, CHART.nakshatraInnerRadius, CHART.outerRadius, start, end),
      fill: active ? "rgba(246, 200, 76, 0.2)" : index % 2 ? "rgba(255,255,255,0.024)" : "rgba(124,220,255,0.03)",
      stroke: active ? "rgba(246, 200, 76, 0.95)" : "rgba(255,255,255,0.18)",
      "stroke-width": active ? 4 * CHART.scale : 2 * CHART.scale
    });
    const words = name.split(" ");
    const lineOne = words.length > 1 ? words.slice(0, Math.ceil(words.length / 2)).join(" ") : name;
    const lineTwo = words.length > 1 ? words.slice(Math.ceil(words.length / 2)).join(" ") : "";
    const lineOnePathId = `nak-outer-arc-line1-${index}`;
    const lineOneArc = document.createElementNS(ns, "path");
    lineOneArc.setAttribute("id", lineOnePathId);
    lineOneArc.setAttribute("d", arcLinePath(cx, cy, CHART.outerRadius + 10 * CHART.scale, start + 2.1, end - 2.1));
    defs.appendChild(lineOneArc);

    const lineOneText = make("text", { class: `nakshatra-arc-label${active ? " active" : ""}` });
    const lineOneTextPath = document.createElementNS(ns, "textPath");
    lineOneTextPath.setAttribute("href", `#${lineOnePathId}`);
    lineOneTextPath.setAttribute("startOffset", "50%");
    lineOneTextPath.setAttribute("text-anchor", "middle");
    lineOneTextPath.textContent = lineOne;
    lineOneText.appendChild(lineOneTextPath);

    if (lineTwo) {
      const lineTwoPathId = `nak-outer-arc-line2-${index}`;
      const lineTwoArc = document.createElementNS(ns, "path");
      lineTwoArc.setAttribute("id", lineTwoPathId);
      lineTwoArc.setAttribute("d", arcLinePath(cx, cy, CHART.outerRadius + 25 * CHART.scale, start + 2.1, end - 2.1));
      defs.appendChild(lineTwoArc);
      const lineTwoText = make("text", { class: `nakshatra-arc-label${active ? " active" : ""}` });
      const lineTwoTextPath = document.createElementNS(ns, "textPath");
      lineTwoTextPath.setAttribute("href", `#${lineTwoPathId}`);
      lineTwoTextPath.setAttribute("startOffset", "50%");
      lineTwoTextPath.setAttribute("text-anchor", "middle");
      lineTwoTextPath.textContent = lineTwo;
      lineTwoText.appendChild(lineTwoTextPath);
    }
  });

  rashis.forEach((name, index) => {
    const start = index * 30;
    const end = start + 30;
    const activeSun = index === state.sunRashiIndex;
    const activeMoon = index === state.moonRashiIndex;
    make("path", {
      d: arcPath(cx, cy, CHART.rashiInnerRadius, CHART.rashiOuterRadius, start, end),
      fill: activeSun ? "rgba(255, 179, 71, 0.2)" : activeMoon ? "rgba(180, 220, 255, 0.14)" : "rgba(0,0,0,0.16)",
      stroke: activeSun ? "rgba(255, 179, 71, 0.45)" : activeMoon ? "rgba(180, 220, 255, 0.4)" : "rgba(172, 201, 222, 0.16)"
    });
    make("path", {
      d: arcPath(
        cx,
        cy,
        CHART.rashiInnerRadius + 2 * CHART.scale,
        CHART.rashiOuterRadius - 2 * CHART.scale,
        start + 1.6,
        end - 1.6
      ),
      class: `rashi-slice-frame${activeSun ? " active-sun" : ""}${activeMoon ? " active-moon" : ""}`
    });
    const [lx, ly] = polar(cx, cy, CHART.rashiLabelRadius, start + 15);
    const rashiLabelPathId = `rashi-arc-${index}`;
    const rashiArc = document.createElementNS(ns, "path");
    rashiArc.setAttribute("id", rashiLabelPathId);
    rashiArc.setAttribute("d", arcLinePath(cx, cy, CHART.rashiLabelRadius, start + 2.5, end - 2.5));
    defs.appendChild(rashiArc);
    const text = make("text", { class: "rashi-arc-label" });
    const textPath = document.createElementNS(ns, "textPath");
    textPath.setAttribute("href", `#${rashiLabelPathId}`);
    textPath.setAttribute("startOffset", "50%");
    textPath.setAttribute("text-anchor", "middle");
    textPath.textContent = `${name} · ${rashiSanskritNames[index]}`;
    text.appendChild(textPath);
    const [sx, sy] = polar(cx, cy, CHART.rashiSymbolRadius, start + 15);
    make("circle", {
      cx: sx,
      cy: sy,
      r: 17.5 * CHART.scale,
      class: `rashi-symbol-halo${activeSun ? " active-sun" : ""}${activeMoon ? " active-moon" : ""}`
    });
    const symbol = make("text", { x: sx, y: sy, class: `rashi-symbol${activeSun ? " active-sun" : ""}${activeMoon ? " active-moon" : ""}` });
    symbol.textContent = rashiSigns[index];
  });

  drawOrbitMarker("Sun", state.sun, CHART.sunOrbitRadius, "#f6c84c", 18 * CHART.scale);
  drawOrbitMarker("Moon", state.moon, CHART.moonOrbitRadius, "#f4f1e7", 22 * CHART.scale, state.angle);

  function drawOrbitMarker(label, degree, radius, color, size, moonAngle) {
    const [x, y] = polar(cx, cy, radius, degree);
    make("circle", { cx, cy, r: radius, fill: "none", stroke: label === "Sun" ? "rgba(246,200,76,0.5)" : "rgba(255,255,255,0.46)", "stroke-dasharray": label === "Sun" ? "7 9" : "11 10" });
    if (label === "Sun") {
      const [tx, ty] = polar(cx, cy, radius + 34 * CHART.scale, degree);
      const text = make("text", { x: tx, y: ty + 4 * CHART.scale, class: "rashi-label" });
      text.textContent = label;
      return;
    }
    if (label === "Moon") {
      const phase = moonPhaseVisual(moonAngle);
      const moonUrl = nasaMoonFrameUrl(date);
      if (moonUrl) {
        const clipId = `moonClip-${Math.round(x)}-${Math.round(y)}`;
        const clip = document.createElementNS(ns, "clipPath");
        clip.setAttribute("id", clipId);
        const clipCircle = document.createElementNS(ns, "circle");
        clipCircle.setAttribute("cx", x);
        clipCircle.setAttribute("cy", y);
        clipCircle.setAttribute("r", size);
        clip.appendChild(clipCircle);
        const defs = svg.querySelector("defs") || make("defs");
        defs.appendChild(clip);

        const image = document.createElementNS(ns, "image");
        image.setAttribute("href", moonUrl);
        image.setAttribute("x", x - size);
        image.setAttribute("y", y - size);
        image.setAttribute("width", size * 2);
        image.setAttribute("height", size * 2);
        image.setAttribute("clip-path", `url(#${clipId})`);
        image.setAttribute("preserveAspectRatio", "xMidYMid slice");
        svg.appendChild(image);
        make("circle", { cx: x, cy: y, r: size, fill: "none", stroke: "rgba(255,255,255,0.78)", "stroke-width": 2 * CHART.scale });
      } else {
        const gradientId = `moonPhase-${phase.stop}-${phase.lit === "#f4f1e7" ? "wax" : "wane"}`;
        const defs = svg.querySelector("defs") || make("defs");
        const gradient = document.createElementNS(ns, "linearGradient");
        gradient.setAttribute("id", gradientId);
        gradient.setAttribute("x1", "0%");
        gradient.setAttribute("x2", "100%");
        gradient.innerHTML = `<stop offset="0%" stop-color="${phase.dark}"/><stop offset="${phase.stop}%" stop-color="${phase.dark}"/><stop offset="${phase.stop}%" stop-color="${phase.lit}"/><stop offset="100%" stop-color="${phase.lit}"/>`;
        defs.appendChild(gradient);
        make("circle", { cx: x, cy: y, r: size, fill: `url(#${gradientId})`, stroke: "rgba(255,255,255,0.78)", "stroke-width": 2 * CHART.scale });
        make("circle", { cx: x - 4 * CHART.scale, cy: y - 4 * CHART.scale, r: 2.4 * CHART.scale, fill: "rgba(255,255,255,0.82)" });
      }
    } else {
      make("circle", { cx: x, cy: y, r: size, fill: color, stroke: "rgba(255,255,255,0.78)", "stroke-width": 2 * CHART.scale });
    }
    const [tx, ty] = polar(cx, cy, radius + 34 * CHART.scale, degree);
    const text = make("text", { x: tx, y: ty + 4 * CHART.scale, class: label === "Sun" ? "rashi-label" : "wheel-label" });
    text.textContent = label;
  }

}

function initStarChart() {
  if (starsInitialized) return;
  starSvg.innerHTML = "";
  const ns = "http://www.w3.org/2000/svg";
  const horizon = document.createElementNS(ns, "circle");
  horizon.setAttribute("cx", CHART.center);
  horizon.setAttribute("cy", CHART.center);
  horizon.setAttribute("r", CHART.starFieldRadius);
  horizon.setAttribute("fill", "rgba(0, 0, 0, 0.3)");
  horizon.setAttribute("stroke", "rgba(89,210,199,0.12)");
  horizon.setAttribute("stroke-dasharray", `${3 * CHART.scale} ${8 * CHART.scale}`);
  starSvg.appendChild(horizon);

  const starShade = document.createElementNS(ns, "circle");
  starShade.setAttribute("id", "star-contrast-ring");
  starShade.setAttribute("cx", CHART.center);
  starShade.setAttribute("cy", CHART.center);
  starShade.setAttribute("r", CHART.starFieldRadius * 1.02);
  starShade.setAttribute("fill", "rgba(1, 4, 12, 0.26)");
  starShade.setAttribute("opacity", "1");
  starSvg.appendChild(starShade);

  brightStars.forEach((star, index) => {
    const circle = document.createElementNS(ns, "circle");
    circle.setAttribute("id", `star-${index}`);
    const visual = starVisual({ ...star, ci: null, spect: "" });
    const color = namedStarColors[star.name] || visual.color;
    circle.setAttribute("r", visual.radius * 0.8);
    circle.setAttribute("fill", color);
    circle.style.filter = `drop-shadow(0 0 ${visual.glow * 0.75}px ${color})`;
    circle.setAttribute("opacity", "0");
    const title = document.createElementNS(ns, "title");
    title.textContent = star.name;
    circle.appendChild(title);
    starSvg.appendChild(circle);

    const label = document.createElementNS(ns, "text");
    label.setAttribute("id", `star-label-${index}`);
    label.setAttribute("class", "star-label");
    label.setAttribute("opacity", "0");
    label.textContent = star.name;
    starSvg.appendChild(label);
  });

  starsInitialized = true;
}

function initNakshatraSky() {
  if (nakshatraSkyInitialized) return;
  initStarChart();
  const data = window.NAKSHATRA_SKY_DATA;
  if (!data) return;
  const ns = "http://www.w3.org/2000/svg";

  const lineGroup = document.createElementNS(ns, "g");
  lineGroup.setAttribute("id", "nakshatra-lines");
  const starGroup = document.createElementNS(ns, "g");
  starGroup.setAttribute("id", "nakshatra-stars");
  const labelGroup = document.createElementNS(ns, "g");
  labelGroup.setAttribute("id", "nakshatra-labels");
  starSvg.appendChild(lineGroup);
  starSvg.appendChild(starGroup);
  starSvg.appendChild(labelGroup);

  data.asterisms.forEach((asterism) => {
    const hipSet = new Set();
    let segmentIndex = 0;
    asterism.lines.forEach((path) => {
      path.forEach((hip) => hipSet.add(hip));
      for (let i = 0; i < path.length - 1; i += 1) {
        if (path[i] === path[i + 1]) continue;
        const line = document.createElementNS(ns, "line");
        line.setAttribute("id", `nak-line-${asterism.index}-${segmentIndex}`);
        line.setAttribute("class", "nakshatra-line");
        line.setAttribute("data-nak", asterism.index);
        line.setAttribute("data-a", path[i]);
        line.setAttribute("data-b", path[i + 1]);
        line.setAttribute("opacity", "0");
        lineGroup.appendChild(line);
        segmentIndex += 1;
      }
    });

    hipSet.forEach((hip) => {
      const star = data.stars[String(hip)];
      if (!star) return;
      const circle = document.createElementNS(ns, "circle");
      circle.setAttribute("id", `nak-star-${asterism.index}-${hip}`);
      circle.setAttribute("class", "nakshatra-star");
      circle.setAttribute("data-nak", asterism.index);
      circle.setAttribute("data-hip", hip);
      const visual = starVisual(star);
      circle.setAttribute("r", visual.radius);
      circle.style.setProperty("--star-color", visual.color);
      circle.style.setProperty("--star-glow", `${visual.glow}px`);
      circle.style.setProperty("--star-glow-active", `${visual.glow * 1.32}px`);
      circle.style.setProperty("--star-glow-color", visual.glowColor);
      circle.setAttribute("opacity", "0");
      const title = document.createElementNS(ns, "title");
      title.textContent = `${star.name || `HIP ${hip}`} - ${asterism.name}`;
      circle.appendChild(title);
      starGroup.appendChild(circle);

      const starName = document.createElementNS(ns, "text");
      starName.setAttribute("id", `nak-star-name-${asterism.index}-${hip}`);
      starName.setAttribute("class", "nakshatra-star-name");
      starName.setAttribute("data-nak", asterism.index);
      starName.setAttribute("data-hip", hip);
      starName.setAttribute("opacity", "0");
      starName.textContent = star.name || `HIP ${hip}`;
      labelGroup.appendChild(starName);
    });

    const label = document.createElementNS(ns, "text");
    label.setAttribute("id", `nak-label-${asterism.index}`);
    label.setAttribute("class", "nakshatra-label");
    label.setAttribute("opacity", "0");
    label.textContent = `${asterism.name} / ${nakshatraSanskrit[asterism.index] || ""}`;
    labelGroup.appendChild(label);

    const overlap = document.createElementNS(ns, "text");
    overlap.setAttribute("id", `nak-overlap-${asterism.index}`);
    overlap.setAttribute("class", "nakshatra-overlap");
    overlap.setAttribute("opacity", "0");
    overlap.textContent = nakshatraCommon[asterism.index] || (asterism.overlapConstellations || []).slice(0, 2).join(" / ");
    labelGroup.appendChild(overlap);
  });

  nakshatraSkyInitialized = true;
}

function updateNakshatraSky(date, location, activeNakIndex) {
  initNakshatraSky();
  const data = window.NAKSHATRA_SKY_DATA;
  if (!data) return;
  const projected = new Map();

  Object.values(data.stars).forEach((star) => {
    const sky = equatorialToAltAz(star, date, location);
    const ecliptic = equatorialToSiderealEcliptic(star, date);
    const bandRadius = (274 - Math.max(-18, Math.min(18, ecliptic.lat)) * 2.25) * CHART.scale;
    const [x, y] = polar(CHART.center, CHART.center, bandRadius, ecliptic.lon);
    const visible = true;
    const altitudeInfluence = Math.max(0, Math.min(1, (sky.alt + 15) / 80));
    projected.set(star.hip, {
      visible,
      x,
      y,
      opacity: 0.58 + altitudeInfluence * 0.22
    });
  });

  data.asterisms.forEach((asterism) => {
    const active = asterism.index === activeNakIndex;
    const visiblePoints = [];
    const starNodes = starSvg.querySelectorAll(`[data-nak="${asterism.index}"].nakshatra-star`);
    starNodes.forEach((node) => {
      const hip = Number(node.getAttribute("data-hip"));
      const point = projected.get(hip);
      const star = data.stars[String(hip)];
      const visual = starVisual(star, active);
      const starName = starSvg.querySelector(`#nak-star-name-${asterism.index}-${hip}`);
      node.classList.toggle("active", active);
      starName?.classList.toggle("active", active);
      if (!point) {
        node.setAttribute("opacity", "0");
        if (starName) starName.setAttribute("opacity", "0");
        return;
      }
      node.setAttribute("r", visual.radius);
      node.style.setProperty("--star-color", visual.color);
      node.style.setProperty("--star-glow", `${visual.glow}px`);
      node.style.setProperty("--star-glow-active", `${visual.glow * 1.32}px`);
      node.style.setProperty("--star-glow-color", visual.glowColor);
      node.setAttribute("cx", point.x);
      node.setAttribute("cy", point.y);
      node.setAttribute("opacity", active ? Math.min(1, point.opacity * visual.opacity + 0.25) : Math.max(0.54, point.opacity * visual.opacity));
      if (starName) {
        starName.setAttribute("x", point.x);
        starName.setAttribute("y", point.y + 7 * CHART.scale);
        starName.setAttribute("data-base-x", point.x.toFixed(2));
        starName.setAttribute("data-base-y", (point.y + 7 * CHART.scale).toFixed(2));
        starName.setAttribute("opacity", active ? "0.95" : "0.74");
      }
      visiblePoints.push(point);
    });

    const lineNodes = starSvg.querySelectorAll(`[data-nak="${asterism.index}"].nakshatra-line`);
    lineNodes.forEach((node) => {
      const a = projected.get(Number(node.getAttribute("data-a")));
      const b = projected.get(Number(node.getAttribute("data-b")));
      node.classList.toggle("active", active);
      if (!a || !b) {
        node.setAttribute("opacity", "0");
        return;
      }
      node.setAttribute("x1", a.x);
      node.setAttribute("y1", a.y);
      node.setAttribute("x2", b.x);
      node.setAttribute("y2", b.y);
      node.setAttribute("opacity", active ? "0.95" : "0.46");
    });

    const label = starSvg.querySelector(`#nak-label-${asterism.index}`);
    const overlap = starSvg.querySelector(`#nak-overlap-${asterism.index}`);
    label.classList.toggle("active", active);
    overlap.classList.toggle("active", active);
    let cx = CHART.center;
    let cy = CHART.center;
    if (visiblePoints.length) {
      cx = visiblePoints.reduce((sum, point) => sum + point.x, 0) / visiblePoints.length;
      cy = visiblePoints.reduce((sum, point) => sum + point.y, 0) / visiblePoints.length;
    } else {
      [cx, cy] = polar(CHART.center, CHART.center, CHART.starFieldRadius * 0.78, (asterism.index * 360 / 27) + 6);
    }
    label.setAttribute("x", cx);
    label.setAttribute("y", cy - 14 * CHART.scale);
    label.setAttribute("data-base-x", cx.toFixed(2));
    label.setAttribute("data-base-y", (cy - 14 * CHART.scale).toFixed(2));
    label.setAttribute("opacity", active ? "1" : "0.84");
    overlap.setAttribute("x", cx);
    overlap.setAttribute("y", cy - 4 * CHART.scale);
    overlap.setAttribute("data-base-x", cx.toFixed(2));
    overlap.setAttribute("data-base-y", (cy - 4 * CHART.scale).toFixed(2));
    overlap.setAttribute("opacity", active ? "0.9" : "0.68");
  });
}

function intersectsRect(a, b, padding = 0) {
  return !(
    a.x + a.width + padding < b.x ||
    b.x + b.width + padding < a.x ||
    a.y + a.height + padding < b.y ||
    b.y + b.height + padding < a.y
  );
}

function resolveSkyLabelOverlaps() {
  if (!starSvg) return;
  const selectors = [
    ".wheel-label",
    ".nakshatra-label",
    ".nakshatra-overlap",
    ".nakshatra-star-name",
    ".star-label"
  ];
  const labels = Array.from(starSvg.querySelectorAll(selectors.join(",")))
    .filter((node) => {
      const opacityAttr = node.getAttribute("opacity");
      const opacity = opacityAttr == null ? 1 : Number.parseFloat(opacityAttr || "0");
      return opacity > 0.1;
    });

  labels.forEach((node) => {
    const baseX = Number.parseFloat(node.getAttribute("data-base-x") || node.getAttribute("x") || "0");
    const baseY = Number.parseFloat(node.getAttribute("data-base-y") || node.getAttribute("y") || "0");
    node.setAttribute("x", baseX.toFixed(2));
    node.setAttribute("y", baseY.toFixed(2));
  });

  const priorities = labels.sort((a, b) => {
    const aActive = a.classList.contains("active") ? 1 : 0;
    const bActive = b.classList.contains("active") ? 1 : 0;
    if (aActive !== bActive) return bActive - aActive;
    const aWheel = a.classList.contains("wheel-label") ? 1 : 0;
    const bWheel = b.classList.contains("wheel-label") ? 1 : 0;
    if (aWheel !== bWheel) return bWheel - aWheel;
    const aMain = a.classList.contains("nakshatra-label") ? 1 : 0;
    const bMain = b.classList.contains("nakshatra-label") ? 1 : 0;
    return bMain - aMain;
  });

  const placed = [];
  const offsets = [
    [0, 0], [0, -18], [16, -10], [-16, -10], [20, 8], [-20, 8], [0, 16], [30, 0], [-30, 0],
    [28, -18], [-28, -18], [36, 12], [-36, 12], [0, -30], [0, 30]
  ];

  priorities.forEach((node) => {
    const baseX = Number.parseFloat(node.getAttribute("data-base-x") || node.getAttribute("x") || "0");
    const baseY = Number.parseFloat(node.getAttribute("data-base-y") || node.getAttribute("y") || "0");
    let accepted = null;

    for (const [dx, dy] of offsets) {
      node.setAttribute("x", (baseX + dx).toFixed(2));
      node.setAttribute("y", (baseY + dy).toFixed(2));
      const rect = node.getBBox();
      const inside =
        rect.x >= 40 * CHART.scale &&
        rect.y >= 40 * CHART.scale &&
        rect.x + rect.width <= CHART.size - 40 * CHART.scale &&
        rect.y + rect.height <= CHART.size - 40 * CHART.scale;
      const overlap = placed.some((p) => intersectsRect(rect, p, 5 * CHART.scale));
      if (inside && !overlap) {
        accepted = rect;
        break;
      }
    }

    if (!accepted) {
      node.setAttribute("opacity", Math.max(0.05, Number.parseFloat(node.getAttribute("opacity") || "1") * 0.28).toFixed(2));
      const fallbackRect = node.getBBox();
      placed.push(fallbackRect);
      return;
    }

    placed.push(accepted);
  });
}

function updateStarChart(date, location, activeNakIndex) {
  initStarChart();
  const cx = CHART.center;
  const cy = CHART.center;
  const radius = CHART.starFieldRadius;
  const sunAlt = localSunAltitude(date, location);
  const daylight = clamp((sunAlt + 18) / 72, 0, 1);
  const contrastRing = starSvg.querySelector("#star-contrast-ring");
  if (contrastRing) {
    contrastRing.setAttribute("opacity", (0.26 + daylight * 0.22).toFixed(2));
  }
  if (wheelWrap) {
    wheelWrap.style.setProperty("--sky-daylight-opacity", (0.08 + daylight * 0.2).toFixed(2));
    wheelWrap.style.setProperty("--sky-night-shadow", (0.34 + (1 - daylight) * 0.16).toFixed(2));
    wheelWrap.classList.toggle("night-mode", daylight < 0.42);
  }

  brightStars.forEach((star, index) => {
    const circle = starSvg.querySelector(`#star-${index}`);
    const label = starSvg.querySelector(`#star-label-${index}`);
    const sky = equatorialToAltAz(star, date, location);

    if (sky.alt <= 0) {
      circle.setAttribute("opacity", "0");
      if (label) label.setAttribute("opacity", "0");
      return;
    }

    const distance = (90 - sky.alt) / 90 * radius;
    const [x, y] = polar(cx, cy, distance, sky.az);
    const opacity = Math.min(1, 0.45 + sky.alt / 80);
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("opacity", opacity);

    if (label) {
      label.setAttribute("x", x);
      label.setAttribute("y", y - 8 * CHART.scale);
      label.setAttribute("data-base-x", x.toFixed(2));
      label.setAttribute("data-base-y", (y - 8 * CHART.scale).toFixed(2));
      label.setAttribute("opacity", opacity * 0.9);
    }
  });

  updateNakshatraSky(date, location, activeNakIndex);
  resolveSkyLabelOverlaps();
}

function formatMonthName(state) {
  const [month, anchor, festival] = gujaratiMonths[state.monthIndex];
  const prefix = state.isAdhikMonth ? "Adhik " : "";
  const note = state.isAdhikMonth ? "intercalary month, approximate" : festival;
  return `${prefix}${month} / anchored near ${anchor} / ${note}`;
}

function drawMuhurta(date, location) {
  const muhurta = computeMuhurta(date, location);
  const active = muhurta.active;
  const dstOn = isDstActive(date, location, baseUtcOffsetMinutes(location));
  document.querySelector("#currentChaughadia").textContent = `${active.name} / ${active.quality}`;
  document.querySelector("#currentChaughadiaWindow").textContent = `${active.period} period, ${formatMinuteWindow(active.start, active.end)}${dstOn ? " (DST)" : ""}`;
  document.querySelector("#currentChaughadiaMeaning").textContent = active.meaning;
  document.querySelector("#sunriseValue").textContent = formatMinutes(muhurta.sunrise);
  document.querySelector("#sunsetValue").textContent = formatMinutes(muhurta.sunset);
  document.querySelector("#rahuValue").textContent = formatMinuteWindow(muhurta.rahu[0], muhurta.rahu[1]);
  document.querySelector("#yamagandaValue").textContent = formatMinuteWindow(muhurta.yamaganda[0], muhurta.yamaganda[1]);
  document.querySelector("#gulikaValue").textContent = formatMinuteWindow(muhurta.gulika[0], muhurta.gulika[1]);

  const strip = document.querySelector("#chaughadiaStrip");
  strip.innerHTML = "";
  muhurta.periods.forEach((period) => {
    const chip = document.createElement("article");
    chip.className = `chaughadia-chip ${period.tone}${period.active ? " active" : ""}`;
    chip.innerHTML = `<span>${period.label} ${period.periodIndex}</span><strong>${period.name} / ${period.quality}</strong><small>${formatMinuteWindow(period.start, period.end)}</small><small>${period.meaning}</small>`;
    strip.appendChild(chip);
  });
}

function drawGregorianMonth(date, location) {
  const grid = document.querySelector("#monthGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const start = new Date(firstOfMonth);
  start.setDate(1 - firstOfMonth.getDay());

  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 0; i < 42; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const sample = new Date(day);
    sample.setHours(12, 0, 0, 0);
    const state = approximateState(sample);
    const phase = moonPhaseVisual(state.angle);
    const moonUrl = nasaMoonFrameUrl(sample);
    const muhurta = computeMuhurta(sample, location);
    const inMonth = day.getMonth() === month;
    const isToday =
      day.getFullYear() === date.getFullYear() &&
      day.getMonth() === date.getMonth() &&
      day.getDate() === date.getDate();

    const card = document.createElement("article");
    card.className = `month-day${inMonth ? "" : " muted"}${isToday ? " current" : ""}`;
    card.style.setProperty("--moon-illumination", phase.illuminated.toFixed(3));
    card.style.setProperty("--moon-card-glow", (0.01 + phase.illuminated * 0.34).toFixed(3));
    card.style.setProperty("--moon-card-border", (0.1 + phase.illuminated * 0.58).toFixed(3));
    card.innerHTML = `
      <header>
        <strong>${day.getDate()}</strong>
        <span>${weekdayNames[day.getDay()]}</span>
        <div class="mini-moon" style="--shadow-stop:${phase.stop}%;--moon-lit:${phase.lit};--moon-dark:${phase.dark};--moon-image:${moonUrl ? `url('${moonUrl}')` : "none"};"></div>
      </header>
      <p>${tithis[state.tithiIndex]} (${state.paksha.split(" ")[0]})</p>
      <p>${nakshatras[state.nakIndex]}</p>
      <small>Sunrise ${formatMinutes(muhurta.sunrise)} | Sunset ${formatMinutes(muhurta.sunset)}</small>
      <small>Rahu ${formatMinuteWindow(muhurta.rahu[0], muhurta.rahu[1])}</small>
    `;
    grid.appendChild(card);
  }
}

function updateNowVisibility(date) {
  nowButton.classList.toggle("hidden", Math.abs(Date.now() - date.getTime()) < nowThresholdMs);
}

function updateText(state, date, location) {
  const pakshaShort = state.paksha.split(" ")[0];
  const phaseText = state.phase.startsWith("Waning") ? "Waning moon" : "Waxing moon";
  const pakshaLabel = document.querySelector("#pakshaLabel");
  if (pakshaLabel) pakshaLabel.textContent = pakshaShort;
  else setText("#pakshaValue", `${pakshaShort} / ${phaseText}`);
  setText("#phaseLabel", phaseText);
  setText("#phaseChipTitle", state.phase);
  setText("#phaseChipMeta", "Moon phase");
  const phase = moonPhaseVisual(state.angle);
  if (phaseChipVisual) {
    const moonUrl = nasaMoonFrameUrl(date);
    phaseChipVisual.style.setProperty("--shadow-stop", `${phase.stop}%`);
    phaseChipVisual.style.setProperty("--moon-lit", phase.lit);
    phaseChipVisual.style.setProperty("--moon-dark", phase.dark);
    if (moonUrl && phaseChipVisual.tagName === "IMG") {
      phaseChipVisual.src = moonUrl;
    }
  }
  setText("#localTimeLabel", formatLocationClock(date, location));
  const tithiWindow = currentTithiWindow(date);
  setText("#tithiValue", `${state.paksha.split(" ")[0]} ${tithis[state.tithiIndex]} / ${tithiCommon[state.tithiIndex]} (${formatLocationDateTime(tithiWindow.start, location)} - ${formatLocationDateTime(tithiWindow.end, location)})`);
  setText("#nakshatraValue", `${nakshatras[state.nakIndex]} / ${nakshatraSanskrit[state.nakIndex]} / ${nakshatraCommon[state.nakIndex]}`);
  setText("#moonRashiValue", formatRashiName(state.moonRashiIndex));
  setText("#sunRashiValue", formatRashiName(state.sunRashiIndex));
  setText("#moonRashiFocus", `${rashiSigns[state.moonRashiIndex]} ${formatRashiName(state.moonRashiIndex)}`);
  setText("#sunRashiFocus", `${rashiSigns[state.sunRashiIndex]} ${formatRashiName(state.sunRashiIndex)}`);
  setText("#monthValue", formatMonthName(state));
  setText("#latValue", formatCoordinate(location.lat, "lat"));
  setText("#lonValue", formatCoordinate(location.lon, "lon"));
  setText("#timezoneValue", timezoneStatus(date, location));
  setText("#sunDegree", `${state.sun.toFixed(1)}°`);
  setText("#moonDegree", `${state.moon.toFixed(1)}°`);
}

function drawJourney(date) {
  const track = document.querySelector("#journeyTrack");
  const startLabel = document.querySelector("#dayStartLabel");
  const endLabel = document.querySelector("#dayEndLabel");
  if (!track || !startLabel || !endLabel) return;
  track.innerHTML = "";
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  const total = dayEnd - dayStart;
  const steps = 12;

  startLabel.textContent = `${dayStart.toLocaleDateString([], { month: "short", day: "numeric" })} 00:00`;
  endLabel.textContent = `${dayEnd.toLocaleDateString([], { month: "short", day: "numeric" })} 00:00`;

  for (let i = 0; i < steps; i += 1) {
    const sample = new Date(dayStart.getTime() + total * (i / steps));
    const state = approximateState(sample);
    const segment = document.createElement("div");
    segment.className = "nak-segment";
    segment.style.flex = "1 0 0";
    segment.innerHTML = `<strong>${nakshatras[state.nakIndex]}</strong><span>${sample.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>`;
    track.appendChild(segment);
  }

  const marker = document.createElement("div");
  marker.className = "moon-marker";
  const currentState = approximateState(date);
  const phase = moonPhaseVisual(currentState.angle);
  const moonUrl = nasaMoonFrameUrl(date);
  const progress = Math.min(1, Math.max(0, (date - dayStart) / total));
  marker.style.setProperty("--x", `${progress * 100}%`);
  marker.style.setProperty("--shadow-stop", `${phase.stop}%`);
  marker.style.setProperty("--moon-lit", phase.lit);
  marker.style.setProperty("--moon-dark", phase.dark);
  marker.style.setProperty("--moon-image", moonUrl ? `url("${moonUrl}")` : "none");
  marker.dataset.label = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  track.appendChild(marker);

  const ruler = document.createElement("div");
  ruler.className = "time-ruler";
  ruler.innerHTML = ["00", "04", "08", "12", "16", "20", "24"].map((label) => `<span>${label}:00</span>`).join("");
  track.appendChild(ruler);
}

function drawMonths(activeIndex) {
  const row = document.querySelector("#monthRow");
  if (!row) return;
  row.innerHTML = "";
  gujaratiMonths.forEach(([month, anchor, festival], index) => {
    const card = document.createElement("article");
    card.className = `month-card${index === activeIndex ? " active" : ""}`;
    card.innerHTML = `<strong>${month}</strong><span>${anchor}</span><p>${festival}</p>`;
    row.appendChild(card);
  });
}

function renderAt(date) {
  virtualTime = date.getTime();
  preloadNearbyMoonFrames(date);
  const location = currentLocation();
  void ensureLocationTimeZone(location);
  const state = approximateState(date);
  updateEarthCore(date, location);
  updateSunVisual(state);
  updateStarChart(date, location, state.nakIndex);
  drawWheel(state, date, location);
  updateText(state, date, location);
  drawMuhurta(date, location);
  drawGregorianMonth(date, location);
  updateNowVisibility(date);
  writeAppStateToUrl({
    locationName: location.name,
    lat: location.lat,
    lon: location.lon,
    date
  });
  notifyParentHeight();
}

function render() {
  renderAt(new Date(dateInput.value || Date.now()));
}

function syncInputDisplay(force = false) {
  const now = performance.now();
  if (!force && now - lastInputSync < APP_CONFIG.playback.inputSyncIntervalMs) return;
  dateInput.value = toInputValue(new Date(virtualTime));
  lastInputSync = now;
}

function stopPlayback() {
  if (playbackTimer) {
    clearInterval(playbackTimer);
    playbackTimer = null;
  }
  if (playbackFrame) {
    cancelAnimationFrame(playbackFrame);
    playbackFrame = null;
  }
}

function startContinuousPlayback(speedMsPerRealMs) {
  stopPlayback();
  lastPlaybackTick = performance.now();

  const tick = (now) => {
    const elapsed = now - lastPlaybackTick;
    lastPlaybackTick = now;
    virtualTime += elapsed * speedMsPerRealMs;

    if (now - lastVisualRender > APP_CONFIG.playback.visualRenderIntervalMs) {
      renderAt(new Date(virtualTime));
      lastVisualRender = now;
    }

    syncInputDisplay(false);
    playbackFrame = requestAnimationFrame(tick);
  };

  playbackFrame = requestAnimationFrame(tick);
}

function setPlayback(direction, syncOnPause = true) {
  playbackStep = "minutes";
  playbackDirection = direction;
  [dayBackButton, reverseButton, pauseButton, forwardButton, dayForwardButton].forEach((button) => button.classList.remove("active"));
  if (direction < 0) reverseButton.classList.add("active");
  if (direction === 0) pauseButton.classList.add("active");
  if (direction > 0) forwardButton.classList.add("active");
  updateTransportButton();

  if (direction === 0) {
    stopPlayback();
    if (syncOnPause) syncInputDisplay(true);
    return;
  }

  startContinuousPlayback(direction * APP_CONFIG.playback.normalMsPerRealMs);
}

function setDayPlayback(direction) {
  playbackStep = "days";
  playbackDirection = direction;
  [dayBackButton, reverseButton, pauseButton, forwardButton, dayForwardButton].forEach((button) => button.classList.remove("active"));
  if (direction < 0) dayBackButton.classList.add("active");
  if (direction > 0) dayForwardButton.classList.add("active");
  updateTransportButton();

  startContinuousPlayback(direction * APP_CONFIG.playback.dayMsPerRealMs);
}

function hideLocationResults() {
  locationResults.innerHTML = "";
  locationResults.classList.remove("open");
}

function setLocationResultMessage(message) {
  locationResults.innerHTML = `<div class="location-result muted">${message}</div>`;
  locationResults.classList.add("open");
}

async function searchLocations(query) {
  if (query.length < 3 || query === lastLocationQuery) return;
  lastLocationQuery = query;
  setLocationResultMessage("Searching...");

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "5");
    url.searchParams.set("q", query);
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error("Location search unavailable");
    const results = await response.json();
    if (!Array.isArray(results) || results.length === 0) {
      setLocationResultMessage("No location found");
      return;
    }

    locationResults.innerHTML = "";
    results.forEach((result) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "location-result";
      button.textContent = result.display_name;
      button.addEventListener("click", () => {
        locationInput.value = result.display_name;
        latInput.value = Number.parseFloat(result.lat).toFixed(4);
        lonInput.value = Number.parseFloat(result.lon).toFixed(4);
        hideLocationResults();
        render();
        writeAppStateToUrl({
          locationName: locationInput.value,
          lat: Number.parseFloat(latInput.value),
          lon: Number.parseFloat(lonInput.value),
          date: new Date(dateInput.value || Date.now())
        }, true);
      });
      locationResults.appendChild(button);
    });
    locationResults.classList.add("open");
  } catch {
    setLocationResultMessage("Free location search is temporarily unavailable");
  }
}

const initialState = readInitialState(APP_CONFIG.defaults);
locationInput.value = initialState.locationName;
latInput.value = initialState.lat.toFixed(4);
lonInput.value = initialState.lon.toFixed(4);
dateInput.value = toInputValue(Number.isNaN(initialState.date.getTime()) ? new Date() : initialState.date);
if (urlParams.get("manualCoords") === "1" && manualCoordinates) {
  manualCoordinates.open = true;
}
dateInput.addEventListener("input", () => {
  setPlayback(0, false);
  render();
});
nowButton.addEventListener("click", () => {
  dateInput.value = toInputValue(new Date());
  setPlayback(0, false);
  render();
});
latInput.addEventListener("input", render);
lonInput.addEventListener("input", render);
locationInput.addEventListener("input", () => {
  clearTimeout(locationSearchTimer);
  const query = locationInput.value.trim();
  if (query.length < 3) {
    hideLocationResults();
    return;
  }
  locationSearchTimer = setTimeout(() => searchLocations(query), 450);
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".location-field")) hideLocationResults();
});
geoButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    locationInput.value = "Geolocation unavailable";
    render();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      latInput.value = position.coords.latitude.toFixed(4);
      lonInput.value = position.coords.longitude.toFixed(4);
      locationInput.value = "Current location";
      render();
      writeAppStateToUrl({
        locationName: locationInput.value,
        lat: Number.parseFloat(latInput.value),
        lon: Number.parseFloat(lonInput.value),
        date: new Date(dateInput.value || Date.now())
      }, true);
    },
    () => {
      locationInput.value = "Location permission needed";
      render();
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
});
reverseButton.addEventListener("click", () => setPlayback(-1));
pauseButton.addEventListener("click", () => {
  if (playbackDirection === 0) {
    setPlayback(1);
    return;
  }
  setPlayback(0);
});
forwardButton.addEventListener("click", () => setPlayback(1));
dayBackButton.addEventListener("click", () => setDayPlayback(-1));
dayForwardButton.addEventListener("click", () => setDayPlayback(1));

updateTransportButton();
render();
window.addEventListener("resize", notifyParentHeight);

if (wheelWrap) {
  const clampPan = () => {
    const maxOffset = ((wheelZoom - 1) * 920) / 2;
    wheelPanX = clamp(wheelPanX, -maxOffset, maxOffset);
    wheelPanY = clamp(wheelPanY, -maxOffset, maxOffset);
  };
  const applyWheelTransform = () => {
    clampPan();
    wheelWrap.style.setProperty("--wheel-zoom", String(wheelZoom));
    wheelWrap.style.setProperty("--wheel-pan-x", `${wheelPanX}px`);
    wheelWrap.style.setProperty("--wheel-pan-y", `${wheelPanY}px`);
    wheelWrap.classList.toggle("is-pannable", wheelZoom > 1.01);
    document.body.classList.toggle("wheel-zoom-active", wheelZoom > 1.01);
  };
  applyWheelTransform();
  wheelWrap.addEventListener("wheel", (event) => {
    if (event.deltaY === 0) return;
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    wheelZoom = Math.min(2.4, Math.max(1, wheelZoom + direction * 0.09));
    if (wheelZoom <= 1.01) {
      wheelPanX = 0;
      wheelPanY = 0;
    }
    applyWheelTransform();
  }, { passive: false });
  wheelWrap.addEventListener("dblclick", () => {
    wheelZoom = 1;
    wheelPanX = 0;
    wheelPanY = 0;
    applyWheelTransform();
  });
  wheelWrap.addEventListener("pointerdown", (event) => {
    if (wheelZoom <= 1.01) return;
    isWheelDragging = true;
    wheelDragStartX = event.clientX;
    wheelDragStartY = event.clientY;
    wheelPanStartX = wheelPanX;
    wheelPanStartY = wheelPanY;
    wheelWrap.classList.add("is-dragging");
    wheelWrap.setPointerCapture(event.pointerId);
  });
  wheelWrap.addEventListener("pointermove", (event) => {
    if (!isWheelDragging) return;
    wheelPanX = wheelPanStartX + (event.clientX - wheelDragStartX);
    wheelPanY = wheelPanStartY + (event.clientY - wheelDragStartY);
    applyWheelTransform();
  });
  const endWheelDrag = (event) => {
    if (!isWheelDragging) return;
    isWheelDragging = false;
    wheelWrap.classList.remove("is-dragging");
    if (event?.pointerId != null && wheelWrap.hasPointerCapture(event.pointerId)) {
      wheelWrap.releasePointerCapture(event.pointerId);
    }
  };
  wheelWrap.addEventListener("pointerup", endWheelDrag);
  wheelWrap.addEventListener("pointercancel", endWheelDrag);
}
