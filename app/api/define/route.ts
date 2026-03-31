import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const word      = req.nextUrl.searchParams.get("word");
  const synonyms  = req.nextUrl.searchParams.get("synonyms");
  const antonyms  = req.nextUrl.searchParams.get("antonyms");

  if (!word) return NextResponse.json({ error: "word parameter required." }, { status: 400 });

  try {
    const r = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      { next: { revalidate: 3600 } }
    );
    if (!r.ok) return NextResponse.json({ error: `No definitions found for '${word}'.` }, { status: 404 });
    const data = await r.json();
    if (!Array.isArray(data) || !data.length) return NextResponse.json({ error: "No entries found." }, { status: 404 });

    if (synonyms) {
      const syns: string[] = [];
      for (const entry of data) for (const m of entry.meanings ?? []) for (const d of m.definitions ?? []) syns.push(...(d.synonyms ?? []));
      const unique = [...new Set(syns)];
      return NextResponse.json({ synonyms: unique });
    }
    if (antonyms) {
      const ants: string[] = [];
      for (const entry of data) for (const m of entry.meanings ?? []) for (const d of m.definitions ?? []) ants.push(...(d.antonyms ?? []));
      const unique = [...new Set(ants)];
      return NextResponse.json({ antonyms: unique });
    }

    const definitions: { partOfSpeech: string; definition: string }[] = [];
    for (const entry of data) {
      for (const m of entry.meanings ?? []) {
        for (const d of (m.definitions ?? []).slice(0, 3)) {
          definitions.push({ partOfSpeech: m.partOfSpeech, definition: d.definition });
        }
      }
    }
    return NextResponse.json({ definitions: definitions.slice(0, 10) });
  } catch {
    return NextResponse.json({ error: "Dictionary service unavailable." }, { status: 503 });
  }
}
