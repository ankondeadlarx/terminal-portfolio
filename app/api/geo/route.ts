import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");
  if (!lat || !lon) return NextResponse.json({ error: "lat and lon required." }, { status: 400 });

  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { "User-Agent": "TerminalPortfolio/1.0" }, next: { revalidate: 3600 } }
    );
    if (!r.ok) return NextResponse.json({ error: "Geo lookup failed." }, { status: 503 });
    const d = await r.json();
    return NextResponse.json({ display_name: d.display_name || "Unknown location" });
  } catch {
    return NextResponse.json({ error: "Geo service unavailable." }, { status: 503 });
  }
}
