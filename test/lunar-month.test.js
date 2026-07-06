import assert from "node:assert/strict";
import test from "node:test";
import { countSolarIngresses, lunarMonthStatus } from "../src/server/calendar/lunar-month.js";

class LinearProvider {
  constructor(rateDegPerDay) {
    this.rate = rateDegPerDay;
  }

  getSiderealSunLongitude(date) {
    const days = (date - new Date("2026-01-01T00:00:00Z")) / 86400000;
    return (days * this.rate + 360) % 360;
  }

  getSiderealMoonLongitude(date) {
    return this.getSiderealSunLongitude(date);
  }
}

test("counts normal, adhika, and kshaya ingress conditions", () => {
  const start = new Date("2026-01-01T00:00:00Z");
  const end = new Date("2026-01-31T00:00:00Z");

  assert.equal(countSolarIngresses(start, end, new LinearProvider(1.1)).count, 1);
  assert.equal(lunarMonthStatus(start, end, new LinearProvider(0.2)).adhik, true);
  const kshaya = lunarMonthStatus(start, end, new LinearProvider(2.2));
  assert.equal(kshaya.kshaya, true);
  assert.equal(kshaya.status, "detected-estimated");
  assert.ok(kshaya.omittedMonthName);
});
