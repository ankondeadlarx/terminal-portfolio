import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const addr = req.nextUrl.searchParams.get("addr") ?? "";
  const url  = addr ? `https://ipapi.co/${encodeURIComponent(addr)}/json/` : "https://ipapi.co/json/";
  try {
    const r = await fetch(url, { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) }).catch(() => null);
    if (!r?.ok) {
      // Fallback: return localhost info
      return NextResponse.json({
        ip:      addr || "127.0.0.1",
        city:    "Local",
        region:  "Local",
        country: "Local",
        org:     "Your device",
      });
    }
    const d = await r.json();
    if (d.error) return NextResponse.json({ error: d.reason || "IP not found." }, { status: 404 });
    return NextResponse.json({
      ip:      d.ip,
      city:    d.city    || "N/A",
      region:  d.region  || "N/A",
      country: d.country_name || d.country || "N/A",
      org:     d.org     || "N/A",
    });
  } catch {
    return NextResponse.json({ error: "IP service temporarily unavailable. Try again soon." }, { status: 503 });
  }
}
