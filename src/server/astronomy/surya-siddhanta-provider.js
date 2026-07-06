import { EphemerisProvider } from "./ephemeris-provider.js";

export class SuryaSiddhantaProvider extends EphemerisProvider {
  getTropicalSunLongitude() {
    throw new Error("Historical Surya Siddhanta model not yet implemented");
  }
}

