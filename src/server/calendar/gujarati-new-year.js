import { Body, Observer, SearchRiseSet } from "astronomy-engine";
import { calculateTithi } from "../panchang/panchang-elements.js";
import { GUJARATI_MONTHS, calculateGujaratiCivilMonth, findNextNewMoonAfter } from "./lunar-month.js";
import { dateKey, dayAfterEvent, evaluateImmediatelyAfter, localCivilDateUtc } from "./time.js";

function candidateNewMoons(gregorianYear, provider) {
  const start = new Date(Date.UTC(gregorianYear, 8, 1, 12, 0, 0));
  const end = new Date(Date.UTC(gregorianYear, 11, 15, 12, 0, 0));
  const candidates = [];
  let probe = start;
  for (let i = 0; i < 6; i += 1) {
    const newMoon = findNextNewMoonAfter(probe, provider);
    if (!newMoon || newMoon > end) break;
    candidates.push(newMoon);
    probe = new Date(newMoon.getTime() + 3 * 86400000);
  }
  return candidates;
}

function panchangTithiAt(date, provider) {
  return calculateTithi(provider.getSiderealSunLongitude(date), provider.getSiderealMoonLongitude(date));
}

function chooseLocalEvent(date, timeZone, utcOffsetMinutes, ...candidates) {
  const targetKey = dateKey(date, timeZone, utcOffsetMinutes);
  return candidates.find((candidate) => candidate && dateKey(candidate, timeZone, utcOffsetMinutes) === targetKey) || null;
}

function localSunEvent(date, location, timeZone, utcOffsetMinutes, direction) {
  const observer = new Observer(location.lat, location.lon, 0);
  return chooseLocalEvent(
    date,
    timeZone,
    utcOffsetMinutes,
    SearchRiseSet(Body.Sun, observer, direction, date, -3, 0)?.date,
    SearchRiseSet(Body.Sun, observer, direction, date, 3, 0)?.date
  );
}

function pradoshaDiagnosticsForNewMoon(newMoon, location, timeZone, provider, utcOffsetMinutes) {
  const bestuVarasDate = dayAfterEvent(newMoon, timeZone, utcOffsetMinutes);
  const candidateDays = [-2, -1, 0, 1].map((offset) => localCivilDateUtc(bestuVarasDate, timeZone, offset, utcOffsetMinutes));
  const diagnostics = candidateDays.map((civilDate) => {
    const sunrise = localSunEvent(civilDate, location, timeZone, utcOffsetMinutes, +1);
    const sunset = localSunEvent(civilDate, location, timeZone, utcOffsetMinutes, -1);
    const pradoshaMidpoint = sunset ? new Date(sunset.getTime() + 72 * 60000) : null;
    const sunriseTithi = sunrise ? panchangTithiAt(evaluateImmediatelyAfter(sunrise), provider) : null;
    const sunsetTithi = sunset ? panchangTithiAt(evaluateImmediatelyAfter(sunset), provider) : null;
    const pradoshaTithi = pradoshaMidpoint ? panchangTithiAt(pradoshaMidpoint, provider) : null;
    return {
      civilDate: civilDate.toISOString(),
      sunrise: sunrise?.toISOString() || null,
      sunset: sunset?.toISOString() || null,
      pradoshaMidpoint: pradoshaMidpoint?.toISOString() || null,
      sunriseTithi: sunriseTithi ? `${sunriseTithi.paksha} ${sunriseTithi.name}` : null,
      sunsetTithi: sunsetTithi ? `${sunsetTithi.paksha} ${sunsetTithi.name}` : null,
      pradoshaTithi: pradoshaTithi ? `${pradoshaTithi.paksha} ${pradoshaTithi.name}` : null,
      amavasyaAtSunset: sunsetTithi?.index === 29,
      amavasyaAtPradosha: pradoshaTithi?.index === 29
    };
  });
  return diagnostics.find((item) => item.amavasyaAtPradosha || item.amavasyaAtSunset) || diagnostics[1] || null;
}

export function determineGujaratiNewYear(gregorianYear, location, timeZone, provider, utcOffsetMinutes = null) {
  const candidates = candidateNewMoons(gregorianYear, provider);
  const diagnostics = [];
  const chosen = candidates.find((newMoon) => {
    const afterNewMoon = new Date(newMoon.getTime() + 2 * 86400000);
    const month = calculateGujaratiCivilMonth(afterNewMoon, location, timeZone, provider, utcOffsetMinutes);
    diagnostics.push({
      newMoonTime: newMoon.toISOString(),
      candidateMonth: month.name,
      adhik: month.adhik,
      kshaya: month.kshaya,
      ingressCount: month.ingressCount
    });
    return month.name === "Kartak" && !month.adhik;
  }) || candidates[candidates.length - 1];

  const bestuVarasDate = chosen ? dayAfterEvent(chosen, timeZone, utcOffsetMinutes) : null;
  const pradosha = chosen ? pradoshaDiagnosticsForNewMoon(chosen, location, timeZone, provider, utcOffsetMinutes) : null;
  return {
    diwaliDate: pradosha?.civilDate || (bestuVarasDate ? new Date(bestuVarasDate.getTime() - 86400000).toISOString() : null),
    newMoonTime: chosen?.toISOString() || null,
    bestuVarasDate: bestuVarasDate?.toISOString() || null,
    rule: "Gujarati amanta / Aaso Amavasya at pradosha; Kartak Shukla Pratipada for New Year",
    status: "rule-based-pradosha",
    diagnostics: {
      candidateMonth: "Kartak",
      amavasyaAtSunset: Boolean(pradosha?.amavasyaAtSunset),
      amavasyaAtPradosha: Boolean(pradosha?.amavasyaAtPradosha),
      sunriseTithi: pradosha?.sunriseTithi || null,
      sunsetTithi: pradosha?.sunsetTithi || null,
      pradoshaTithi: pradosha?.pradoshaTithi || null,
      pradoshaDate: pradosha?.civilDate || null,
      candidates: diagnostics
    }
  };
}

export function gujaratiYearForDate(date, location, timeZone, provider, utcOffsetMinutes = null) {
  const year = date.getUTCFullYear();
  const thisYear = determineGujaratiNewYear(year, location, timeZone, provider, utcOffsetMinutes);
  const start = thisYear.bestuVarasDate ? new Date(thisYear.bestuVarasDate) : new Date(Date.UTC(year, 9, 1));
  const previous = determineGujaratiNewYear(year - 1, location, timeZone, provider, utcOffsetMinutes);
  const previousStart = previous.bestuVarasDate ? new Date(previous.bestuVarasDate) : new Date(Date.UTC(year - 1, 9, 1));
  const next = determineGujaratiNewYear((date >= start ? year + 1 : year), location, timeZone, provider, utcOffsetMinutes);
  const activeStart = date >= start ? start : previousStart;
  const activeRule = date >= start ? thisYear : previous;
  const nextStart = next.bestuVarasDate ? new Date(next.bestuVarasDate) : new Date(Date.UTC(activeStart.getUTCFullYear() + 1, 9, 1));
  return {
    start: activeStart,
    nextStart,
    samvat: activeStart.getUTCFullYear() + 57,
    yearStartRule: activeRule,
    monthNames: GUJARATI_MONTHS
  };
}
