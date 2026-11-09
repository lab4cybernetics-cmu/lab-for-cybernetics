import passagesJson from "./passages.json";

export interface Passage {
  id: string;
  source: "S1" | "S2" | "S3";
  source_title: string;
  date: string;
  speaker: string;
  timestamp: string;
  seconds: number;
  section: string | null;
  doc_url: string;
  video_url: string | null;
  text: string;
}

export const PASSAGES = passagesJson as unknown as Passage[];

const STOP = new Set(
  "a an the of in on at to for and or is are was were be been it its this that these those what which who whom how where when did do does i you he she they we there here some any about from with as by not so if then than but can could would should have has had will just very also into out up".split(
    " "
  )
);
// Words that frame a question but are never the topic of it.
const ASK = new Set(
  "discuss discussed discussing talk talked talks mention mentioned mentions speaker speakers someone anyone person people parts part relate relates related say said says tell find show want read".split(
    " "
  )
);

export function tokenize(s: string, dropAsk = false): string[] {
  const out = (s.toLowerCase().match(/[a-z0-9']+/g) ?? []).filter((w) => !STOP.has(w));
  return dropAsk ? out.filter((w) => !ASK.has(w)) : out;
}

// --- BM25 over passages (speaker + section are indexed along with the text) ---
const K1 = 1.5;
const B = 0.75;

const docs = PASSAGES.map((p) => tokenize(`${p.speaker} ${p.section ?? ""} ${p.text}`));
const avgLen = docs.reduce((n, d) => n + d.length, 0) / docs.length;
const df = new Map<string, number>();
for (const d of docs) for (const w of new Set(d)) df.set(w, (df.get(w) ?? 0) + 1);
const tf = docs.map((d) => {
  const m = new Map<string, number>();
  for (const w of d) m.set(w, (m.get(w) ?? 0) + 1);
  return m;
});
const idf = (w: string) => {
  const n = df.get(w) ?? 0;
  return Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
};

export interface Hit {
  passage: Passage;
  score: number;
}

/** Rank passages for a bag of search terms. Terms may repeat to up-weight them. */
export function search(terms: string[], k = 10): Hit[] {
  const qt = terms.flatMap((t) => tokenize(t, true));
  if (qt.length === 0) return [];
  const scored: Hit[] = [];
  for (let i = 0; i < docs.length; i++) {
    let s = 0;
    for (const w of qt) {
      const f = tf[i].get(w) ?? 0;
      if (!f) continue;
      s += (idf(w) * f * (K1 + 1)) / (f + K1 * (1 - B + (B * docs[i].length) / avgLen));
    }
    if (s > 0) scored.push({ passage: PASSAGES[i], score: s });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, k);
}

export function byId(id: string): Passage | undefined {
  return PASSAGES.find((p) => p.id === id);
}
