import { Body, Observer, SearchRiseSet } from "astronomy-engine";
import { findAngularBoundary } from "./astronomy/boundary-search.js";
import { AstronomyEngineProvider } from "./astronomy/astronomy-engine-provider.js";
import { normalizeDegrees } from "./astronomy/math.js";
import {
  KARANA_SPAN,
  NAKSHATRA_SPAN,
  RASHI_SPAN,
  TITHI_SPAN,
  YOGA_SPAN,
  NAKSHATRAS,
  RASHIS,
  TITHIS,
  YOGAS,
  calculatePanchangElements,
  karanaName
} from "./panchang/panchang-elements.js";
import { calculateGujaratiCivilMonth, calculateAstronomicalLunarMonth } from "./calendar/lunar-month.js";
import { gujaratiYearForDate } from "./calendar/gujarati-new-year.js";
import { dateKey, evaluateImmediatelyAfter, formatIsoLocal, weekdayIndex } from "./calendar/time.js";
import { calculateChoghadiya } from "./muhurta/choghadiya.js";

const DEFAULT_PROVIDER = new AstronomyEngineProvider();

function stateAt(date, provider = DEFAULT_PROVIDER) {
  const metadata = provider.getMetadata();
  return calculatePanchangElements({
    sunLongitude: provider.getSiderealSunLongitude(date),
    moonLongitude: provider.getSiderealMoonLongitude(date),
    source: metadata.ephemeris || "Astronomy Engine"
  });
}

function stateToPanchang(state, lunarMonth = null, vikramSamvat = null) {
  return {
    tithi: { index: state.tithiIndex + 1, name: TITHIS[state.tithiIndex], paksha: state.paksha },
    paksha: state.paksha,
    nakshatra: { index: state.nakshatraIndex + 1, name: NAKSHATRAS[state.nakshatraIndex] },
    yoga: { index: state.yogaIndex + 1, name: YOGAS[state.yogaIndex] },
    karana: { index: state.karanaIndex + 1, name: karanaName(state.karanaIndex), halfTithiIndex: state.halfTithiIndex },
    rashi: {
      sun: RASHIS[state.sunRashiIndex],
      moon: RASHIS[state.moonRashiIndex]
    },
    lunarMonth,
    vikramSamvat,
    astronomy: {
      source: state.source,
      sunLongitude: state.sun,
      moonLongitude: state.moon,
      lunarAngle: state.angle,
      tithiIndex: state.tithiIndex,
      nakshatraIndex: state.nakshatraIndex,
      yogaIndex: state.yogaIndex,
      karanaIndex: state.karanaIndex,
      halfTithiIndex: state.halfTithiIndex,
      sunRashiIndex: state.sunRashiIndex,
      moonRashiIndex: state.moonRashiIndex
    }
  };
}

function formatCivilMonth(monthInfo) {
  if (!monthInfo) return null;
  return {
    name: monthInfo.name,
    adhik: Boolean(monthInfo.adhik),
    kshaya: Boolean(monthInfo.kshaya),
    ingressCount: monthInfo.ingressCount,
    omittedMonthName: monthInfo.omittedMonthName ?? null,
    status: monthInfo.status,
    start: monthInfo.start?.toISOString() || null,
    end: monthInfo.end?.toISOString() || null
  };
}

function vikramSamvat(date, state, location, timeZone, provider, utcOffsetMinutes = null) {
  const yearInfo = gujaratiYearForDate(date, location, timeZone, provider, utcOffsetMinutes);
  const civilMonth = calculateGujaratiCivilMonth(date, location, timeZone, provider, utcOffsetMinutes);
  const month = `${civilMonth.adhik ? "Adhik " : ""}${civilMonth.name}`;
  return {
    year: yearInfo.samvat,
    month: civilMonth.name,
    adhik: Boolean(civilMonth.adhik),
    kshaya: Boolean(civilMonth.kshaya),
    label: `VS ${yearInfo.samvat} / ${month} / ${state.paksha} ${TITHIS[state.tithiIndex]}`,
    yearStart: yearInfo.start.toISOString(),
    nextYearStart: yearInfo.nextStart.toISOString(),
    yearStartRule: yearInfo.yearStartRule
  };
}

function panchangSummaryAt(date, location, timeZone, provider, utcOffsetMinutes = null) {
  const state = stateAt(date, provider);
  const astronomicalMonth = calculateAstronomicalLunarMonth(date, provider);
  const civilMonth = calculateGujaratiCivilMonth(date, location, timeZone, provider, utcOffsetMinutes);
  const samvat = vikramSamvat(date, state, location, timeZone, provider, utcOffsetMinutes);
  return {
    at: date.toISOString(),
    ...stateToPanchang(state, {
      start: astronomicalMonth.start.toISOString(),
      end: astronomicalMonth.end.toISOString(),
      fullMoonNakshatra: astronomicalMonth.fullMoonNakshatra
    }, samvat),
    civilGujaratiMonth: formatCivilMonth(civilMonth)
  };
}

function boundaryTarget(state, kind, direction) {
  if (kind === "tithi") return normalizeDegrees((state.tithiIndex + (direction > 0 ? 1 : 0)) * TITHI_SPAN);
  if (kind === "karana") return normalizeDegrees((state.halfTithiIndex + (direction > 0 ? 1 : 0)) * KARANA_SPAN);
  if (kind === "nakshatra") return normalizeDegrees((state.nakshatraIndex + (direction > 0 ? 1 : 0)) * NAKSHATRA_SPAN);
  if (kind === "yoga") return normalizeDegrees((state.yogaIndex + (direction > 0 ? 1 : 0)) * YOGA_SPAN);
  return 0;
}

function valueAtForBoundary(kind, provider) {
  if (kind === "tithi" || kind === "karana") {
    return (date) => normalizeDegrees(provider.getSiderealMoonLongitude(date) - provider.getSiderealSunLongitude(date));
  }
  if (kind === "nakshatra") return (date) => provider.getSiderealMoonLongitude(date);
  if (kind === "yoga") {
    return (date) => normalizeDegrees(provider.getSiderealSunLongitude(date) + provider.getSiderealMoonLongitude(date));
  }
  return () => 0;
}

function findBoundary(date, kind, direction, state, provider) {
  return findAngularBoundary({
    startDate: date,
    direction,
    valueAt: valueAtForBoundary(kind, provider),
    targetAngle: boundaryTarget(state, kind, direction),
    maxHours: kind === "tithi" ? 72 : 48,
    stepMinutes: kind === "karana" ? 20 : 60
  });
}

function searchRiseSetIso(body, observer, direction, date, limitDays) {
  const event = SearchRiseSet(body, observer, direction, date, limitDays, 0);
  return event?.date instanceof Date ? event.date : null;
}

function chooseLocalEvent(date, timeZone, utcOffsetMinutes, ...candidates) {
  const targetKey = dateKey(date, timeZone, utcOffsetMinutes);
  return candidates.find((candidate) => candidate && dateKey(candidate, timeZone, utcOffsetMinutes) === targetKey) || null;
}

function nextLocalEventAfter(date, timeZone, utcOffsetMinutes, ...candidates) {
  return candidates
    .filter((candidate) => candidate && candidate > date && dateKey(candidate, timeZone, utcOffsetMinutes) !== dateKey(date, timeZone, utcOffsetMinutes))
    .sort((a, b) => a - b)[0] || null;
}

function timeRange(start, end) {
  return start && end ? { start: start.toISOString(), end: end.toISOString() } : null;
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
    searchRiseSetIso(Body.Sun, observer, +1, date, -3),
    searchRiseSetIso(Body.Sun, observer, +1, date, 3)
  );
  const sunset = chooseLocalEvent(
    date,
    timeZone,
    utcOffsetMinutes,
    searchRiseSetIso(Body.Sun, observer, -1, date, -3),
    searchRiseSetIso(Body.Sun, observer, -1, date, 3)
  );
  const nextSunrise = nextLocalEventAfter(
    date,
    timeZone,
    utcOffsetMinutes,
    searchRiseSetIso(Body.Sun, observer, +1, date, 1),
    searchRiseSetIso(Body.Sun, observer, +1, date, 3)
  );
  const weekday = weekdayIndex(date, timeZone, utcOffsetMinutes);
  const rahuSegments = [7, 1, 6, 4, 5, 3, 2];
  const yamagandaSegments = [4, 3, 2, 1, 0, 6, 5];
  const gulikaSegments = [6, 5, 4, 3, 2, 1, 0];
  const choghadiya = calculateChoghadiya({ date, weekday, sunrise, sunset, nextSunrise });

  return {
    sunrise: sunrise?.toISOString() || null,
    sunset: sunset?.toISOString() || null,
    nextSunrise: nextSunrise?.toISOString() || null,
    rahuKaal: weekday >= 0 ? segmentRange(sunrise, sunset, rahuSegments[weekday]) : null,
    yamaganda: weekday >= 0 ? segmentRange(sunrise, sunset, yamagandaSegments[weekday]) : null,
    gulika: weekday >= 0 ? segmentRange(sunrise, sunset, gulikaSegments[weekday]) : null,
    choghadiya
  };
}

function compatibilityMonth(civilMonth) {
  return {
    name: civilMonth?.name || "--",
    adhik: Boolean(civilMonth?.adhik),
    kshaya: Boolean(civilMonth?.kshaya)
  };
}

export async function computeProductionPanchang({ at, location, timeZone = "", utcOffsetMinutes = null, tradition = "gujarati-vikram", provider = DEFAULT_PROVIDER }) {
  const offsetMinutes = Number.isFinite(utcOffsetMinutes) ? utcOffsetMinutes : null;
  const state = stateAt(at, provider);
  const metadata = provider.getMetadata();
  const selectedMonth = calculateGujaratiCivilMonth(at, location, timeZone, provider, offsetMinutes);
  const selectedSamvat = vikramSamvat(at, state, location, timeZone, provider, offsetMinutes);
  const muhurta = dayMuhurtas(at, location, timeZone, offsetMinutes);
  const sunriseDate = muhurta.sunrise ? evaluateImmediatelyAfter(new Date(muhurta.sunrise)) : at;
  const selectedTimePanchang = panchangSummaryAt(at, location, timeZone, provider, offsetMinutes);
  const sunriseDayPanchang = panchangSummaryAt(sunriseDate, location, timeZone, provider, offsetMinutes);

  const [tithiStart, tithiEnd, nakshatraStart, nakshatraEnd, yogaStart, yogaEnd, karanaStart, karanaEnd] = await Promise.all([
    findBoundary(at, "tithi", -1, state, provider),
    findBoundary(at, "tithi", 1, state, provider),
    findBoundary(at, "nakshatra", -1, state, provider),
    findBoundary(at, "nakshatra", 1, state, provider),
    findBoundary(at, "yoga", -1, state, provider),
    findBoundary(at, "yoga", 1, state, provider),
    findBoundary(at, "karana", -1, state, provider),
    findBoundary(at, "karana", 1, state, provider)
  ]);

  const calculationMethod = {
    ...metadata,
    tradition,
    calendarTradition: "Gujarati Vikram Samvat, amanta",
    dailyAssignment: "Tithi prevailing immediately after local sunrise",
    accuracyStatus: "Modern astronomical approximation; festival rules may vary by regional tradition"
  };

  const warnings = [
    "Ayanamsha is Approximate Lahiri-style, not an authoritative Chitrapaksha implementation.",
    "Gujarati New Year and Diwali use a rule-based pradosha check; regional published panchang traditions can still vary."
  ];

  return {
    time: {
      requestedUtc: at.toISOString(),
      local: formatIsoLocal(at, timeZone, offsetMinutes),
      timezone: timeZone || (Number.isFinite(offsetMinutes) ? `UTC${offsetMinutes >= 0 ? "+" : ""}${(offsetMinutes / 60).toFixed(offsetMinutes % 60 === 0 ? 0 : 1)}` : "UTC"),
      location
    },
    calculationMethod,
    selectedTimePanchang,
    sunriseDayPanchang: {
      date: sunriseDate.toISOString(),
      sunrise: muhurta.sunrise,
      ...sunriseDayPanchang
    },
    panchang: {
      ...stateToPanchang(state, compatibilityMonth(selectedMonth), selectedSamvat),
      lunarMonth: compatibilityMonth(selectedMonth)
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
    dailyPanchang: sunriseDayPanchang,
    transitions: {
      tithi: { start: tithiStart?.toISOString() || null, end: tithiEnd?.toISOString() || null },
      nakshatra: { start: nakshatraStart?.toISOString() || null, end: nakshatraEnd?.toISOString() || null },
      yoga: { start: yogaStart?.toISOString() || null, end: yogaEnd?.toISOString() || null },
      karana: { start: karanaStart?.toISOString() || null, end: karanaEnd?.toISOString() || null },
      lunarMonth: {
        start: selectedMonth?.astronomical?.start?.toISOString() || null,
        end: selectedMonth?.astronomical?.end?.toISOString() || null
      },
      month: {
        start: selectedMonth?.start?.toISOString() || null,
        end: selectedMonth?.end?.toISOString() || null
      }
    },
    muhurta,
    calendarDiagnostics: {
      previousNewMoon: selectedMonth?.astronomical?.start?.toISOString() || null,
      nextNewMoon: selectedMonth?.astronomical?.end?.toISOString() || null,
      solarIngresses: selectedMonth?.solarIngresses || { count: 0, ingresses: [] },
      adhik: Boolean(selectedMonth?.adhik),
      kshaya: Boolean(selectedMonth?.kshaya),
      ingressCount: selectedMonth?.ingressCount ?? null,
      yearStartRule: selectedSamvat.yearStartRule || null
    },
    warnings,
    engine: {
      name: metadata.ephemeris || state.source,
      ayanamsha: metadata.siderealModel || "Approximate Lahiri-style",
      tradition,
      precision: metadata.precisionLabel || "modern-calendar approximation",
      license: metadata.license || "MIT"
    },
    health: {
      status: "available",
      message: "Panchang calculation service is available."
    }
  };
}

export const __testables = {
  stateAt,
  dayMuhurtas,
  boundaryTarget,
  valueAtForBoundary
};
