import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { computeProductionPanchang } from "../src/server/panchang-engine.js";

const fixtures = JSON.parse(await readFile(new URL("./fixtures/reference-panchang.json", import.meta.url), "utf8"));

for (const fixture of fixtures) {
  test(`reference fixture: ${fixture.id}`, async () => {
    assert.ok(fixture.source?.name, "fixture must record source name");
    assert.ok(fixture.source?.url, "fixture must record source URL");
    assert.ok(fixture.source?.retrieved, "fixture must record retrieval date");

    const result = await computeProductionPanchang({
      at: new Date(fixture.date),
      location: fixture.location,
      timeZone: fixture.timezone,
      tradition: "gujarati-vikram"
    });

    assert.equal(result.sunriseDayPanchang.tithi.name, fixture.expected.sunriseDay.tithi);
    assert.equal(result.sunriseDayPanchang.nakshatra.name, fixture.expected.sunriseDay.nakshatra);
    assert.equal(result.sunriseDayPanchang.civilGujaratiMonth.name, fixture.expected.sunriseDay.lunarMonth);
    assert.equal(result.sunriseDayPanchang.civilGujaratiMonth.adhik, fixture.expected.sunriseDay.adhik);
    assert.equal(result.selectedTimePanchang.tithi.name, fixture.expected.selectedTime.tithi);
    assert.equal(result.selectedTimePanchang.nakshatra.name, fixture.expected.selectedTime.nakshatra);
  });
}

