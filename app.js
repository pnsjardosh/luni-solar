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

const rashis = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"
];
const rashisHindi = [
  "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"
];

const rashiSigns = ["\u2648\ufe0e", "\u2649\ufe0e", "\u264a\ufe0e", "\u264b\ufe0e", "\u264c\ufe0e", "\u264d\ufe0e", "\u264e\ufe0e", "\u264f\ufe0e", "\u2650\ufe0e", "\u2651\ufe0e", "\u2652\ufe0e", "\u2653\ufe0e"];

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
  nakshatraLabelRadius: 288 * CHART_SCALE,
  rashiLabelRadius: 205 * CHART_SCALE,
  rashiSymbolRadius: 170 * CHART_SCALE,
  rashiBadgeRadius: 170 * CHART_SCALE
};

const tithis = [
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi", "Amavasya"
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
const locationInput = document.querySelector("#locationInput");
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

function formatRashiName(index) {
  return `${rashis[index]} / ${rashisHindi[index]}`;
}

function updateEarthCore(date, location) {
  renderEarthGlobe(date, location);
  earthCore.style.setProperty("--marker-x", "50%");
  earthCore.style.setProperty("--marker-y", "50%");
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
  pauseButton.innerHTML = playing ? "||" : "&#9654;";
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
  const key = `${location.lat.toFixed(2)}:${location.lon.toFixed(2)}:${coarseTime}`;
  if (key === earthRenderKey) return;
  earthRenderKey = key;

  const size = earthCanvas.width;
  const radius = size * 0.48;
  const center = size / 2;
  const output = earthContext.createImageData(size, size);
  const lat0 = location.lat * Math.PI / 180;
  const lon0 = location.lon * Math.PI / 180;
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
    paksha: tithiIndex < 15 ? "Shukla Paksha" : "Krishna Paksha",
    phase: angle < 20 || angle > 340 ? "New Moon" : angle < 170 ? "Waxing Moon" : angle < 190 ? "Full Moon" : "Waning Moon"
  };
}

function moonPhaseVisual(angle) {
  const illuminated = (1 - Math.cos(angle * Math.PI / 180)) / 2;
  const stop = Math.round(illuminated * 100);
  const waxing = angle < 180;
  return {
    stop,
    lit: waxing ? "#f4f1e7" : "#44505f",
    dark: waxing ? "#44505f" : "#f4f1e7"
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

  nakshatras.forEach((name, index) => {
    const start = index * 360 / 27;
    const end = (index + 1) * 360 / 27;
    const active = index === state.nakIndex;
    make("path", {
      d: arcPath(cx, cy, CHART.nakshatraInnerRadius, CHART.outerRadius, start, end),
      fill: active ? "rgba(246, 200, 76, 0.2)" : index % 2 ? "rgba(255,255,255,0.024)" : "rgba(124,220,255,0.03)",
      stroke: active ? "rgba(246, 200, 76, 0.95)" : "rgba(255,255,255,0.18)",
      "stroke-width": active ? 4 * CHART.scale : 2 * CHART.scale
    });
    const [lx, ly] = polar(cx, cy, CHART.nakshatraLabelRadius + 20 * CHART.scale, start + (end - start) / 2);
    const text = make("text", { x: lx, y: ly, class: "wheel-label" });
    text.textContent = name;
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
    const [lx, ly] = polar(cx, cy, CHART.rashiLabelRadius, start + 15);
    const text = make("text", { x: lx, y: ly, class: "rashi-label" });
    const en = document.createElementNS(ns, "tspan");
    en.setAttribute("x", lx);
    en.setAttribute("dy", "0");
    en.textContent = name;
    const hi = document.createElementNS(ns, "tspan");
    hi.setAttribute("x", lx);
    hi.setAttribute("dy", `${22 * CHART.scale / 5.333}`);
    hi.setAttribute("class", "rashi-label-hi");
    hi.textContent = rashisHindi[index];
    text.appendChild(en);
    text.appendChild(hi);
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
    label.textContent = asterism.name;
    labelGroup.appendChild(label);

    const overlap = document.createElementNS(ns, "text");
    overlap.setAttribute("id", `nak-overlap-${asterism.index}`);
    overlap.setAttribute("class", "nakshatra-overlap");
    overlap.setAttribute("opacity", "0");
    overlap.textContent = (asterism.overlapConstellations || []).slice(0, 2).join(" / ");
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
    const visible = sky.alt > -8;
    projected.set(star.hip, {
      visible,
      x,
      y,
      opacity: visible ? Math.min(1, 0.22 + Math.max(0, sky.alt + 8) / 65) : 0
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
      if (!point || !point.visible) {
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
      node.setAttribute("opacity", active ? Math.min(1, point.opacity * visual.opacity + 0.25) : point.opacity * visual.opacity);
      if (starName) {
        starName.setAttribute("x", point.x);
        starName.setAttribute("y", point.y + 7 * CHART.scale);
        starName.setAttribute("opacity", active ? "0.86" : Math.max(0.28, point.opacity * 0.52).toFixed(2));
      }
      visiblePoints.push(point);
    });

    const lineNodes = starSvg.querySelectorAll(`[data-nak="${asterism.index}"].nakshatra-line`);
    lineNodes.forEach((node) => {
      const a = projected.get(Number(node.getAttribute("data-a")));
      const b = projected.get(Number(node.getAttribute("data-b")));
      node.classList.toggle("active", active);
      if (!a?.visible || !b?.visible) {
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
    if (!visiblePoints.length) {
      label.setAttribute("opacity", "0");
      overlap.setAttribute("opacity", "0");
      return;
    }
    const cx = visiblePoints.reduce((sum, point) => sum + point.x, 0) / visiblePoints.length;
    const cy = visiblePoints.reduce((sum, point) => sum + point.y, 0) / visiblePoints.length;
    label.setAttribute("x", cx);
    label.setAttribute("y", cy - 14 * CHART.scale);
    label.setAttribute("opacity", active ? "0.95" : "0.52");
    overlap.setAttribute("x", cx);
    overlap.setAttribute("y", cy - 4 * CHART.scale);
    overlap.setAttribute("opacity", active ? "0.86" : "0.42");
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
      label.setAttribute("opacity", opacity * 0.9);
    }
  });

  updateNakshatraSky(date, location, activeNakIndex);
}

function updateText(state, date, location) {
  document.querySelector("#phaseChip").textContent = state.phase;
  document.querySelector("#localTimeLabel").textContent = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  document.querySelector("#tithiValue").textContent = tithis[state.tithiIndex];
  document.querySelector("#pakshaValue").textContent = state.paksha;
  document.querySelector("#nakshatraValue").textContent = nakshatras[state.nakIndex];
  document.querySelector("#moonRashiValue").textContent = formatRashiName(state.moonRashiIndex);
  document.querySelector("#sunRashiValue").textContent = formatRashiName(state.sunRashiIndex);
  document.querySelector("#moonRashiFocus").textContent = `${rashiSigns[state.moonRashiIndex]} ${formatRashiName(state.moonRashiIndex)}`;
  document.querySelector("#sunRashiFocus").textContent = `${rashiSigns[state.sunRashiIndex]} ${formatRashiName(state.sunRashiIndex)}`;
  document.querySelector("#monthValue").textContent = gujaratiMonths[state.monthIndex][0];
  document.querySelector("#sunDegree").textContent = `${state.sun.toFixed(1)}°`;
  document.querySelector("#moonDegree").textContent = `${state.moon.toFixed(1)}°`;
}

function drawJourney(date) {
  const track = document.querySelector("#journeyTrack");
  track.innerHTML = "";
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  const total = dayEnd - dayStart;
  const steps = 12;

  document.querySelector("#dayStartLabel").textContent = `${dayStart.toLocaleDateString([], { month: "short", day: "numeric" })} 00:00`;
  document.querySelector("#dayEndLabel").textContent = `${dayEnd.toLocaleDateString([], { month: "short", day: "numeric" })} 00:00`;

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
  const state = approximateState(date);
  updateEarthCore(date, location);
  updateSunVisual(state);
  updateStarChart(date, location, state.nakIndex);
  drawWheel(state, date, location);
  updateText(state, date, location);
  drawJourney(date);
  drawMonths(state.monthIndex);
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

const initialState = readInitialState(APP_CONFIG.defaults);
locationInput.value = initialState.locationName;
latInput.value = initialState.lat.toFixed(4);
lonInput.value = initialState.lon.toFixed(4);
dateInput.value = toInputValue(Number.isNaN(initialState.date.getTime()) ? new Date() : initialState.date);
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
locationInput.addEventListener("input", render);
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
