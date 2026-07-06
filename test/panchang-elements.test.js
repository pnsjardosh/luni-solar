import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateKarana,
  calculateNakshatra,
  calculateRashi,
  calculateTithi,
  calculateYoga,
  karanaName
} from "../src/server/panchang/panchang-elements.js";

test("new moon elongation derives Shukla Pratipada and Kimstughna karana", () => {
  const tithi = calculateTithi(10, 10.1);
  const karana = calculateKarana(10, 10.1);
  assert.equal(tithi.index, 0);
  assert.equal(tithi.name, "Pratipada");
  assert.equal(tithi.paksha, "Shukla");
  assert.equal(karana.name, "Kimstughna");
});

test("full moon elongation derives Purnima boundary", () => {
  const tithi = calculateTithi(0, 180);
  assert.equal(tithi.index, 15);
  assert.equal(tithi.name, "Pratipada");
  assert.equal(tithi.paksha, "Krishna");
  assert.equal(calculateTithi(0, 179.999).name, "Purnima");
});

test("tithi wraps cleanly near 360 degrees", () => {
  assert.equal(calculateTithi(0, 359.99).name, "Amavasya");
  assert.equal(calculateTithi(359.99, 0.01).name, "Pratipada");
});

test("nakshatra boundary advances at 13 degrees 20 minutes", () => {
  assert.equal(calculateNakshatra(13.3332).name, "Ashwini");
  assert.equal(calculateNakshatra(13.3334).name, "Bharani");
});

test("yoga wraps at 360 degrees", () => {
  assert.equal(calculateYoga(350, 9.999).name, "Vaidhriti");
  assert.equal(calculateYoga(350, 10.001).name, "Vishkambha");
});

test("rashi boundaries are exact 30-degree divisions", () => {
  assert.equal(calculateRashi(29.999).name, "Mesha");
  assert.equal(calculateRashi(30).name, "Vrishabha");
  assert.equal(calculateRashi(359.999).name, "Meena");
});

test("all sixty half-tithi karanas include fixed terminal sequence", () => {
  const names = Array.from({ length: 60 }, (_, half) => karanaName(calculateKarana(0, half * 6 + 0.01).index));
  assert.equal(names[0], "Kimstughna");
  assert.equal(names[57], "Shakuni");
  assert.equal(names[58], "Chatushpada");
  assert.equal(names[59], "Naga");
  assert.equal(names[1], "Bava");
  assert.equal(names[8], "Bava");
});

