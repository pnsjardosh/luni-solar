import { angularDifference } from "./math.js";

function distanceToTarget(value, targetAngle, direction) {
  return direction > 0 ? angularDifference(targetAngle, value) : angularDifference(value, targetAngle);
}

function crossedBetween(startValue, endValue, targetAngle, direction) {
  const startDistance = distanceToTarget(startValue, targetAngle, direction);
  const endDistance = distanceToTarget(endValue, targetAngle, direction);
  return endDistance > startDistance + 180;
}

export function findAngularBoundary({
  startDate,
  direction,
  valueAt,
  targetAngle,
  maxHours = 120,
  stepMinutes = 60
}) {
  if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) return null;
  if (direction !== 1 && direction !== -1) throw new Error("direction must be 1 or -1");

  let before = startDate.getTime();
  let beforeValue = valueAt(new Date(before));
  const stepMs = Math.abs(stepMinutes) * 60000 * direction;
  const maxSteps = Math.ceil(maxHours * 60 / Math.abs(stepMinutes));

  for (let i = 0; i < maxSteps; i += 1) {
    const after = before + stepMs;
    const afterValue = valueAt(new Date(after));
    if (crossedBetween(beforeValue, afterValue, targetAngle, direction)) {
      let a = before;
      let b = after;
      for (let guard = 0; Math.abs(b - a) > 1000 && guard < 80; guard += 1) {
        const mid = Math.round((a + b) / 2);
        const aValue = valueAt(new Date(a));
        const midValue = valueAt(new Date(mid));
        if (crossedBetween(aValue, midValue, targetAngle, direction)) b = mid;
        else a = mid;
      }
      return new Date(b);
    }
    before = after;
    beforeValue = afterValue;
  }

  return null;
}
