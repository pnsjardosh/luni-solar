import assert from "node:assert/strict";
import test from "node:test";
import { computeProductionPanchang } from "../src/server/panchang-engine.js";

test("production panchang response has required sections", async () => {
  const result = await computeProductionPanchang({
    at: new Date("2026-05-10T14:11:00.000Z"),
    location: { lat: 23.1765, lon: 75.7885 },
    timeZone: "Asia/Kolkata",
    tradition: "gujarati-vikram"
  });

  assert.equal(result.time.timezone, "Asia/Kolkata");
  assert.equal(result.engine.ayanamsha, "Approximate Lahiri-style");
  assert.equal(result.engine.tradition, "gujarati-vikram");
  assert.equal(result.engine.precision, "modern-calendar approximation");
  assert.equal(result.engine.name, "Astronomy Engine");
  assert.equal(result.calculationMethod.siderealModel, "Approximate Lahiri-style");
  assert.ok(result.selectedTimePanchang.tithi.name);
  assert.ok(result.sunriseDayPanchang.tithi.name);
  assert.ok(result.panchang.tithi.index >= 1 && result.panchang.tithi.index <= 30);
  assert.ok(result.panchang.nakshatra.index >= 1 && result.panchang.nakshatra.index <= 27);
  assert.ok(result.panchang.yoga.index >= 1 && result.panchang.yoga.index <= 27);
  assert.ok(result.panchang.karana.name);
  assert.ok(result.panchang.vikramSamvat.label.startsWith("VS "));
  assert.ok(result.muhurta.sunrise);
  assert.ok(result.muhurta.sunset);
});

test("tithi transition window surrounds requested time", async () => {
  const at = new Date("2026-05-10T14:11:00.000Z");
  const result = await computeProductionPanchang({
    at,
    location: { lat: 40.7282, lon: -74.0776 },
    timeZone: "America/New_York",
    tradition: "gujarati-vikram"
  });

  const start = new Date(result.transitions.tithi.start);
  const end = new Date(result.transitions.tithi.end);
  assert.ok(start < at);
  assert.ok(end > at);
});

test("gujarati month follows adhik Jeth sequence in June 2026", async () => {
  const result = await computeProductionPanchang({
    at: new Date("2026-06-18T12:00:00.000Z"),
    location: { lat: 23.1765, lon: 75.7885 },
    timeZone: "Asia/Kolkata",
    tradition: "gujarati-vikram"
  });

  assert.equal(result.panchang.vikramSamvat.year, 2082);
  assert.equal(result.panchang.lunarMonth.name, "Jeth");
  assert.equal(result.panchang.lunarMonth.adhik, false);
  assert.match(result.panchang.vikramSamvat.label, /VS 2082 \/ Jeth \/ Shukla Chaturthi/);
  assert.ok(result.transitions.month.start);
  assert.ok(result.transitions.month.end);
  assert.equal(result.dailyPanchang.tithi.name, "Chaturthi");
  assert.equal(result.dailyPanchang.nakshatra.name, "Pushya");
});

test("fixed timezone offset fallback preserves Gujarati local date", async () => {
  const result = await computeProductionPanchang({
    at: new Date("2026-06-18T12:00:00.000Z"),
    location: { lat: 23.1765, lon: 75.7885 },
    timeZone: "",
    utcOffsetMinutes: 330,
    tradition: "gujarati-vikram"
  });

  assert.equal(result.time.timezone, "UTC+5.5");
  assert.equal(result.panchang.vikramSamvat.year, 2082);
  assert.equal(result.panchang.lunarMonth.name, "Jeth");
});

test("local midnight is formatted as 00 hour", async () => {
  const result = await computeProductionPanchang({
    at: new Date("2026-07-05T18:30:00.000Z"),
    location: { lat: 23.1765, lon: 75.7885 },
    timeZone: "Asia/Kolkata",
    tradition: "gujarati-vikram"
  });

  assert.match(result.time.local, /T00:00:00$/);
});

test("high latitude sunrise gaps do not throw", async () => {
  const result = await computeProductionPanchang({
    at: new Date("2026-06-21T12:00:00.000Z"),
    location: { lat: 78.2232, lon: 15.6469 },
    timeZone: "Arctic/Longyearbyen",
    tradition: "gujarati-vikram"
  });

  assert.equal(result.health.status, "available");
  assert.ok("sunrise" in result.muhurta);
  assert.ok("sunset" in result.muhurta);
});
