# Luni Solar Prototype

Static prototype for a dynamic lunisolar / Vedic sky calendar.

## Run

```powershell
python -m http.server 4173 -b 127.0.0.1
```

Open `http://127.0.0.1:4173`.

This static server does not run the production Panchang API. In that mode the browser app renders with the approximate fallback engine. Use Vercel for production API testing/deploy.

## Run With Local Panchang API

For local testing of both the static app and `/api/panchang`, run a small Node server that serves files and forwards the API endpoint:

```powershell
$node = "C:\Users\pnsja\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
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
& $node $scriptPath
```

Open `http://127.0.0.1:4174`.

To check the API directly:

```text
http://127.0.0.1:4174/api/panchang?lat=23.1765&lon=75.7885&at=2026-05-10T14:11:00.000Z&tz=Asia/Kolkata&tradition=gujarati-vikram
```

If `swisseph` is not installed locally, this endpoint still returns the full structured response but labels the engine as `approximate-fallback`.

## Production Panchang API

The app includes a Vercel-compatible endpoint at `/api/panchang` for production-grade Panchang data.

```text
GET /api/panchang?lat=23.1765&lon=75.7885&at=2026-05-10T14:11:00.000Z&tz=Asia/Kolkata&tradition=gujarati-vikram
```

The endpoint attempts to use Swiss Ephemeris when the `swisseph` package is available in the deployed runtime. If Swiss Ephemeris is unavailable, the response is explicitly labeled `approximate-fallback` so the UI can show fallback status instead of presenting approximate values as production.

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
