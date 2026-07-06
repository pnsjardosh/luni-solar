Below is a Codex-ready implementation specification, ordered by priority and designed to avoid mixing astronomical logic with Gujarati calendar rules.

# Task: Make the Luni-Solar App Astronomically and Calendrically Reliable

## Repository

`pnsjardosh/luni-solar`

## Primary goal

Refactor and correct the pañcāṅga implementation so that the application clearly distinguishes:

1. Modern astronomical ephemeris calculations
2. Sidereal conversion using ayanāṃśa
3. Pañcāṅga element derivation
4. Gujarati calendar rules
5. Festival and civil-day rules
6. Educational deep-time approximations

Do not change the existing visual design more than necessary. Focus first on calculation correctness, architecture, testability, and explicit labeling.

---

# Phase 1 — Refactor the calculation architecture

## 1. Create an ephemeris-provider interface

Create:

```text
src/server/astronomy/ephemeris-provider.js
```

Define a provider contract:

```javascript
export class EphemerisProvider {
  getTropicalSunLongitude(date) {
    throw new Error("Not implemented");
  }

  getTropicalMoonLongitude(date) {
    throw new Error("Not implemented");
  }

  getAyanamsha(date) {
    throw new Error("Not implemented");
  }

  getSiderealSunLongitude(date) {
    return normalizeDegrees(
      this.getTropicalSunLongitude(date) - this.getAyanamsha(date)
    );
  }

  getSiderealMoonLongitude(date) {
    return normalizeDegrees(
      this.getTropicalMoonLongitude(date) - this.getAyanamsha(date)
    );
  }

  getMetadata() {
    return {};
  }
}
```

Create reusable helpers:

```text
src/server/astronomy/math.js
```

Include:

```javascript
export function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

export function angularDifference(a, b) {
  return normalizeDegrees(a - b);
}
```

---

## 2. Move the existing Astronomy Engine implementation into a provider

Create:

```text
src/server/astronomy/astronomy-engine-provider.js
```

Use:

```javascript
SunPosition(date).elon
EclipticGeoMoon(date).lon
```

Do not perform pañcāṅga calculations inside the provider.

The provider should return metadata:

```javascript
{
  ephemeris: "Astronomy Engine",
  coordinateSystem: "geocentric apparent ecliptic longitude of date",
  siderealModel: "Approximate Lahiri-style",
  precisionLabel: "modern astronomical approximation",
  license: "MIT"
}
```

---

## 3. Rename the current ayanāṃśa implementation

The existing function:

```javascript
function lahiriAyanamsha(date)
```

is a linear approximation and must not be labeled as an authoritative Lahiri implementation.

Rename it to:

```javascript
function approximateLahiriAyanamsha(date)
```

Change all UI and API labels from:

```text
Lahiri
```

to:

```text
Approximate Lahiri-style
```

or:

```text
Approximate Chitrapaksha/Lahiri
```

Do not use:

```text
precision: "production"
```

Replace it with:

```javascript
precision: "modern-calendar approximation"
```

---

# Phase 2 — Separate pañcāṅga calculations from ephemeris

## 4. Create a pure pañcāṅga calculator

Create:

```text
src/server/panchang/panchang-elements.js
```

This module must accept longitudes and derive the pañcāṅga elements without knowing how those longitudes were calculated.

Implement:

```javascript
export function calculateTithi(sunLongitude, moonLongitude)
export function calculatePaksha(tithiIndex)
export function calculateNakshatra(moonLongitude)
export function calculateYoga(sunLongitude, moonLongitude)
export function calculateKarana(sunLongitude, moonLongitude)
export function calculateRashi(longitude)
```

Use exact spans:

```javascript
const TITHI_SPAN = 12;
const KARANA_SPAN = 6;
const NAKSHATRA_SPAN = 360 / 27;
const YOGA_SPAN = 360 / 27;
const RASHI_SPAN = 30;
```

Expected formulas:

```javascript
const elongation = normalizeDegrees(moonLongitude - sunLongitude);

const tithiIndex = Math.floor(elongation / 12);
const nakshatraIndex = Math.floor(
  normalizeDegrees(moonLongitude) / (360 / 27)
);
const yogaIndex = Math.floor(
  normalizeDegrees(sunLongitude + moonLongitude) / (360 / 27)
);
const rashiIndex = Math.floor(
  normalizeDegrees(longitude) / 30
);
```

Preserve the existing karaṇa sequence because it is structurally correct.

Add JSDoc comments explaining the astronomical meaning of each formula.

---

## 5. Distinguish “selected-time pañcāṅga” from “sunrise-day pañcāṅga”

The application currently returns both the state at the selected instant and the state at sunrise.

Make this explicit in API output.

Use:

```javascript
{
  selectedTimePanchang: { ... },
  sunriseDayPanchang: { ... }
}
```

Do not use a generic `panchang` object for one and `dailyPanchang` for the other without explanation.

In the UI, label them:

```text
At Selected Time
At Local Sunrise
```

Add a tooltip or note:

```text
Traditional civil-day observance usually follows the tithi prevailing at local sunrise. The selected-time view shows the astronomical state at the chosen instant.
```

---

# Phase 3 — Improve boundary calculations

## 6. Replace index-change boundary detection with angular target solving

Current logic searches until an index changes, then binary-searches the change.

Replace it with direct boundary targets where practical.

For tithi:

```javascript
target = (currentTithiIndex + 1) * 12;
```

For karaṇa:

```javascript
target = (currentHalfTithiIndex + 1) * 6;
```

For nakṣatra:

```javascript
target = (currentNakshatraIndex + 1) * (360 / 27);
```

For yoga:

```javascript
target = (currentYogaIndex + 1) * (360 / 27);
```

Implement a generic root finder:

```text
src/server/astronomy/boundary-search.js
```

Suggested API:

```javascript
export function findAngularBoundary({
  startDate,
  direction,
  valueAt,
  targetAngle,
  maxHours,
  stepMinutes
})
```

Requirements:

1. Handle the `0°/360°` wrap correctly.
2. Step until the target is bracketed.
3. Binary-search to one-second precision.
4. Return `null` only when the boundary cannot be bracketed within the configured interval.
5. Add tests around wraparound boundaries.

---

# Phase 4 — Correct Gujarati lunar-month logic

## 7. Separate astronomical lunar month from civil Gujarati month

Create:

```text
src/server/calendar/lunar-month.js
```

Expose two concepts:

```javascript
calculateAstronomicalLunarMonth(date, provider)
calculateGujaratiCivilMonth(date, location, timeZone, provider)
```

Definitions:

### Astronomical lunar month

The amānta month interval is:

```text
previous true new moon <= selected instant < next true new moon
```

### Civil Gujarati month

The civil month label changes according to the local civil-day rule following the relevant new moon.

Do not use one object for both concepts.

---

## 8. Implement solar-ingress counting between new moons

Create:

```javascript
countSolarIngresses(startNewMoon, endNewMoon, provider)
```

The function must identify every sidereal solar longitude crossing a multiple of 30° between the two new moons.

Return:

```javascript
{
  count,
  ingresses: [
    {
      fromRashiIndex,
      toRashiIndex,
      at
    }
  ]
}
```

Use the following interpretation:

```text
0 solar ingresses → adhika month
1 solar ingress   → normal month
2 solar ingresses → kṣaya-month condition
```

Do not determine adhika month merely by sampling the Sun at two new moons unless the method has been proven equivalent for the interval.

---

## 9. Implement kṣaya-māsa detection

Remove every hardcoded:

```javascript
kshaya: false
```

Replace it with real calculation.

Return:

```javascript
{
  adhik: boolean,
  kshaya: boolean,
  ingressCount: number
}
```

If the full traditional naming rule for the omitted month has not yet been implemented, return:

```javascript
{
  kshaya: true,
  omittedMonthName: null,
  status: "detected-unresolved"
}
```

Do not silently report `false`.

---

# Phase 5 — Replace the Diwali heuristic

## 10. Remove “nearest new moon to November 1”

Delete the existing logic that chooses the new moon nearest November 1.

Do not identify Diwali from an approximate Gregorian date.

Create:

```text
src/server/calendar/gujarati-new-year.js
```

Implement a rule-based flow:

1. Search candidate new moons within a broad interval around the expected season.
2. Determine the Gujarati lunar month of each candidate.
3. Identify the appropriate Āso/Kārtika amāvasyā according to the selected Gujarati amānta tradition.
4. Calculate local sunset and pradoṣa interval.
5. Determine which civil date receives the Diwali observance.
6. Define Gujarati New Year as Kartak Śukla Pratipadā according to the chosen civil-day rule.

Return metadata describing the decision:

```javascript
{
  diwaliDate,
  newMoonTime,
  bestuVarasDate,
  rule: "Gujarati amanta / Kartak Shukla Pratipada",
  diagnostics: {
    candidateMonth,
    amavasyaAtSunset,
    sunriseTithi,
    sunsetTithi
  }
}
```

If the festival rule remains incomplete, mark it as:

```text
experimental
```

Do not present it as authoritative.

---

# Phase 6 — Implement Choghadiya properly

## 11. Replace the empty array

The current code returns:

```javascript
chaughadia: []
```

Implement full daytime and nighttime Choghadiya.

Create:

```text
src/server/muhurta/choghadiya.js
```

Requirements:

1. Divide sunrise to sunset into eight equal daytime segments.
2. Divide sunset to next sunrise into eight equal nighttime segments.
3. Use weekday-specific starting sequence.
4. Return all segment names and time ranges.
5. Return the currently active Choghadiya.
6. Support both daytime and nighttime.

Use normalized labels:

```javascript
[
  "Udvega",
  "Chara",
  "Labha",
  "Amrita",
  "Kala",
  "Shubha",
  "Roga"
]
```

Confirm the weekday sequences from a reliable traditional table before hardcoding them.

Suggested output:

```javascript
{
  current: {
    name: "Labha",
    start,
    end,
    period: "day"
  },
  day: [...],
  night: [...]
}
```

Until this implementation exists, hide or disable the Choghadiya UI instead of showing empty values.

---

# Phase 7 — Improve sunrise and daily-rule handling

## 12. Preserve sunrise-based civil-day logic but make it explicit

Continue using local observer-based sunrise and sunset from Astronomy Engine.

Do not add an arbitrary one-minute offset without documenting why.

Replace:

```javascript
sunrise + 1 minute
```

with either:

```javascript
sunrise + 1 second
```

or a boundary-safe evaluation helper:

```javascript
evaluateImmediatelyAfter(eventTime)
```

Document:

```text
The state immediately after sunrise is used to avoid floating-point ambiguity when a transition occurs exactly at sunrise.
```

Also return:

```javascript
{
  sunrise,
  sunset,
  nextSunrise
}
```

because nighttime Choghadiya requires next sunrise.

---

# Phase 8 — Clarify the solar-geometry screen

## 13. Correct Uttarāyaṇa and Dakṣiṇāyana wording

Replace wording equivalent to:

```text
Earth's axial tilt drives solstices, seasons, Uttarayana and Dakshinayana.
```

with:

```text
Earth’s axial tilt produces the annual north-south motion of solar declination, the solstices, and the physical basis of Uttarāyaṇa and Dakṣiṇāyana. Sidereal Makara and Karka saṅkrāntis occur later than the tropical solstices because of ayanāṃśa.
```

---

## 14. Clearly mark deep-time calculations as educational

Keep the existing label:

```text
Educational approximations
```

Add it next to all deep-time values:

* obliquity
* eccentricity
* precession phase
* pole-star changes
* Milanković cycle playback

Do not imply that the simple sinusoidal approximations are precision paleoclimate calculations.

Add:

```text
Deep-time values are simplified visual models and are not intended for scientific reconstruction or navigation.
```

---

# Phase 9 — Fix GitHub Pages deployment

## 15. Use an explicit API base URL

GitHub Pages cannot run the Node/Vercel API.

Create:

```text
src/config/runtime-config.js
```

Implement:

```javascript
export function getApiBaseUrl() {
  if (window.location.hostname.endsWith("github.io")) {
    return "https://YOUR-VERCEL-DEPLOYMENT.vercel.app";
  }

  return "";
}
```

All frontend requests must use:

```javascript
fetch(`${getApiBaseUrl()}/api/panchang?...`)
```

Make the Vercel URL configurable through:

```javascript
window.LUNI_SOLAR_CONFIG
```

or a build-time environment variable.

Do not hardcode a placeholder in production.

---

## 16. Add an explicit deployment health state

If the API call fails, show:

```text
Pañcāṅga calculation service is unavailable on this deployment.
```

Also show:

```text
Astronomical visualizations may still work locally in the browser.
```

Do not leave cards indefinitely displaying `--` or “Checking engine.”

Add:

```javascript
{
  status: "available" | "degraded" | "unavailable",
  message: string
}
```

---

# Phase 10 — Add accuracy metadata to the UI

## 17. Add a “Calculation Method” panel

Display:

```text
Ephemeris:
Astronomy Engine

Coordinate system:
Geocentric apparent ecliptic longitude of date

Sidereal conversion:
Approximate Lahiri-style ayanāṃśa

Calendar tradition:
Gujarati Vikram Samvat, amānta

Daily assignment:
Tithi prevailing at local sunrise

Accuracy status:
Modern astronomical approximation; festival rules may vary by regional tradition
```

Do not use the word:

```text
authoritative
```

until validated against trusted reference ephemerides and calendar publications.

---

# Phase 11 — Add automated validation

## 18. Expand test coverage

Create or expand:

```text
test/panchang-engine.test.js
test/panchang-elements.test.js
test/lunar-month.test.js
test/gujarati-new-year.test.js
test/choghadiya.test.js
test/boundary-search.test.js
```

Minimum required tests:

### Pañcāṅga element tests

1. New moon:

   * elongation near `0°`
   * Śukla Pratipadā
   * Kiṃstughna karaṇa

2. Full moon:

   * elongation near `180°`
   * Pūrṇimā boundary

3. Tithi wrap:

   * `359.99°` to `0°`

4. Nakṣatra boundary:

   * Moon exactly near `13°20′`

5. Yoga wrap:

   * Sun + Moon crossing `360°`

6. Rāśi boundaries:

   * `29.999°`
   * `30°`
   * `359.999°`

### Karaṇa tests

Verify all sixty half-tithi positions, especially:

```text
0  → Kiṃstughna
57 → Śakuni
58 → Catuṣpada
59 → Nāga
```

### Lunar-month tests

Include:

1. one normal month
2. one known adhika month
3. one known kṣaya-month case
4. new-moon instant versus following civil day
5. sidereal saṅkrānti near new moon

### Time-zone tests

Include:

1. `Asia/Kolkata`
2. `America/New_York`
3. DST transition date
4. location near International Date Line
5. negative and fractional UTC offsets

### Sunrise tests

Include high-latitude cases where sunrise or sunset may not occur.

The application must return a clear unavailable state instead of throwing.

---

## 19. Add external validation fixtures

Create:

```text
test/fixtures/reference-panchang.json
```

Each fixture should include:

```javascript
{
  date,
  location,
  timezone,
  expected: {
    tithi,
    nakshatra,
    yoga,
    karana,
    sunRashi,
    moonRashi,
    sunrise,
    sunset,
    lunarMonth,
    adhik
  },
  source
}
```

Use several trusted reference sources and record the exact source name and publication date.

Do not silently tune the implementation to one website. Differences may arise from:

* ayanāṃśa
* ephemeris model
* sunrise definition
* geographic coordinates
* festival tradition

The test output should show the likely reason for a discrepancy.

---

# Phase 12 — Add historical calculation modes later

## 20. Prepare but do not yet fake Sūrya Siddhānta or Āryabhaṭīya modes

Create provider placeholders:

```text
src/server/astronomy/surya-siddhanta-provider.js
src/server/astronomy/aryabhatiya-provider.js
```

They may initially throw:

```javascript
throw new Error("Historical model not yet implemented");
```

Do not label the current modern ephemeris as Sūrya Siddhānta-derived.

The future UI mode selector should support:

```text
Modern Drik
Sūrya Siddhānta
Āryabhaṭīya
```

Only enable a mode after all constants, epochs, correction procedures, and tests are implemented.

---

# API output target

Refactor `/api/panchang` toward this shape:

```javascript
{
  time: {
    requestedUtc,
    local,
    timezone,
    location
  },

  calculationMethod: {
    ephemeris,
    coordinateSystem,
    siderealModel,
    tradition,
    precisionLabel
  },

  selectedTimePanchang: {
    tithi,
    paksha,
    nakshatra,
    yoga,
    karana,
    rashi,
    astronomicalLunarMonth
  },

  sunriseDayPanchang: {
    date,
    sunrise,
    tithi,
    paksha,
    nakshatra,
    yoga,
    karana,
    civilGujaratiMonth,
    vikramSamvat
  },

  transitions: {
    tithi,
    nakshatra,
    yoga,
    karana,
    lunarMonth
  },

  muhurta: {
    sunrise,
    sunset,
    nextSunrise,
    rahuKaal,
    yamaganda,
    gulika,
    choghadiya
  },

  calendarDiagnostics: {
    previousNewMoon,
    nextNewMoon,
    solarIngresses,
    adhik,
    kshaya,
    yearStartRule
  },

  warnings: []
}
```

---

# Non-negotiable requirements

1. Do not silently hardcode `kshaya: false`.
2. Do not identify Diwali as the new moon closest to November 1.
3. Do not label the linear ayanāṃśa as authoritative Lahiri.
4. Do not display Choghadiya until it is calculated.
5. Do not conflate selected-time tithi with sunrise-day tithi.
6. Do not call the current output “Sūrya Siddhānta calculations.”
7. Do not use `precision: "production"` until reference validation is added.
8. Preserve all existing functionality that is already correct.
9. Add unit tests for every corrected rule.
10. Keep astronomical calculations and regional calendar rules in separate modules.

---

# Recommended implementation order

Implement in this order:

```text
1. Provider abstraction
2. Pure pañcāṅga element module
3. Selected-time versus sunrise-day separation
4. API base URL fix for GitHub Pages
5. Ayanāṃśa relabeling
6. Choghadiya implementation
7. Solar-ingress counter
8. Adhika and kṣaya month handling
9. Gujarati lunar-month refactor
10. Diwali and Gujarati New Year rule engine
11. Validation fixtures
12. Historical Sūrya Siddhānta and Āryabhaṭīya providers
```

After each phase:

```text
- run all tests
- preserve API backward compatibility where reasonable
- document intentional breaking changes
- update README
- include calculation-method metadata in the UI
```

---

# Definition of done

The task is complete when:

1. The GitHub Pages deployment successfully calls the configured live API.
2. The app clearly shows both selected-time and sunrise-day pañcāṅga.
3. Choghadiya is fully calculated or hidden.
4. Ayanāṃśa is labeled honestly.
5. Adhika and kṣaya month status are calculated, not hardcoded.
6. Diwali is no longer selected using Gregorian-date proximity.
7. Gujarati New Year follows an explicit documented rule.
8. Calculation metadata is visible.
9. Boundary and calendar edge cases have automated tests.
10. No UI text implies direct Sūrya Siddhānta calculation unless that provider is explicitly selected and implemented.

Use this first as one Codex task for the architecture and P0 items; then split the month/festival logic into a second task because that portion deserves isolated tests and review.
