import { EphemerisProvider } from "./ephemeris-provider.js";

export class AryabhatiyaProvider extends EphemerisProvider {
  getTropicalSunLongitude() {
    throw new Error("Historical Aryabhatiya model not yet implemented");
  }
}

