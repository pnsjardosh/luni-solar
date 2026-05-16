const TITHIS = [
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi", "Amavasya"
];

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const YOGAS = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola",
  "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

const KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"];
const RASHIS = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];
const MONTHS = ["Kartak", "Magshar", "Posh", "Maha", "Fagan", "Chaitra", "Vaishakh", "Jeth", "Ashadh", "Shravan", "Bhadarvo", "Aaso"];

let swissModulePromise;

function wrap(value, max = 360) {
  return ((value % max) + max) % max;
}

function sinDeg(value) {
  return Math.sin(value * Math.PI / 180);
}

function cosDeg(value) {
  return Math.cos(value * Math.PI / 180);
}

function julianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function lahiriAyanamsha(date) {
  const yearsSinceJ2000 = (julianDay(date) - 2451545) / 365.2425;
  return 23.85675 + yearsSinceJ2000 * 0.013968;
}

function fallbackSunLongitude(date) {
  const d = julianDay(date) - 2451545;
  const L = wrap(280.46646 + 0.98564736 * d);
  const g = wrap(357.52911 + 0.98560028 * d);
  const center = 1.914602 * sinDeg(g) + 0.019993 * sinDeg(2 * g) + 0.000289 * sinDeg(3 * g);
  return wrap(L + center);
}

function fallbackMoonLongitude(date) {
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
    0.114332 * sinDeg(2 * F)
  );
}

async function loadSwissEphemeris() {
  if (!swissModulePromise) {
    swissModulePromise = import("swisseph")
      .then((module) => module.default || module)
      .catch(() => null);
  }
  return swissModulePromise;
}

function normalizeSwissResult(result) {
  if (Array.isArray(result)) return result[0];
  if (result?.longitude != null) return result.longitude;
  if (result?.xx?.[0] != null) return result.xx[0];
  if (result?.data?.[0] != null) return result.data[0];
  return null;
}

function calcSwissUt(swe, jd, body, flags) {
  return new Promise((resolve, reject) => {
    try {
      swe.swe_calc_ut(jd, body, flags, (result) => {
        const longitude = normalizeSwissResult(result);
        if (Number.isFinite(longitude)) resolve(longitude);
        else reject(new Error(result?.error || "Swiss Ephemeris returned no longitude"));
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function siderealLongitudes(date) {
  const swe = await loadSwissEphemeris();
  if (swe?.swe_calc_ut) {
    const flags = (swe.SEFLG_SWIEPH || 2) | (swe.SEFLG_SIDEREAL || 65536);
    if (swe.swe_set_sid_mode && swe.SE_SIDM_LAHIRI != null) {
      swe.swe_set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);
    }
    const jd = julianDay(date);
    const sun = wrap(await calcSwissUt(swe, jd, swe.SE_SUN ?? 0, flags));
    const moon = wrap(await calcSwissUt(swe, jd, swe.SE_MOON ?? 1, flags));
    return { sun, moon, source: "swiss-ephemeris" };
  }

  const ayanamsha = lahiriAyanamsha(date);
  return {
    sun: wrap(fallbackSunLongitude(date) - ayanamsha),
    moon: wrap(fallbackMoonLongitude(date) - ayanamsha),
    source: "approximate-fallback"
  };
}

async function panchangStateAt(date) {
  const { sun, moon, source } = await siderealLongitudes(date);
  const angle = wrap(moon - sun);
  const tithiIndex = Math.floor(angle / 12);
  const nakshatraIndex = Math.floor(moon / (360 / 27));
  const yogaIndex = Math.floor(wrap(sun + moon) / (360 / 27));
  const karanaIndex = karanaForAngle(angle);
  const sunRashiIndex = Math.floor(sun / 30);
  const moonRashiIndex = Math.floor(moon / 30);
  return {
    source,
    sun,
    moon,
    angle,
    tithiIndex,
    nakshatraIndex,
    yogaIndex,
    karanaIndex,
    sunRashiIndex,
    moonRashiIndex,
    paksha: tithiIndex < 15 ? "Shukla" : "Krishna",
    monthIndex: Math.floor(wrap(sun + 195) / 30)
  };
}

function karanaForAngle(angle) {
  const halfTithi = Math.floor(angle / 6);
  if (halfTithi === 0) return 7;
  if (halfTithi === 57) return 8;
  if (halfTithi === 58) return 9;
  if (halfTithi === 59) return 10;
  return (halfTithi - 1) % 7;
}

function karanaName(index) {
  return ["Kimstughna", ...KARANAS, "Shakuni", "Chatushpada", "Naga"][index] || "Bava";
}

async function findBoundary(date, kind, direction, initialIndex) {
  const hour = 60 * 60 * 1000;
  let near = new Date(date);
  for (let i = 0; i < 96; i += 1) {
    const probe = new Date(near.getTime() + direction * hour);
    const probeIndex = await boundaryIndex(probe, kind);
    if (probeIndex !== initialIndex) {
      let lo = direction > 0 ? near.getTime() : probe.getTime();
      let hi = direction > 0 ? probe.getTime() : near.getTime();
      while (hi - lo > 1000) {
        const mid = Math.floor((lo + hi) / 2);
        const midIndex = await boundaryIndex(new Date(mid), kind);
        if (direction > 0) {
          if (midIndex === initialIndex) lo = mid;
          else hi = mid;
        } else if (midIndex === initialIndex) {
          hi = mid;
        } else {
          lo = mid;
        }
      }
      return new Date(hi);
    }
    near = probe;
  }
  return null;
}

async function boundaryIndex(date, kind) {
  const state = await panchangStateAt(date);
  if (kind === "nakshatra") return state.nakshatraIndex;
  if (kind === "yoga") return state.yogaIndex;
  if (kind === "karana") return state.karanaIndex;
  return state.tithiIndex;
}

function timeParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  return Object.fromEntries(formatter.formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}

function formatIsoLocal(date, timeZone) {
  const parts = timeParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

function vikramSamvat(date, state, timeZone) {
  const parts = timeParts(date, timeZone);
  const localDate = new Date(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
  const boundary = new Date(localDate.getFullYear(), 2, 22);
  const year = localDate >= boundary ? localDate.getFullYear() + 57 : localDate.getFullYear() + 56;
  const month = MONTHS[state.monthIndex] || MONTHS[0];
  return {
    year,
    month,
    label: `VS ${year} / ${month} / ${state.paksha} ${TITHIS[state.tithiIndex]}`
  };
}

export async function computeProductionPanchang({ at, location, timeZone = "", tradition = "gujarati-vikram" }) {
  const state = await panchangStateAt(at);
  const [tithiStart, tithiEnd, nakshatraStart, nakshatraEnd, yogaStart, yogaEnd, karanaStart, karanaEnd] = await Promise.all([
    findBoundary(at, "tithi", -1, state.tithiIndex),
    findBoundary(at, "tithi", 1, state.tithiIndex),
    findBoundary(at, "nakshatra", -1, state.nakshatraIndex),
    findBoundary(at, "nakshatra", 1, state.nakshatraIndex),
    findBoundary(at, "yoga", -1, state.yogaIndex),
    findBoundary(at, "yoga", 1, state.yogaIndex),
    findBoundary(at, "karana", -1, state.karanaIndex),
    findBoundary(at, "karana", 1, state.karanaIndex)
  ]);
  const samvat = vikramSamvat(at, state, timeZone);

  return {
    time: {
      requestedUtc: at.toISOString(),
      local: formatIsoLocal(at, timeZone),
      timezone: timeZone || "UTC",
      location
    },
    panchang: {
      tithi: { index: state.tithiIndex + 1, name: TITHIS[state.tithiIndex], paksha: state.paksha },
      paksha: state.paksha,
      nakshatra: { index: state.nakshatraIndex + 1, name: NAKSHATRAS[state.nakshatraIndex] },
      yoga: { index: state.yogaIndex + 1, name: YOGAS[state.yogaIndex] },
      karana: { index: state.karanaIndex + 1, name: karanaName(state.karanaIndex) },
      rashi: {
        sun: RASHIS[state.sunRashiIndex],
        moon: RASHIS[state.moonRashiIndex]
      },
      lunarMonth: {
        name: samvat.month,
        adhik: false,
        kshaya: false
      },
      vikramSamvat: samvat
    },
    transitions: {
      tithi: { start: tithiStart?.toISOString() || null, end: tithiEnd?.toISOString() || null },
      nakshatra: { start: nakshatraStart?.toISOString() || null, end: nakshatraEnd?.toISOString() || null },
      yoga: { start: yogaStart?.toISOString() || null, end: yogaEnd?.toISOString() || null },
      karana: { start: karanaStart?.toISOString() || null, end: karanaEnd?.toISOString() || null },
      month: { start: null, end: null }
    },
    muhurta: {
      sunrise: null,
      sunset: null,
      rahuKaal: null,
      yamaganda: null,
      gulika: null,
      chaughadia: []
    },
    engine: {
      name: state.source,
      ayanamsha: "Lahiri",
      tradition,
      precision: state.source === "swiss-ephemeris" ? "production" : "approximate-fallback",
      license: state.source === "swiss-ephemeris" ? "Swiss Ephemeris GPL/free-compatible use; review before commercial use" : "fallback"
    }
  };
}
