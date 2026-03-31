import { NextRequest, NextResponse } from "next/server";

// Uses MyMemory free translation API (no key needed, 5000 chars/day per IP)
export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text");
  const lang = req.nextUrl.searchParams.get("lang");

  if (!text || !lang) return NextResponse.json({ error: "text and lang parameters are required." }, { status: 400 });
  if (text.length > 500) return NextResponse.json({ error: "Text too long (max 500 chars)." }, { status: 400 });

  try {
    const r = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${encodeURIComponent(lang)}`,
      { next: { revalidate: 60 } }
    );
    if (!r.ok) return NextResponse.json({ error: "Translation service unavailable." }, { status: 503 });
    const data = await r.json();
    // Defensive: guard against undefined responseData
    const translated = data?.responseData?.translatedText;
    if (!translated) {
      const quota = data?.quotaFinished ? "Daily quota exceeded." : "No translation returned.";
      return NextResponse.json({ error: quota }, { status: 503 });
    }
    return NextResponse.json({ translated });
  } catch {
    return NextResponse.json({ error: "Translation failed." }, { status: 503 });
  }
}
