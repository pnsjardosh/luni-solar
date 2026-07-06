const DAY_TABLE = [
  ["Udvega", "Chara", "Labha", "Amrita", "Kala", "Shubha", "Roga", "Udvega"],
  ["Amrita", "Kala", "Shubha", "Roga", "Udvega", "Chara", "Labha", "Amrita"],
  ["Roga", "Udvega", "Chara", "Labha", "Amrita", "Kala", "Shubha", "Roga"],
  ["Labha", "Amrita", "Kala", "Shubha", "Roga", "Udvega", "Chara", "Labha"],
  ["Shubha", "Roga", "Udvega", "Chara", "Labha", "Amrita", "Kala", "Shubha"],
  ["Chara", "Labha", "Amrita", "Kala", "Shubha", "Roga", "Udvega", "Chara"],
  ["Kala", "Shubha", "Roga", "Udvega", "Chara", "Labha", "Amrita", "Kala"]
];

const NIGHT_TABLE = [
  ["Shubha", "Amrita", "Chara", "Roga", "Kala", "Labha", "Udvega", "Shubha"],
  ["Chara", "Roga", "Kala", "Labha", "Udvega", "Shubha", "Amrita", "Chara"],
  ["Kala", "Labha", "Udvega", "Shubha", "Amrita", "Chara", "Roga", "Kala"],
  ["Udvega", "Shubha", "Amrita", "Chara", "Roga", "Kala", "Labha", "Udvega"],
  ["Amrita", "Chara", "Roga", "Kala", "Labha", "Udvega", "Shubha", "Amrita"],
  ["Roga", "Kala", "Labha", "Udvega", "Shubha", "Amrita", "Chara", "Roga"],
  ["Labha", "Udvega", "Shubha", "Amrita", "Chara", "Roga", "Kala", "Labha"]
];

const QUALITY = {
  Amrita: { quality: "best", tone: "good" },
  Shubha: { quality: "good", tone: "good" },
  Labha: { quality: "gain", tone: "good" },
  Chara: { quality: "movement", tone: "good" },
  Udvega: { quality: "avoid", tone: "avoid" },
  Kala: { quality: "avoid", tone: "avoid" },
  Roga: { quality: "avoid", tone: "avoid" }
};

function buildSegments(start, end, names, period) {
  if (!(start instanceof Date) || !(end instanceof Date) || !(end > start)) return [];
  const segmentMs = (end.getTime() - start.getTime()) / 8;
  return names.map((name, index) => {
    const segmentStart = new Date(start.getTime() + segmentMs * index);
    const segmentEnd = new Date(start.getTime() + segmentMs * (index + 1));
    return {
      name,
      period,
      index,
      start: segmentStart.toISOString(),
      end: segmentEnd.toISOString(),
      ...QUALITY[name]
    };
  });
}

export function calculateChoghadiya({ date, weekday, sunrise, sunset, nextSunrise }) {
  const sunriseDate = sunrise ? new Date(sunrise) : null;
  const sunsetDate = sunset ? new Date(sunset) : null;
  const nextSunriseDate = nextSunrise ? new Date(nextSunrise) : null;
  const validWeekday = weekday >= 0 && weekday <= 6 ? weekday : 0;
  const day = buildSegments(sunriseDate, sunsetDate, DAY_TABLE[validWeekday], "day");
  const night = buildSegments(sunsetDate, nextSunriseDate, NIGHT_TABLE[validWeekday], "night");
  const currentMs = date.getTime();
  const current = [...day, ...night].find((segment) => currentMs >= new Date(segment.start).getTime() && currentMs < new Date(segment.end).getTime()) || null;
  return { current, day, night, source: "Drik Panchang Choghadiya table pattern" };
}

