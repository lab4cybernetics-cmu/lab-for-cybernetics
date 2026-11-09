import { createOpenAI } from "@ai-sdk/openai";
import { answerQuestion } from "@/lib/braid/answer";

// Same CMU AI gateway and key as /api/chat — no separate credential for Braid.
const cmuGateway = createOpenAI({
  baseURL: "https://ai-gateway.andrew.cmu.edu",
  apiKey: process.env.CMU_GATEWAY_API_KEY,
});

export const maxDuration = 60;

export async function POST(req: Request) {
  let question = "";
  try {
    const body = await req.json();
    question = typeof body?.question === "string" ? body.question.trim() : "";
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (question.length < 3 || question.length > 500) {
    return Response.json({ error: "Ask a question between 3 and 500 characters." }, { status: 400 });
  }
  if (!process.env.CMU_GATEWAY_API_KEY) {
    return Response.json({ error: "Braid is not configured." }, { status: 503 });
  }

  try {
    const result = await answerQuestion(question, cmuGateway.chat("claude-haiku-4-5-20251001-v1:0"));
    return Response.json(result);
  } catch (err) {
    console.error("[API /api/braid]", err);
    return Response.json({ error: "Braid hit a problem. Please try again." }, { status: 500 });
  }
}
