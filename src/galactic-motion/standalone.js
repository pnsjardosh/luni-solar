import { solarGeometrySnapshot } from "../solar-geometry/model.js";

const YEAR_MIN = -50000;
const YEAR_MAX = 50000;
const STEP_YEARS = 100;
const PLAY_YEARS_PER_SECOND = 1000;

const yearInput = document.querySelector("#galacticYearInput");
const playButton = document.querySelector("#galacticPlay");
const reverseButton = document.querySelector("#galacticReverse");
const forwardButton = document.querySelector("#galacticForward");
const resetButton = document.querySelector("#galacticReset");
const stepBackButton = document.querySelector("#galacticStepBack");
const stepForwardButton = document.querySelector("#galacticStepForward");

let selectedYear = new Date().getFullYear();
let direction = 0;
let frameId = 0;
let lastFrameTime = 0;

function clampYear(year) {
  return Math.max(YEAR_MIN, Math.min(YEAR_MAX, year));
}

function signedOffset(year) {
  const offset = Math.round(year - new Date().getFullYear());
  if (Math.abs(offset) < 1) return "present";
  return `${offset > 0 ? "+" : ""}${offset.toLocaleString()} years`;
}

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element) element.textContent = text;
}

function renderCards(selector, stars, activeName) {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = stars.map((star) => `
    <div class="${star.name === activeName ? "active" : ""}">
      <strong>${star.name}</strong>
      <span>${star.constellation} / near ${star.year}</span>
      <small>${star.note}; approx ${star.distanceDeg} deg from the pole.</small>
    </div>
  `).join("");
}

function drawGalacticOrbit(snapshot) {
  const svg = document.querySelector("#galacticOrbitSvg");
  if (!svg) return;
  const cx = 405;
  const cy = 315;
  const orbitAngle = snapshot.galactic.orbitAngle * Math.PI / 180;
  const baseSunAngle = -35 * Math.PI / 180;
  const orbitalRadius = 205;
  const sunX = cx + Math.cos(baseSunAngle + orbitAngle) * orbitalRadius;
  const sunY = cy + Math.sin(baseSunAngle + orbitAngle) * orbitalRadius * 0.82;
  const arrowX = sunX + Math.cos(baseSunAngle + orbitAngle + Math.PI / 2) * 48;
  const arrowY = sunY + Math.sin(baseSunAngle + orbitAngle + Math.PI / 2) * 40;
  const spurX = sunX - 36;
  const spurY = sunY + 8;
  svg.innerHTML = `
    <defs>
      <filter id="galaxyGlow"><feGaussianBlur stdDeviation="7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <radialGradient id="galaxyCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(255,238,174,0.98)"/>
        <stop offset="55%" stop-color="rgba(246,200,76,0.34)"/>
        <stop offset="100%" stop-color="rgba(246,200,76,0)"/>
      </radialGradient>
      <radialGradient id="sunMarkerGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.98)"/>
        <stop offset="38%" stop-color="rgba(159,242,255,0.94)"/>
        <stop offset="100%" stop-color="rgba(159,242,255,0)"/>
      </radialGradient>
    </defs>
    <rect width="1100" height="620" rx="18" fill="rgba(1,4,10,0.86)"/>
    <image href="./assets/milky-way-pia10748.jpg" x="55" y="35" width="700" height="700" opacity="0.88" preserveAspectRatio="xMidYMid slice"/>
    <rect x="55" y="35" width="700" height="550" fill="rgba(1,4,10,0.12)"/>
    <ellipse cx="${cx}" cy="${cy}" rx="310" ry="254" fill="none" stroke="rgba(159,242,255,0.12)" stroke-width="32"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${orbitalRadius}" ry="${orbitalRadius * 0.82}" fill="none" stroke="rgba(246,200,76,0.72)" stroke-width="4" stroke-dasharray="14 12"/>
    <circle cx="${cx}" cy="${cy}" r="46" fill="url(#galaxyCore)" filter="url(#galaxyGlow)"/>
    <text x="${cx}" y="${cy + 66}" class="solar-svg-label" text-anchor="middle">Galactic Center</text>
    <path d="M ${spurX - 112} ${spurY - 34} C ${spurX - 58} ${spurY - 66}, ${spurX + 72} ${spurY + 46}, ${spurX + 158} ${spurY + 6}" fill="none" stroke="rgba(89,210,199,0.74)" stroke-width="16" stroke-linecap="round" opacity="0.9"/>
    <text x="${spurX + 82}" y="${spurY + 42}" class="solar-svg-label">Orion Spur / Local Arm</text>
    <text x="${spurX + 82}" y="${spurY + 66}" class="solar-svg-mini">between Sagittarius and Perseus</text>
    <circle cx="${sunX}" cy="${sunY}" r="25" fill="url(#sunMarkerGlow)" filter="url(#galaxyGlow)"/>
    <circle cx="${sunX}" cy="${sunY}" r="7" fill="#ffffff"/>
    <line x1="${sunX}" y1="${sunY}" x2="${arrowX}" y2="${arrowY}" stroke="#9ff2ff" stroke-width="6" stroke-linecap="round"/>
    <path d="M ${arrowX - 13} ${arrowY - 6} L ${arrowX} ${arrowY} L ${arrowX - 5} ${arrowY - 14}" fill="none" stroke="#9ff2ff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="${sunX}" y="${sunY - 32}" class="solar-svg-label" text-anchor="middle">Sun + Solar System</text>
    <text x="792" y="72" class="solar-svg-title">Approximate galactic location</text>
    <text x="792" y="108" class="solar-svg-label">Radius from center: ~26-27k light years</text>
    <text x="792" y="138" class="solar-svg-label">Local structure: ${snapshot.galactic.arm}</text>
    <text x="792" y="168" class="solar-svg-label">Orbit period: ~${(snapshot.galactic.galacticYearYears / 1000000).toFixed(0)}M years</text>
    <text x="792" y="198" class="solar-svg-label">Speed: ~${snapshot.galactic.speedKmS} km/s</text>
    <text x="792" y="246" class="solar-svg-mini">The yellow path shows the Sun's approximate orbit around the galactic center.</text>
    <text x="792" y="274" class="solar-svg-mini">The blue arrow shows rotation/motion direction in this chosen face-on view.</text>
    <text x="792" y="302" class="solar-svg-mini">Spiral arms are structure patterns; stars orbit through them over time.</text>
    <text x="792" y="354" class="solar-svg-label">Selected offset: ${signedOffset(selectedYear)}</text>
    <text x="792" y="384" class="solar-svg-mini">At this scale, +/-50k years is visually tiny: ${snapshot.galactic.orbitPercent.toFixed(4)}% of one orbit.</text>
    <text x="70" y="574" class="solar-svg-mini">Background: NASA/JPL-Caltech Spitzer Milky Way artist concept PIA10748.</text>
  `;
}

function drawPoleCycle(snapshot) {
  const svg = document.querySelector("#poleCycleSvg");
  if (!svg) return;
  const cx = 210;
  const cy = 158;
  const radius = 98;
  const phase = snapshot.deepTime.precession * Math.PI / 180;
  const pointer = {
    x: cx + Math.cos(phase - Math.PI / 2) * radius,
    y: cy + Math.sin(phase - Math.PI / 2) * radius
  };
  const labels = [
    ["Polaris", -90],
    ["Vega", 70],
    ["Thuban", 198],
    ["Alderamin", 22]
  ];
  svg.innerHTML = `
    <rect width="420" height="320" rx="12" fill="rgba(0,0,0,0.18)"/>
    <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="rgba(159,242,255,0.32)" stroke-width="4"/>
    <circle cx="${cx}" cy="${cy}" r="5" fill="rgba(255,255,255,0.75)"/>
    <line x1="${cx}" y1="${cy}" x2="${pointer.x}" y2="${pointer.y}" stroke="#f6c84c" stroke-width="5" stroke-linecap="round"/>
    <circle cx="${pointer.x}" cy="${pointer.y}" r="9" fill="#f6c84c"/>
    ${labels.map(([label, degrees]) => {
      const radians = degrees * Math.PI / 180;
      const x = cx + Math.cos(radians) * (radius + 30);
      const y = cy + Math.sin(radians) * (radius + 30);
      return `<text x="${x}" y="${y}" class="solar-svg-mini" text-anchor="middle">${label}</text>`;
    }).join("")}
    <text x="${cx}" y="292" class="solar-svg-label" text-anchor="middle">Precession phase ${snapshot.deepTime.precession.toFixed(1)} deg</text>
  `;
}

function render() {
  selectedYear = clampYear(Number.parseFloat(yearInput?.value) || new Date().getFullYear());
  if (yearInput && document.activeElement !== yearInput) yearInput.value = String(Math.round(selectedYear));
  const snapshot = solarGeometrySnapshot(new Date(), selectedYear, { name: "Earth", lat: 0, lon: 0 });
  drawGalacticOrbit(snapshot);
  drawPoleCycle(snapshot);
  setText("#galacticOrbitNote", snapshot.galactic.note);
  setText("#galacticOrbitPercent", `${snapshot.galactic.orbitPercent.toFixed(4)}%`);
  setText("#galacticSpeed", `${snapshot.galactic.speedKmS} km/s`);
  setText("#galacticArm", snapshot.galactic.arm);
  renderCards("#northPoleStars", snapshot.poleStars.northStars, snapshot.poleStars.currentNorth.name);
  renderCards("#southPoleStars", snapshot.poleStars.southStars, snapshot.poleStars.currentSouth.name);
  playButton.classList.toggle("playing", direction !== 0);
  playButton.classList.toggle("active", direction === 0);
  playButton.setAttribute("aria-label", direction ? "Pause" : "Play");
  playButton.setAttribute("title", direction ? "Pause" : "Play");
  playButton.setAttribute("aria-pressed", direction ? "true" : "false");
  reverseButton.classList.toggle("active", direction < 0);
  forwardButton.classList.toggle("active", direction > 0);
}

function stop() {
  direction = 0;
  lastFrameTime = 0;
  if (frameId) cancelAnimationFrame(frameId);
  frameId = 0;
  render();
}

function tick(timestamp) {
  if (!direction) return;
  if (!lastFrameTime) lastFrameTime = timestamp;
  const delta = Math.min(0.12, (timestamp - lastFrameTime) / 1000);
  lastFrameTime = timestamp;
  selectedYear = clampYear(selectedYear + direction * PLAY_YEARS_PER_SECOND * delta);
  if (yearInput) yearInput.value = String(Math.round(selectedYear));
  render();
  if (selectedYear <= YEAR_MIN || selectedYear >= YEAR_MAX) {
    stop();
    return;
  }
  frameId = requestAnimationFrame(tick);
}

function play(nextDirection) {
  if (direction === nextDirection) {
    stop();
    return;
  }
  direction = nextDirection;
  lastFrameTime = 0;
  if (!frameId) frameId = requestAnimationFrame(tick);
  render();
}

yearInput?.addEventListener("input", render);
yearInput?.addEventListener("change", render);
stepBackButton?.addEventListener("click", () => {
  selectedYear = clampYear(selectedYear - STEP_YEARS);
  yearInput.value = String(Math.round(selectedYear));
  render();
});
stepForwardButton?.addEventListener("click", () => {
  selectedYear = clampYear(selectedYear + STEP_YEARS);
  yearInput.value = String(Math.round(selectedYear));
  render();
});
reverseButton?.addEventListener("click", () => play(-1));
forwardButton?.addEventListener("click", () => play(1));
playButton?.addEventListener("click", () => direction ? stop() : play(1));
resetButton?.addEventListener("click", () => {
  selectedYear = new Date().getFullYear();
  yearInput.value = String(selectedYear);
  stop();
});

render();
