"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Citation {
  id: string;
  speaker: string;
  symposium: string;
  timestamp: string;
  section: string | null;
  quote: string;
  doc_url: string;
  video_url: string | null;
}

interface Result {
  refused: boolean;
  answer: string;
  citations: Citation[];
}

const EXAMPLES = [
  "Where did someone discuss representation?",
  "What did Andrew Barto say about learning from trial and error?",
  "Which parts relate to cybernetics concepts missing in modern AI?",
  "Which speakers talked about feedback?",
];

export function BraidChat() {
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ask(q: string) {
    const text = q.trim();
    if (text.length < 3 || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    setAsked(text);
    try {
      const res = await fetch("/api/braid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");
      setResult(data as Result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about the Re-Braiding symposia…"
          maxLength={500}
          aria-label="Your question"
          className="flex-1"
        />
        <Button type="submit" disabled={loading || question.trim().length < 3}>
          {loading ? "Searching…" : "Ask Braid"}
        </Button>
      </form>

      {!result && !loading && !error && (
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setQuestion(ex);
                ask(ex);
              }}
              className="rounded-full border border-current/20 px-3 py-1 text-left text-sm hover:bg-black/5"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      {result && (
        <section aria-live="polite" className="space-y-6">
          <p className="text-sm opacity-60">{asked}</p>
          <p className="text-lg leading-relaxed">{result.answer}</p>

          {result.citations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">Sources</h3>
              <ol className="space-y-3">
                {result.citations.map((c, i) => (
                  <li key={`${c.id}-${i}`} className="border-l-2 border-current/30 pl-4">
                    <p className="text-sm leading-relaxed">&ldquo;{c.quote}&rdquo;</p>
                    <p className="mt-1 text-xs opacity-70">
                      {c.speaker} · {c.symposium} · {c.timestamp}
                      {c.section ? ` · ${c.section}` : ""}
                    </p>
                    <p className="mt-1 text-xs">
                      <a href={c.doc_url} target="_blank" rel="noopener noreferrer" className="underline">
                        Transcript
                      </a>
                      {c.video_url && (
                        <>
                          {" · "}
                          <a href={c.video_url} target="_blank" rel="noopener noreferrer" className="underline">
                            Video
                          </a>
                        </>
                      )}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      )}

      <p className="text-xs opacity-60">
        Braid answers only from the symposium transcripts, which are machine-transcribed and lightly edited. Check the
        linked source before quoting anyone.
      </p>
    </div>
  );
}
