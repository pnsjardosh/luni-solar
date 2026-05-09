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
  defaults: {
    locationName: "Ujjain, India",
    lat: 23.1765,
    lon: 75.7885
  }
};
