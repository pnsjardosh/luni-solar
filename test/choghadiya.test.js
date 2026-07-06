import assert from "node:assert/strict";
import test from "node:test";
import { calculateChoghadiya } from "../src/server/muhurta/choghadiya.js";

test("calculates daytime and nighttime choghadiya segments", () => {
  const result = calculateChoghadiya({
    date: new Date("2026-07-05T07:00:00Z"),
    weekday: 0,
    sunrise: "2026-07-05T06:00:00.000Z",
    sunset: "2026-07-05T18:00:00.000Z",
    nextSunrise: "2026-07-06T06:00:00.000Z"
  });

  assert.equal(result.day.length, 8);
  assert.equal(result.night.length, 8);
  assert.equal(result.day[0].name, "Udvega");
  assert.equal(result.night[0].name, "Shubha");
  assert.equal(result.current.name, "Udvega");
});

