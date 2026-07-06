import assert from "node:assert/strict";
import test from "node:test";
import { findAngularBoundary } from "../src/server/astronomy/boundary-search.js";

test("findAngularBoundary handles forward wrap through zero", () => {
  const start = new Date("2026-01-01T00:00:00Z");
  const boundary = findAngularBoundary({
    startDate: start,
    direction: 1,
    valueAt: (date) => (350 + (date - start) / 3600000 * 10) % 360,
    targetAngle: 0,
    maxHours: 3,
    stepMinutes: 10
  });
  assert.ok(boundary);
  assert.ok(Math.abs(boundary - new Date("2026-01-01T01:00:00.000Z")) <= 1000);
});

test("findAngularBoundary handles reverse wrap through zero", () => {
  const start = new Date("2026-01-01T02:00:00Z");
  const boundary = findAngularBoundary({
    startDate: start,
    direction: -1,
    valueAt: (date) => (10 + (date - start) / 3600000 * 10 + 360) % 360,
    targetAngle: 0,
    maxHours: 3,
    stepMinutes: 10
  });
  assert.ok(boundary);
  assert.ok(Math.abs(boundary - new Date("2026-01-01T01:00:00.000Z")) <= 1000);
});
