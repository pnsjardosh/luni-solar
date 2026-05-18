import {
  Body,
  EclipticGeoMoon,
  Observer,
  SearchRiseSet,
  SunPosition
} from "astronomy-engine";

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

function siderealLongitudes(date) {
  const ayanamsha = lahiriAyanamsha(date);
  const sun = wrap(SunPosition(date).elon - ayanamsha);
  const moon = wrap(EclipticGeoMoon(date).lon - ayanamsha);
  return {
    sun,
    moon,
    source: "astronomy-engine"
  };
}

function panchangStateAt(date) {
  const { sun, moon, source } = siderealLongitudes(date);
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
    const probeIndex = boundaryIndex(probe, kind);
    if (probeIndex !== initialIndex) {
      let lo = direction > 0 ? near.getTime() : probe.getTime();
      let hi = direction > 0 ? probe.getTime() : near.getTime();
      while (hi - lo > 1000) {
        const mid = Math.floor((lo + hi) / 2);
        const midIndex = boundaryIndex(new Date(mid), kind);
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

function boundaryIndex(date, kind) {
  const state = panchangStateAt(date);
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

function dateKey(date, timeZone) {
  const parts = timeParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function searchRiseSetIso(body, observer, direction, date, limitDays) {
  const event = SearchRiseSet(body, observer, direction, date, limitDays, 0);
  return event?.date instanceof Date ? event.date : null;
}

function chooseLocalEvent(date, timeZone, ...candidates) {
  const targetKey = dateKey(date, timeZone);
  return candidates.find((candidate) => candidate && dateKey(candidate, timeZone) === targetKey) || null;
}

function timeRange(start, end) {
  return start && end ? { start: start.toISOString(), end: end.toISOString() } : null;
}

function weekdayIndex(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone || "UTC",
    weekday: "short"
  });
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(formatter.format(date));
}

function segmentRange(start, end, segmentIndex) {
  if (!(start instanceof Date) || !(end instanceof Date)) return null;
  const segmentMs = (end.getTime() - start.getTime()) / 8;
  if (!(segmentMs > 0)) return null;
  const segStart = new Date(start.getTime() + segmentMs * segmentIndex);
  const segEnd = new Date(start.getTime() + segmentMs * (segmentIndex + 1));
  return timeRange(segStart, segEnd);
}

function dayMuhurtas(date, location, timeZone) {
  const observer = new Observer(location.lat, location.lon, 0);
  const sunrise = chooseLocalEvent(
    date,
    timeZone,
    searchRiseSetIso(Body.Sun, observer, +1, date, -2),
    searchRiseSetIso(Body.Sun, observer, +1, date, 2)
  );
  const sunset = chooseLocalEvent(
    date,
    timeZone,
    searchRiseSetIso(Body.Sun, observer, -1, date, -2),
    searchRiseSetIso(Body.Sun, observer, -1, date, 2)
  );
  const weekday = weekdayIndex(date, timeZone);
  const rahuSegments = [7, 1, 6, 4, 5, 3, 2];
  const yamagandaSegments = [4, 3, 2, 1, 0, 6, 5];
  const gulikaSegments = [6, 5, 4, 3, 2, 1, 0];

  return {
    sunrise: sunrise?.toISOString() || null,
    sunset: sunset?.toISOString() || null,
    rahuKaal: weekday >= 0 ? segmentRange(sunrise, sunset, rahuSegments[weekday]) : null,
    yamaganda: weekday >= 0 ? segmentRange(sunrise, sunset, yamagandaSegments[weekday]) : null,
    gulika: weekday >= 0 ? segmentRange(sunrise, sunset, gulikaSegments[weekday]) : null,
    chaughadia: []
  };
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
  const state = panchangStateAt(at);
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
  const muhurta = dayMuhurtas(at, location, timeZone);

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
    muhurta,
    engine: {
      name: state.source,
      ayanamsha: "Lahiri",
      tradition,
      precision: "production",
      license: "MIT (Astronomy Engine)"
    }
  };
}
