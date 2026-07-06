import { findAngularBoundary } from "../astronomy/boundary-search.js";
import { normalizeDegrees } from "../astronomy/math.js";
import { calculateNakshatra, NAKSHATRA_SPAN } from "../panchang/panchang-elements.js";
import { dayAfterEvent, localCivilDateUtc } from "./time.js";

export const GUJARATI_MONTHS = ["Kartak", "Magshar", "Posh", "Maha", "Fagan", "Chaitra", "Vaishakh", "Jeth", "Ashadh", "Shravan", "Bhadarvo", "Aaso"];
const RASHI_TO_AMANTA_MONTH = ["Chaitra", "Vaishakh", "Jeth", "Ashadh", "Shravan", "Bhadarvo", "Aaso", "Kartak", "Magshar", "Posh", "Maha", "Fagan"];

function lunarAngle(date, provider) {
  return normalizeDegrees(provider.getSiderealMoonLongitude(date) - provider.getSiderealSunLongitude(date));
}

export function findAdjacentNewMoon(date, direction, provider) {
  return findAngularBoundary({
    startDate: date,
    direction,
    valueAt: (probe) => lunarAngle(probe, provider),
    targetAngle: 0,
    maxHours: 760,
    stepMinutes: 360
  }) || new Date(date.getTime() + direction * 29.530588853 * 86400000);
}

export function findNextNewMoonAfter(date, provider) {
  return findAdjacentNewMoon(date, 1, provider);
}

export function calculateAstronomicalLunarMonth(date, provider) {
  const previousNewMoon = findAdjacentNewMoon(date, -1, provider);
  const nextNewMoon = findAdjacentNewMoon(date, 1, provider);
  const fullMoonProbe = new Date(previousNewMoon.getTime() + (nextNewMoon.getTime() - previousNewMoon.getTime()) / 2);
  const fullMoonNakshatra = calculateNakshatra(provider.getSiderealMoonLongitude(fullMoonProbe));
  return {
    start: previousNewMoon,
    end: nextNewMoon,
    fullMoonNakshatra,
    fullMoonProbe
  };
}

export function countSolarIngresses(startNewMoon, endNewMoon, provider) {
  const ingresses = [];
  let previous = startNewMoon;
  const startRashi = Math.floor(provider.getSiderealSunLongitude(new Date(startNewMoon.getTime() + 1000)) / 30);
  let nextTarget = ((startRashi + 1) % 12) * 30;

  for (let guard = 0; guard < 3; guard += 1) {
    const ingress = findAngularBoundary({
      startDate: previous,
      direction: 1,
      valueAt: (probe) => provider.getSiderealSunLongitude(probe),
      targetAngle: nextTarget,
      maxHours: Math.ceil((endNewMoon.getTime() - previous.getTime()) / 3600000) + 48,
      stepMinutes: 360
    });
    if (!ingress || ingress >= endNewMoon) break;
    const fromRashiIndex = (Math.round(nextTarget / 30) + 11) % 12;
    const toRashiIndex = Math.round(nextTarget / 30) % 12;
    ingresses.push({ fromRashiIndex, toRashiIndex, at: ingress });
    previous = new Date(ingress.getTime() + 1000);
    nextTarget = ((toRashiIndex + 1) % 12) * 30;
  }

  return { count: ingresses.length, ingresses };
}

export function lunarMonthStatus(startNewMoon, endNewMoon, provider) {
  const solarIngresses = countSolarIngresses(startNewMoon, endNewMoon, provider);
  const omittedIngress = solarIngresses.ingresses[1] || null;
  const omittedMonthName = omittedIngress ? RASHI_TO_AMANTA_MONTH[omittedIngress.toRashiIndex] : null;
  return {
    adhik: solarIngresses.count === 0,
    kshaya: solarIngresses.count >= 2,
    ingressCount: solarIngresses.count,
    solarIngresses,
    omittedMonthName: solarIngresses.count >= 2 ? omittedMonthName : undefined,
    status: solarIngresses.count >= 2 ? "detected-estimated" : "resolved"
  };
}

function monthNameFromFullMoon(startNewMoon, endNewMoon, provider) {
  const fullMoonProbe = new Date(startNewMoon.getTime() + (endNewMoon.getTime() - startNewMoon.getTime()) / 2);
  const fullMoonMoon = provider.getSiderealMoonLongitude(fullMoonProbe);
  const nakshatra = Math.floor(normalizeDegrees(fullMoonMoon) / NAKSHATRA_SPAN);
  if (nakshatra <= 1 || nakshatra === 26) return "Kartak";
  if (nakshatra <= 4) return "Magshar";
  if (nakshatra <= 7) return "Posh";
  if (nakshatra <= 10) return "Maha";
  if (nakshatra <= 12) return "Fagan";
  if (nakshatra <= 14) return "Chaitra";
  if (nakshatra <= 16) return "Vaishakh";
  if (nakshatra <= 18) return "Jeth";
  if (nakshatra <= 20) return "Ashadh";
  if (nakshatra <= 22) return "Shravan";
  if (nakshatra <= 24) return "Bhadarvo";
  return "Aaso";
}

export function calculateGujaratiCivilMonth(date, location, timeZone, provider, utcOffsetMinutes = null) {
  const astronomical = calculateAstronomicalLunarMonth(date, provider);
  const civilStart = dayAfterEvent(astronomical.start, timeZone, utcOffsetMinutes);
  const civilEnd = dayAfterEvent(astronomical.end, timeZone, utcOffsetMinutes);
  const localDate = localCivilDateUtc(date, timeZone, 0, utcOffsetMinutes);
  const status = lunarMonthStatus(astronomical.start, astronomical.end, provider);
  const name = monthNameFromFullMoon(astronomical.start, astronomical.end, provider);
  return {
    name,
    start: civilStart,
    end: civilEnd,
    localDate,
    astronomical,
    location,
    ...status
  };
}
