export const APP_CONFIG = {
  assets: {
    earthTexture: "./assets/earth-blue-marble.jpg",
    nasaMoonFrameBase: "https://svs.gsfc.nasa.gov/vis/a000000/a005500/a005587/frames/730x730_1x1_30p",
    sunTexture: "./assets/sun-disk.jpg"
  },
  playback: {
    normalMsPerRealMs: 600,
    dayMsPerRealMs: 86400,
    visualRenderIntervalMs: 320,
    inputSyncIntervalMs: 400
  },
  time: {
    autoDetectFromBrowser: true,
    // Set this for exact civil time for the selected region (e.g. -300 for US Eastern Standard Time).
    // Keep null to fall back to longitude-derived local solar offset.
    utcOffsetMinutes: null,
    dst: {
      enabled: false,
      offsetMinutes: 60,
      // Rule format: month 1-12, week 1-5 (5 means last), weekday 0-6 (Sun-Sat), hour 0-23.
      // Default US pattern: second Sunday in March at 2:00 to first Sunday in November at 2:00.
      start: { month: 3, week: 2, weekday: 0, hour: 2 },
      end: { month: 11, week: 1, weekday: 0, hour: 2 }
    }
  },
  defaults: {
    locationName: "Ujjain, India",
    lat: 23.1765,
    lon: 75.7885
  }
};
