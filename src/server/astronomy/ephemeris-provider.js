import { normalizeDegrees } from "./math.js";

export class EphemerisProvider {
  getTropicalSunLongitude() {
    throw new Error("Not implemented");
  }

  getTropicalMoonLongitude() {
    throw new Error("Not implemented");
  }

  getAyanamsha() {
    throw new Error("Not implemented");
  }

  getSiderealSunLongitude(date) {
    return normalizeDegrees(this.getTropicalSunLongitude(date) - this.getAyanamsha(date));
  }

  getSiderealMoonLongitude(date) {
    return normalizeDegrees(this.getTropicalMoonLongitude(date) - this.getAyanamsha(date));
  }

  getMetadata() {
    return {};
  }
}

