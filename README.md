# Luni Solar Prototype

Static prototype for a dynamic lunisolar / Vedic sky calendar.

## Run

```powershell
python -m http.server 4173 -b 127.0.0.1
```

Open `http://127.0.0.1:4173`.

This static server does not run the production Panchang API. For local API testing, use the Node server below or deploy the Vercel endpoint.

## Run With Local Panchang API

For local testing of both the static app and `/api/panchang`, run a small Node server that serves files and forwards the API endpoint:

```powershell
$root = (Get-Location).Path
$rootJson = $root | ConvertTo-Json -Compress
$scriptPath = Join-Path $env:TEMP "luni-solar-manual-server.mjs"
$script = @"
import http from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = $rootJson;
const port = 4174;
const { default: handler } = await import(pathToFileURL(path.join(root, 'api', 'panchang.js')).href);
const mime = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.jpg', 'image/jpeg'],
  ['.png', 'image/png']
]);

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1:' + port);
    if (url.pathname === '/api/panchang') {
      await handler(req, res);
      return;
    }
    const target = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    const filePath = path.normalize(path.join(root, target));
    if (!filePath.startsWith(root)) return res.writeHead(403).end('Forbidden');
    if (!existsSync(filePath)) return res.writeHead(404).end('Not found');
    res.writeHead(200, { 'content-type': mime.get(path.extname(filePath)) || 'application/octet-stream' });
    createReadStream(filePath).pipe(res);
  } catch (error) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(error?.stack || String(error));
  }
}).listen(port, '127.0.0.1', () => console.log('http://127.0.0.1:' + port));
"@
Set-Content -LiteralPath $scriptPath -Value $script -Encoding UTF8
node $scriptPath
```

Open `http://127.0.0.1:4174`.

The checked-in helper can also be used directly:

```powershell
node scripts/local-server.mjs
```

To check the API directly:

```text
http://127.0.0.1:4174/api/panchang?lat=23.1765&lon=75.7885&at=2026-05-10T14:11:00.000Z&tz=Asia/Kolkata&tradition=gujarati-vikram
```

This endpoint uses the same `astronomy-engine` calculation path as the Vercel deployment, so local API output should match hosted behavior.

## Panchang API

The app includes a Vercel-compatible endpoint at `/api/panchang` for modern astronomical Panchang approximations.

```text
GET /api/panchang?lat=23.1765&lon=75.7885&at=2026-05-10T14:11:00.000Z&tz=Asia/Kolkata&tradition=gujarati-vikram
```

The endpoint returns:

- `calculationMethod`: ephemeris, coordinate system, sidereal model, tradition, and accuracy labels.
- `selectedTimePanchang`: the astronomical state at the selected instant.
- `sunriseDayPanchang`: the traditional civil-day state immediately after local sunrise.
- `muhurta.choghadiya`: daytime and nighttime Choghadiya segments when sunrise/sunset are available.
- `calendarDiagnostics`: new-moon interval, solar ingresses, adhika/kshaya status, and Gujarati New Year rule diagnostics.

Current limits are explicit in the response: the ephemeris uses Astronomy Engine and the sidereal conversion is an approximate Lahiri-style ayanamsha. Gujarati New Year/Diwali uses a rule-based Aaso Amavasya pradosha check followed by Kartak Shukla Pratipada, with diagnostics included because published regional panchang traditions can vary.

## GitHub Pages API Base

GitHub Pages cannot run `/api/panchang`. For Pages deployments, configure the hosted Vercel API base through either:

```html
<script>
  window.LUNI_SOLAR_CONFIG = {
    apiBaseUrl: "https://your-vercel-deployment.vercel.app"
  };
</script>
```

or:

```html
<meta name="luni-solar-api-base" content="https://your-vercel-deployment.vercel.app">
```

If no API base is configured on `github.io`, the UI shows a degraded health message and keeps browser-side astronomical visuals available.

## Project Shape

- `index.html` contains the app shell and script loading order.
- `styles.css` contains visual styling and animation.
- `app.js` is the main runtime entrypoint.
- `src/config.js` centralizes asset paths, playback speeds, and default location.
- `src/config/runtime-config.js` resolves the optional hosted API base URL.
- `src/url-state.js` owns query-string parsing and shareable URL updates.
- `src/server/astronomy/*` contains ephemeris providers, angular math, and boundary solving.
- `src/server/panchang/panchang-elements.js` contains pure Panchang element formulas.
- `src/server/calendar/*` contains lunar-month, ingress, and Gujarati year rules.
- `src/server/muhurta/choghadiya.js` contains Choghadiya calculations.
- `assets/nakshatra-stars.js` contains the generated Stellarium/HYG nakshatra star subset.
- `assets/*.jpg` contains local Earth and Sun imagery.

## Validation Fixtures

Reference fixtures live in `test/fixtures/reference-panchang.json`. Each fixture records:

- source name and URL
- retrieval date
- expected tithi/nakshatra/month values
- notes about likely discrepancy causes

These tests intentionally validate named calendar elements rather than silently tuning transition minutes to one website. Differences can come from ayanamsha, ephemeris model, sunrise definition, coordinates, or local festival tradition.

## Shareable URL State

The app reads and writes these query parameters:

- `loc`: display location name
- `lat`: latitude
- `lon`: longitude
- `at`: ISO timestamp
- `embed=1`: switches the app into website-embed mode

Example:

```text
http://127.0.0.1:4173/?loc=Ujjain&lat=23.1765&lon=75.7885&at=2026-05-09T18%3A00%3A00.000Z
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
  location="Ujjain, India"
  lat="23.1765"
  lon="75.7885"
  date="2026-05-21T14:55:03.058Z"
  height="1280">
</luni-solar-embed>
```

### Universal Fallback

If the GoDaddy editor does not allow `type="module"` scripts, use a direct iframe instead:

```html
<iframe
  src="/luni-solar/index.html?embed=1&loc=Ujjain%2C%20India&lat=23.1765&lon=75.7885&at=2026-05-21T14%3A55%3A03.058Z"
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
