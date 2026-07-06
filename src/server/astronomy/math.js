export function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

export function angularDifference(a, b) {
  return normalizeDegrees(a - b);
}

export function degreesToRadians(value) {
  return value * Math.PI / 180;
}

export function sinDeg(value) {
  return Math.sin(degreesToRadians(value));
}

export function cosDeg(value) {
  return Math.cos(degreesToRadians(value));
}

