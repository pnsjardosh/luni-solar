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

function lunarAngle(date) {
  const { sun, moon } = siderealLongitudes(date);
  return wrap(moon - sun);
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

  return new Date(date.getTime() + direction * 29.530588853 * 86400000);
}

function isAdhikMonth(date) {
  const previousNewMoon = findAdjacentNewMoon(date, -1);
  const nextNewMoon = findAdjacentNewMoon(date, 1);
  const previousSunRashi = Math.floor(siderealLongitudes(previousNewMoon).sun / 30);
  const nextSunRashi = Math.floor(siderealLongitudes(nextNewMoon).sun / 30);
  return previousSunRashi === nextSunRashi;
}

function findNextNewMoonAfter(date) {
  const step = 6 * 60 * 60 * 1000;
  let before = new Date(date);
  let beforeAngle = lunarAngle(before);
  for (let i = 1; i < 220; i += 1) {
    const after = new Date(date.getTime() + i * step);
    const afterAngle = lunarAngle(after);
    if (beforeAngle > 300 && afterAngle < 60) {
      let low = before.getTime();
      let high = after.getTime();
      while (high - low > 1000) {
        const mid = Math.floor((low + high) / 2);
        if (lunarAngle(new Date(mid)) > 180) low = mid;
        else high = mid;
      }
      return new Date(high);
    }
    before = after;
    beforeAngle = afterAngle;
  }
  return new Date(date.getTime() + 29.530588853 * 86400000);
}

function localCivilDateUtc(date, timeZone, addDays = 0, utcOffsetMinutes = null) {
  const parts = timeParts(date, timeZone, utcOffsetMinutes);
  return new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) + addDays));
}

function dayAfterNewMoon(newMoon, timeZone, utcOffsetMinutes = null) {
  return localCivilDateUtc(newMoon, timeZone, 1, utcOffsetMinutes);
}

function findDiwaliNewMoon(gregorianYear) {
  const searchStart = new Date(Date.UTC(gregorianYear, 9, 8, 12, 0, 0, 0));
  const searchEnd = new Date(Date.UTC(gregorianYear, 10, 22, 12, 0, 0, 0));
  const target = new Date(Date.UTC(gregorianYear, 10, 1, 12, 0, 0, 0));
  let probe = searchStart;
  let best = null;

  for (let i = 0; i < 4; i += 1) {
    const newMoon = findNextNewMoonAfter(probe);
    if (newMoon > searchEnd) break;
    if (!best || Math.abs(newMoon - target) < Math.abs(best - target)) best = newMoon;
    probe = new Date(newMoon.getTime() + 3 * 86400000);
  }

  return best || findNextNewMoonAfter(searchStart);
}

function findBestuVaras(gregorianYear, timeZone, utcOffsetMinutes = null) {
  return dayAfterNewMoon(findDiwaliNewMoon(gregorianYear), timeZone, utcOffsetMinutes);
}

function gujaratiYearForDate(date, timeZone, utcOffsetMinutes = null) {
  const localDate = localCivilDateUtc(date, timeZone, 0, utcOffsetMinutes);
  const year = localDate.getUTCFullYear();
  const thisYearStart = findBestuVaras(year, timeZone, utcOffsetMinutes);
  const start = localDate >= thisYearStart ? thisYearStart : findBestuVaras(year - 1, timeZone, utcOffsetMinutes);
  const nextStart = findBestuVaras(start.getUTCFullYear() + 1, timeZone, utcOffsetMinutes);
  return { start, nextStart, samvat: start.getUTCFullYear() + 57, localDate };
}

function gujaratiMonthForDate(date, timeZone, utcOffsetMinutes = null) {
  const year = gujaratiYearForDate(date, timeZone, utcOffsetMinutes);
  let monthStart = new Date(year.start);
  let monthSequenceIndex = 0;

  for (let index = 0; monthStart < year.nextStart && index < 14; index += 1) {
    const nextNewMoon = findNextNewMoonAfter(new Date(monthStart.getTime() + 18 * 86400000));
    const nextStart = dayAfterNewMoon(nextNewMoon, timeZone, utcOffsetMinutes);
    const boundedNextStart = nextStart > year.nextStart ? year.nextStart : nextStart;
    const sample = new Date(monthStart.getTime() + 6.5 * 86400000);
    const adhik = isAdhikMonth(sample);
    const name = MONTHS[monthSequenceIndex] || MONTHS[MONTHS.length - 1];
    if (year.localDate >= monthStart && year.localDate < boundedNextStart) {
      return {
        name,
        adhik,
        year: year.samvat,
        start: new Date(monthStart),
        end: new Date(boundedNextStart)
      };
    }
    monthStart = boundedNextStart;
    if (!adhik) monthSequenceIndex = Math.min(monthSequenceIndex + 1, MONTHS.length - 1);
  }

  return { name: MONTHS[0], adhik: false, year: year.samvat, start: year.start, end: year.nextStart };
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

function timeParts(date, timeZone, utcOffsetMinutes = null) {
  if (!timeZone && Number.isFinite(utcOffsetMinutes)) {
    const shifted = new Date(date.getTime() + utcOffsetMinutes * 60000);
    const pad = (value) => String(value).padStart(2, "0");
    return {
      year: String(shifted.getUTCFullYear()),
      month: pad(shifted.getUTCMonth() + 1),
      day: pad(shifted.getUTCDate()),
      hour: pad(shifted.getUTCHours()),
      minute: pad(shifted.getUTCMinutes()),
      second: pad(shifted.getUTCSeconds())
    };
  }
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  const values = Object.fromEntries(formatter.formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  if (values.hour === "24") values.hour = "00";
  return values;
}

function formatIsoLocal(date, timeZone, utcOffsetMinutes = null) {
  const parts = timeParts(date, timeZone, utcOffsetMinutes);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

function dateKey(date, timeZone, utcOffsetMinutes = null) {
  const parts = timeParts(date, timeZone, utcOffsetMinutes);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function searchRiseSetIso(body, observer, direction, date, limitDays) {
  const event = SearchRiseSet(body, observer, direction, date, limitDays, 0);
  return event?.date instanceof Date ? event.date : null;
}

function chooseLocalEvent(date, timeZone, utcOffsetMinutes, ...candidates) {
  const targetKey = dateKey(date, timeZone, utcOffsetMinutes);
  return candidates.find((candidate) => candidate && dateKey(candidate, timeZone, utcOffsetMinutes) === targetKey) || null;
}

function timeRange(start, end) {
  return start && end ? { start: start.toISOString(), end: end.toISOString() } : null;
}

function weekdayIndex(date, timeZone, utcOffsetMinutes = null) {
  if (!timeZone && Number.isFinite(utcOffsetMinutes)) {
    return new Date(date.getTime() + utcOffsetMinutes * 60000).getUTCDay();
  }
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

function dayMuhurtas(date, location, timeZone, utcOffsetMinutes = null) {
  const observer = new Observer(location.lat, location.lon, 0);
  const sunrise = chooseLocalEvent(
    date,
    timeZone,
    utcOffsetMinutes,
    searchRiseSetIso(Body.Sun, observer, +1, date, -2),
    searchRiseSetIso(Body.Sun, observer, +1, date, 2)
  );
  const sunset = chooseLocalEvent(
    date,
    timeZone,
    utcOffsetMinutes,
    searchRiseSetIso(Body.Sun, observer, -1, date, -2),
    searchRiseSetIso(Body.Sun, observer, -1, date, 2)
  );
  const weekday = weekdayIndex(date, timeZone, utcOffsetMinutes);
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

function vikramSamvat(date, state, timeZone, utcOffsetMinutes = null) {
  const monthInfo = gujaratiMonthForDate(date, timeZone, utcOffsetMinutes);
  const month = `${monthInfo.adhik ? "Adhik " : ""}${monthInfo.name}`;
  return {
    year: monthInfo.year,
    month: monthInfo.name,
    adhik: monthInfo.adhik,
    label: `VS ${monthInfo.year} / ${month} / ${state.paksha} ${TITHIS[state.tithiIndex]}`
  };
}

function panchangSummaryAt(date, timeZone, utcOffsetMinutes = null) {
  const state = panchangStateAt(date);
  const samvat = vikramSamvat(date, state, timeZone, utcOffsetMinutes);
  return {
    at: date.toISOString(),
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
      adhik: Boolean(samvat.adhik),
      kshaya: false
    },
    vikramSamvat: samvat,
    astronomy: {
      source: state.source,
      sunLongitude: state.sun,
      moonLongitude: state.moon,
      lunarAngle: state.angle,
      tithiIndex: state.tithiIndex,
      nakshatraIndex: state.nakshatraIndex,
      yogaIndex: state.yogaIndex,
      karanaIndex: state.karanaIndex,
      sunRashiIndex: state.sunRashiIndex,
      moonRashiIndex: state.moonRashiIndex
    }
  };
}

export async function computeProductionPanchang({ at, location, timeZone = "", utcOffsetMinutes = null, tradition = "gujarati-vikram" }) {
  const offsetMinutes = Number.isFinite(utcOffsetMinutes) ? utcOffsetMinutes : null;
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
  const samvat = vikramSamvat(at, state, timeZone, offsetMinutes);
  const monthInfo = gujaratiMonthForDate(at, timeZone, offsetMinutes);
  const muhurta = dayMuhurtas(at, location, timeZone, offsetMinutes);
  const sunriseDate = muhurta.sunrise ? new Date(new Date(muhurta.sunrise).getTime() + 60000) : at;
  const dailyPanchang = panchangSummaryAt(sunriseDate, timeZone, offsetMinutes);

  return {
    time: {
      requestedUtc: at.toISOString(),
      local: formatIsoLocal(at, timeZone, offsetMinutes),
      timezone: timeZone || (Number.isFinite(offsetMinutes) ? `UTC${offsetMinutes >= 0 ? "+" : ""}${(offsetMinutes / 60).toFixed(offsetMinutes % 60 === 0 ? 0 : 1)}` : "UTC"),
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
        adhik: Boolean(samvat.adhik),
        kshaya: false
      },
      vikramSamvat: samvat
    },
    astronomy: {
      source: state.source,
      sunLongitude: state.sun,
      moonLongitude: state.moon,
      lunarAngle: state.angle,
      tithiIndex: state.tithiIndex,
      nakshatraIndex: state.nakshatraIndex,
      yogaIndex: state.yogaIndex,
      karanaIndex: state.karanaIndex,
      sunRashiIndex: state.sunRashiIndex,
      moonRashiIndex: state.moonRashiIndex
    },
    dailyPanchang,
    transitions: {
      tithi: { start: tithiStart?.toISOString() || null, end: tithiEnd?.toISOString() || null },
      nakshatra: { start: nakshatraStart?.toISOString() || null, end: nakshatraEnd?.toISOString() || null },
      yoga: { start: yogaStart?.toISOString() || null, end: yogaEnd?.toISOString() || null },
      karana: { start: karanaStart?.toISOString() || null, end: karanaEnd?.toISOString() || null },
      month: {
        start: monthInfo.start?.toISOString() || null,
        end: monthInfo.end?.toISOString() || null
      }
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
