import { NextRequest, NextResponse } from "next/server";

// Uses open-meteo.com (free, no key) + ipapi.co for location
export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city") ?? "";

  try {
    // Step 1: Get coordinates — either from supplied city name or from IP
    let lat: number, lon: number, resolvedCity: string;

    if (city) {
      const geo = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
        { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) }
      ).catch(() => null);
      if (!geo?.ok) return NextResponse.json({ error: "City not found. Please try another city." }, { status: 404 });
      const geoData = await geo.json();
      if (!geoData.results?.length) return NextResponse.json({ error: `City not found: ${city}` }, { status: 404 });
      lat = geoData.results[0].latitude;
      lon = geoData.results[0].longitude;
      resolvedCity = geoData.results[0].name;
    } else {
      const ip = await fetch("https://ipapi.co/json/", { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) }).catch(() => null);
      if (!ip?.ok) {
        // Fallback: return default location
        lat = 40.7128;
        lon = -74.0060;
        resolvedCity = "New York (default)";
      } else {
        const ipData = await ip.json();
        lat = ipData.latitude;
        lon = ipData.longitude;
        resolvedCity = ipData.city || "Unknown";
      }
    }

    // Step 2: Get weather
    const wRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto`,
      { next: { revalidate: 600 }, signal: AbortSignal.timeout(5000) }
    ).catch(() => null);
    if (!wRes?.ok) return NextResponse.json({ error: "Weather service unavailable. Please try again later." }, { status: 503 });
    const wData = await wRes.json();
    const cur   = wData.current;

    // WMO weather code → condition string
    const conditions: Record<number, string> = {
      0:"Clear sky", 1:"Mainly clear", 2:"Partly cloudy", 3:"Overcast",
      45:"Fog", 48:"Fog",
      51:"Drizzle", 53:"Drizzle", 55:"Drizzle",
      61:"Rain", 63:"Rain", 65:"Heavy rain",
      71:"Snow", 73:"Snow", 75:"Heavy snow",
      80:"Rain showers", 81:"Rain showers", 82:"Heavy rain showers",
      95:"Thunderstorm", 96:"Thunderstorm", 99:"Thunderstorm",
    };
    const condition = conditions[cur.weather_code] ?? `Code ${cur.weather_code}`;

    return NextResponse.json({
      city:      resolvedCity,
      temp:      Math.round(cur.temperature_2m),
      wind:      Math.round(cur.wind_speed_10m),
      condition,
      time:      cur.time,
    });
  } catch {
    return NextResponse.json({ error: "Weather service unavailable." }, { status: 503 });
  }
}
