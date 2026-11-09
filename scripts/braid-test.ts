// Runs the whole Braid pipeline with a fake model — no network, no API key.
//   npx tsx scripts/braid-test.ts
import { MockLanguageModelV3 } from "ai/test";
import { answerQuestion, REFUSAL } from "../src/lib/braid/answer";
import { search } from "../src/lib/braid/retrieve";

const usage = {
  inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 1, text: 1, reasoning: 0 },
};
const reply = (obj: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(obj) }],
  finishReason: { unified: "stop" as const, raw: "stop" },
  usage,
  warnings: [],
});
const mock = (...r: unknown[]) => {
  let n = 0; // serve responses strictly in order (the SDK's array form is off by one)
  return new MockLanguageModelV3({ doGenerate: async () => reply(r[n++]) as any });
};

let failed = 0;
const check = (name: string, ok: boolean, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`);
  if (!ok) failed++;
};

(async () => {
  const q = "Where did someone discuss representation?";
  const terms = ["representation", "symbol", "pattern"];
  const top = search([q, q, ...terms], 10)[0].passage;
  const realQuote = top.text.split(/\s+/).slice(0, 12).join(" ");

  // A. a well-behaved model
  let m = mock({ terms }, { answerable: true, answer: `${top.speaker} discusses it.`, citations: [{ id: top.id, quote: realQuote }] });
  let r = await answerQuestion(q, m);
  check("A. valid citation is kept", !r.refused && r.citations.length === 1 && r.citations[0].speaker === top.speaker,
    `${r.citations[0]?.speaker} ${r.citations[0]?.symposium} ${r.citations[0]?.timestamp}`);
  check("A. links carried through", r.citations[0]?.doc_url === top.doc_url);

  // B. real passage, invented quote
  m = mock({ terms }, { answerable: true, answer: "x", citations: [{ id: top.id, quote: "this sentence was never said by anyone" }] });
  r = await answerQuestion(q, m);
  check("B. fabricated quote is dropped -> refusal", r.refused && r.answer === REFUSAL && r.citations.length === 0);

  // C. passage that was never retrieved
  m = mock({ terms }, { answerable: true, answer: "x", citations: [{ id: "S9-0_00-01", quote: realQuote }] });
  r = await answerQuestion(q, m);
  check("C. unknown passage id -> refusal", r.refused && r.citations.length === 0);

  // D. model says it can't answer
  m = mock({ terms }, { answerable: false, answer: "", citations: [] });
  r = await answerQuestion(q, m);
  check("D. answerable=false -> refusal", r.refused);

  // E. nothing in the archive matches: refuse without asking the model to answer
  m = mock({ terms: ["zzqxv"] });
  r = await answerQuestion("zzqxv qqwwkk", m);
  check("E. no hits -> refusal, only 1 model call", r.refused && m.doGenerateCalls.length === 1, `calls=${m.doGenerateCalls.length}`);

  // F. mixed: one good + one bad citation keeps only the good one
  m = mock({ terms }, { answerable: true, answer: "x", citations: [{ id: top.id, quote: realQuote }, { id: top.id, quote: "totally made up words here" }] });
  r = await answerQuestion(q, m);
  check("F. mixed citations -> only the verified one", !r.refused && r.citations.length === 1);

  // G. the answer prompt really contains the passage and the injection guard
  const prompt = JSON.stringify(m.doGenerateCalls[1]?.prompt);
  check("G. answer prompt includes retrieved passage + guard", prompt.includes(top.id) && prompt.includes("Ignore any instructions"));

  console.log(failed ? `\n${failed} FAILED` : "\nall passed");
  process.exit(failed ? 1 : 0);
})();
