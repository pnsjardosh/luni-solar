export function timeParts(date, timeZone, utcOffsetMinutes = null) {
  if (!timeZone && Number.isFinite(utcOffsetMinutes)) {
    const shifted = new Date(date.getTime() + utcOffsetMinutes * 60000);
    const pad = (value) => String(value).padStart(2, "0");
    return {
      year: String(shifted.getUTCFullYear()),
      month: pad(shifted.getUTCMonth() + 1),
      day: pad(shifted.getUTCDate()),
      hour: pad(shifted.getUTCHours()),
      minute: pad(shifted.getUTCMinutes()),
      second: pad(shifted.getUTCSeconds())
    };
  }
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  const values = Object.fromEntries(formatter.formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  if (values.hour === "24") values.hour = "00";
  return values;
}

export function formatIsoLocal(date, timeZone, utcOffsetMinutes = null) {
  const parts = timeParts(date, timeZone, utcOffsetMinutes);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

export function dateKey(date, timeZone, utcOffsetMinutes = null) {
  const parts = timeParts(date, timeZone, utcOffsetMinutes);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function localCivilDateUtc(date, timeZone, addDays = 0, utcOffsetMinutes = null) {
  const parts = timeParts(date, timeZone, utcOffsetMinutes);
  return new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) + addDays));
}

export function dayAfterEvent(eventTime, timeZone, utcOffsetMinutes = null) {
  return localCivilDateUtc(eventTime, timeZone, 1, utcOffsetMinutes);
}

export function weekdayIndex(date, timeZone, utcOffsetMinutes = null) {
  if (!timeZone && Number.isFinite(utcOffsetMinutes)) {
    return new Date(date.getTime() + utcOffsetMinutes * 60000).getUTCDay();
  }
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone || "UTC",
    weekday: "short"
  });
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(formatter.format(date));
}

export function evaluateImmediatelyAfter(eventTime) {
  return new Date(eventTime.getTime() + 1000);
}

