import { EclipticGeoMoon, SunPosition } from "astronomy-engine";
import { EphemerisProvider } from "./ephemeris-provider.js";

function julianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

export function approximateLahiriAyanamsha(date) {
  const yearsSinceJ2000 = (julianDay(date) - 2451545) / 365.2425;
  return 23.85675 + yearsSinceJ2000 * 0.013968;
}

export class AstronomyEngineProvider extends EphemerisProvider {
  getTropicalSunLongitude(date) {
    return SunPosition(date).elon;
  }

  getTropicalMoonLongitude(date) {
    return EclipticGeoMoon(date).lon;
  }

  getAyanamsha(date) {
    return approximateLahiriAyanamsha(date);
  }

  getMetadata() {
    return {
      ephemeris: "Astronomy Engine",
      coordinateSystem: "geocentric apparent ecliptic longitude of date",
      siderealModel: "Approximate Lahiri-style",
      precisionLabel: "modern-calendar approximation",
      license: "MIT"
    };
  }
}

