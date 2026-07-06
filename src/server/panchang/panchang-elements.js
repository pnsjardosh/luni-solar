import { normalizeDegrees } from "../astronomy/math.js";

export const TITHIS = [
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi", "Amavasya"
];

export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

export const YOGAS = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola",
  "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

export const RASHIS = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];
export const KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"];

export const TITHI_SPAN = 12;
export const KARANA_SPAN = 6;
export const NAKSHATRA_SPAN = 360 / 27;
export const YOGA_SPAN = 360 / 27;
export const RASHI_SPAN = 30;

export function karanaName(index) {
  return ["Kimstughna", ...KARANAS, "Shakuni", "Chatushpada", "Naga"][index] || "Bava";
}

export function calculateKaranaIndexFromElongation(elongation) {
  const halfTithi = Math.floor(normalizeDegrees(elongation) / KARANA_SPAN);
  if (halfTithi === 0) return 0;
  if (halfTithi === 57) return 8;
  if (halfTithi === 58) return 9;
  if (halfTithi === 59) return 10;
  return ((halfTithi - 1) % 7) + 1;
}

/**
 * Tithi is the 12-degree angular separation step between Moon and Sun.
 */
export function calculateTithi(sunLongitude, moonLongitude) {
  const elongation = normalizeDegrees(moonLongitude - sunLongitude);
  const index = Math.floor(elongation / TITHI_SPAN);
  return { index, name: TITHIS[index], paksha: calculatePaksha(index), elongation };
}

/**
 * Paksha is the bright half for tithi 1-15 and dark half for tithi 16-30.
 */
export function calculatePaksha(tithiIndex) {
  return tithiIndex < 15 ? "Shukla" : "Krishna";
}

/**
 * Nakshatra is the Moon's sidereal longitude divided into 27 equal star houses.
 */
export function calculateNakshatra(moonLongitude) {
  const index = Math.floor(normalizeDegrees(moonLongitude) / NAKSHATRA_SPAN);
  return { index, name: NAKSHATRAS[index] };
}

/**
 * Yoga is derived from the sum of sidereal Sun and Moon longitudes.
 */
export function calculateYoga(sunLongitude, moonLongitude) {
  const index = Math.floor(normalizeDegrees(sunLongitude + moonLongitude) / YOGA_SPAN);
  return { index, name: YOGAS[index] };
}

/**
 * Karana is the half-tithi division of Moon-Sun elongation with fixed terminal karanas.
 */
export function calculateKarana(sunLongitude, moonLongitude) {
  const elongation = normalizeDegrees(moonLongitude - sunLongitude);
  const halfTithiIndex = Math.floor(elongation / KARANA_SPAN);
  const index = calculateKaranaIndexFromElongation(elongation);
  return { index, halfTithiIndex, name: karanaName(index) };
}

/**
 * Rashi is a 30-degree sidereal sign division.
 */
export function calculateRashi(longitude) {
  const index = Math.floor(normalizeDegrees(longitude) / RASHI_SPAN);
  return { index, name: RASHIS[index] };
}

export function calculatePanchangElements({ sunLongitude, moonLongitude, source = "" }) {
  const tithi = calculateTithi(sunLongitude, moonLongitude);
  const nakshatra = calculateNakshatra(moonLongitude);
  const yoga = calculateYoga(sunLongitude, moonLongitude);
  const karana = calculateKarana(sunLongitude, moonLongitude);
  const sunRashi = calculateRashi(sunLongitude);
  const moonRashi = calculateRashi(moonLongitude);
  return {
    source,
    sun: normalizeDegrees(sunLongitude),
    moon: normalizeDegrees(moonLongitude),
    angle: tithi.elongation,
    tithiIndex: tithi.index,
    nakshatraIndex: nakshatra.index,
    yogaIndex: yoga.index,
    karanaIndex: karana.index,
    halfTithiIndex: karana.halfTithiIndex,
    sunRashiIndex: sunRashi.index,
    moonRashiIndex: moonRashi.index,
    paksha: tithi.paksha
  };
}
