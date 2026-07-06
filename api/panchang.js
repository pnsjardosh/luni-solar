import { computeProductionPanchang } from "../src/server/panchang-engine.js";

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("access-control-allow-origin", "*");
  response.setHeader("cache-control", "public, max-age=60, stale-while-revalidate=300");
  response.end(JSON.stringify(payload));
}

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.setHeader("access-control-allow-origin", "*");
    response.setHeader("access-control-allow-methods", "GET, OPTIONS");
    response.setHeader("access-control-allow-headers", "content-type");
    response.end();
    return;
  }

  if (request.method !== "GET") {
    sendJson(response, 405, { error: "method_not_allowed" });
    return;
  }

  try {
    const url = new URL(request.url, `https://${request.headers.host || "localhost"}`);
    const lat = Number.parseFloat(url.searchParams.get("lat"));
    const lon = Number.parseFloat(url.searchParams.get("lon"));
    const at = new Date(url.searchParams.get("at") || Date.now());
    const tz = url.searchParams.get("tz") || "";
    const offset = Number.parseFloat(url.searchParams.get("offset"));
    const tradition = url.searchParams.get("tradition") || "gujarati-vikram";

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      sendJson(response, 400, { error: "invalid_latitude" });
      return;
    }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      sendJson(response, 400, { error: "invalid_longitude" });
      return;
    }
    if (Number.isNaN(at.getTime())) {
      sendJson(response, 400, { error: "invalid_datetime" });
      return;
    }

    const result = await computeProductionPanchang({
      at,
      location: { lat, lon },
      timeZone: tz,
      utcOffsetMinutes: Number.isFinite(offset) ? offset : null,
      tradition
    });
    sendJson(response, 200, result);
  } catch (error) {
    sendJson(response, 500, {
      error: "panchang_calculation_failed",
      message: error instanceof Error ? error.message : "Unknown panchang calculation failure"
    });
  }
}
