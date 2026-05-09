# Luni Solar Prototype

Static prototype for a dynamic lunisolar / Vedic sky calendar.

## Run

```powershell
python -m http.server 4173 -b 127.0.0.1
```

Open `http://127.0.0.1:4173`.

## Project Shape

- `index.html` contains the app shell and script loading order.
- `styles.css` contains visual styling and animation.
- `app.js` is the main runtime entrypoint.
- `src/config.js` centralizes asset paths, playback speeds, and default location.
- `src/url-state.js` owns query-string parsing and shareable URL updates.
- `assets/nakshatra-stars.js` contains the generated Stellarium/HYG nakshatra star subset.
- `assets/*.jpg` contains local Earth and Sun imagery.

## Shareable URL State

The app reads and writes these query parameters:

- `loc`: display location name
- `lat`: latitude
- `lon`: longitude
- `at`: ISO timestamp
- `embed=1`: switches the app into website-embed mode

Example:

```text
http://127.0.0.1:4173/?loc=Ahmedabad&lat=23.0225&lon=72.5714&at=2026-05-09T18%3A00%3A00.000Z
```

## Website Embed

This repo now includes a standalone website embed package for plain hosting environments such as GoDaddy.

Files:

- `embed/luni-solar-embed.js`: drop-in custom element that renders the app inside a self-resizing iframe.
- `embed/example.html`: local example page showing how the embed works.

### Fastest GoDaddy Path

1. Upload this whole project into a folder on your hosting account, for example `/luni-solar/`.
2. Make sure these files are publicly reachable:
   - `/luni-solar/index.html`
   - `/luni-solar/embed/luni-solar-embed.js`
   - `/luni-solar/assets/*`
3. In your GoDaddy page, add a `Custom HTML` block where you want the app to appear.
4. Paste this:

```html
<script type="module" src="/luni-solar/embed/luni-solar-embed.js"></script>

<luni-solar-embed
  app-base="/luni-solar/index.html"
  location="Ahmedabad, India"
  lat="23.0225"
  lon="72.5714"
  date="2026-05-21T14:55:03.058Z"
  height="1280">
</luni-solar-embed>
```

### Universal Fallback

If the GoDaddy editor does not allow `type="module"` scripts, use a direct iframe instead:

```html
<iframe
  src="/luni-solar/index.html?embed=1&loc=Ahmedabad%2C%20India&lat=23.0225&lon=72.5714&at=2026-05-21T14%3A55%3A03.058Z"
  style="width:100%;min-height:1280px;border:0;background:#020307"
  loading="lazy"
  allow="geolocation"
  title="Luni Solar Calendar">
</iframe>
```

### Notes

- The embedded app keeps its own controls and URL state inside the iframe.
- The embed script listens for app height changes and grows the iframe automatically.
- If you want the widget under a different URL on your site, change the `app-base` path.

## Expansion Notes

Add new runtime configuration to `src/config.js`. Add URL-owned state to `src/url-state.js`. Keep large generated datasets under `assets/` and load them before `app.js` if they attach browser globals.
