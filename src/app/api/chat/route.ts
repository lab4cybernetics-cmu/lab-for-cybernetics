import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, tool, stepCountIs, generateObject } from 'ai';
import { z } from 'zod';

const cmuGateway = createOpenAI({
    baseURL: 'https://ai-gateway.andrew.cmu.edu',
    apiKey: process.env.CMU_GATEWAY_API_KEY,
});

export const maxDuration = 60;

function inferExplicitPriorityPool(messages: any[]): 'practitioner' | 'scholar' | null {
    const recentText = (messages || [])
        .slice(-8)
        .map((m: any) => (typeof m?.content === 'string' ? m.content : ''))
        .join('\n')
        .toLowerCase();

    const asksForPractitioners =
        /\bpractitioner(s)?\b/.test(recentText) || /实践者|从业者|业界|产业/.test(recentText);
    const asksForScholars =
        /\bscholar(s)?\b|\bacademic(s)?\b/.test(recentText) || /学者|研究者|学术/.test(recentText);

    if (asksForPractitioners && !asksForScholars) return 'practitioner';
    if (asksForScholars && !asksForPractitioners) return 'scholar';
    return null;
}

export async function POST(req: Request) {
    console.log("[API /api/chat] Received request");
    try {
        const body = await req.json();
        const { messages, userProfile, candidates: rawCandidates } = body;

        // Exclude self statically to absolutely prevent recommending the user
        const candidates = (rawCandidates || []).filter((c: any) => c.id !== userProfile?.id);
        const practitioners = candidates.filter((c: any) => c.userType?.toLowerCase().includes('practitioner'));
        const scholars = candidates.filter((c: any) => c.userType?.toLowerCase().includes('scholar'));

        console.log(`[API /api/chat] User: ${userProfile?.name} | Practitioners: ${practitioners.length} | Scholars: ${scholars.length}`);

        // Decide which pool to prioritize via sub-inference
        const { object: decision } = await generateObject({
            model: cmuGateway.chat('claude-sonnet-4-20250514-v1:0'),
            schema: z.object({
                intent: z.enum(['chat', 'match']),
                priorityPool: z.enum(['practitioner', 'scholar']),
                reasoning: z.string()
            }),
            system: `Analyze the user's latest intent.
User Data: ${JSON.stringify({ userType: userProfile?.userType || 'unknown/missing', bio: userProfile?.bio?.substring(0, 100) })}
Default Logic:
- If user's data indicates they are a "Scholar" (or academic), you MUST prioritize searching "Practitioner".
- If user's data indicates they are a "Practitioner" (or industry professional), you MUST prioritize searching "Scholar".
- If the CONVERSATION HISTORY explicitly specifies a preference (e.g. "Find me scholars"), OVERRIDE default and follow user's request.
Outcome:
- intent: "match" only if they want recommendations AND have provided enough specific context (like a research topic or project idea). "chat" if they are saying hi, OR if their request is too vague (e.g., "Find someone for my thesis" without saying what the thesis is).
- priorityPool: Which tool tool should be called FIRST if matching is triggered (practitioner or scholar).`,
            prompt: `Conversation History:\n${JSON.stringify(messages.slice(-5), null, 2)}`
        });

        // Enforce default logic deterministically (LLMs sometimes contradict instructions in free-text reasoning).
        const explicitPool = inferExplicitPriorityPool(messages);
        const userType = (userProfile?.userType || '').toLowerCase();
        const defaultPool: 'practitioner' | 'scholar' =
            userType.includes('scholar') ? 'practitioner'
                : userType.includes('practitioner') ? 'scholar'
                    : decision.priorityPool;

        const enforcedPriorityPool = explicitPool ?? defaultPool;
        const enforcedDecision = { ...decision, priorityPool: enforcedPriorityPool };

        console.log(`[decide_role] intent=${enforcedDecision.intent} priority=${enforcedDecision.priorityPool} reason=${enforcedDecision.reasoning}`);

        const systemPrompt = `You are an AI Matchmaker for the "Lab for Cybernetics".
Your goal: help the authenticated user find the best collaborators within our community.

COMMUNICATION GUIDELINES:
- If current intent is "chat" (as determined by sub-inference), respond naturally WITHOUT tools. If they asked for a match but their request was too vague (e.g. "for my thesis" but no topic), politely ASK them to describe their project or thesis topic before you search.
- ONLY trigger matching (calling ${enforcedDecision.priorityPool === 'practitioner' ? 'find_practitioners' : 'find_scholars'}) when the intent is "match".

MATCHING FLOW:
- Recommend UP TO 3 collaborators (3 is the target, but less is acceptable).
- PRIORITY ORDER: Call "find_${enforcedDecision.priorityPool === 'practitioner' ? 'practitioners' : 'scholars'}" FIRST.
- Call the secondary pool tool ONLY IF the first tool returned fewer than 3 matches.
- CRITICAL STOP CONDITION: You are only allowed to call each tool ONCE per turn. If you have searched both pools and the combined result is fewer than 3, DO NOT search again. Accept the outcome, output the matches you DID find, and kindly inform the user that there are no more suitable candidates in our current database.
FORMATTING AND REASONING:
- For each recommended candidate, provide a DEEP, personalized explanation (2-3 sentences max) OUTSIDE the card explaining exactly why their work aligns with the user's project.
- Immediately after the deep explanation, render the card using: <recommendation id="CANDIDATE_ID" reason="..."></recommendation>
- Inside the "reason" attribute, write ONLY a highly concise, punchy 1-sentence summary of why they match. DO NOT dump their raw data inside the reason.
- Use markdown headers "### Practitioners" and "### Scholars" to categorize results.

EXPLICIT SANITY CHECK:
Before rendering ANY candidate returned by the tools, you MUST double-check their profile data against all of the user's constraints (e.g., "outside CMU"). If a tool accidentally returns a candidate that violates a negative constraint, YOU MUST SILENTLY DISCARD THEM and do not output their recommendation card or explanation.
Authenticated user profile:
${JSON.stringify(userProfile, null, 2)}`;

        // Hard cap tool searching at 3 total results across pools.
        // The model can still *attempt* a secondary tool call even when already full;
        // we prevent additional searching by tracking remaining slots in code.
        let remainingSlots = 3;

        const result = streamText({
            model: cmuGateway.chat('claude-sonnet-4-20250514-v1:0'),
            system: systemPrompt,
            messages: await convertToModelMessages(messages),
            stopWhen: stepCountIs(5),
            onStepFinish: ({ text, toolCalls, toolResults, finishReason, stepNumber }) => {
                console.log(`[streamText:onStepFinish] stepNumber=${stepNumber} finishReason=${finishReason} toolCalls=${toolCalls?.length ?? 0} textLen=${text?.length ?? 0}`);
                if (toolResults?.length) {
                    console.log(`[streamText:onStepFinish] toolResults:`, toolResults.map((r: any) => ({
                        toolName: r.toolName,
                        resultSummary: Object.fromEntries(Object.entries(r.result as object).map(([k, v]) => [k, Array.isArray(v) ? `[${v.length} items]` : v]))
                    })));
                }
            },
            tools: {
                find_practitioners: tool({
                    description: enforcedDecision.priorityPool === 'practitioner' 
                        ? 'Search practitioners FIRST (Primary pool for this user).' 
                        : 'Search practitioners ONLY to fill gaps if scholars are insufficient.',
                    inputSchema: z.object({
                        query: z.string().describe('The core topic or keywords to search for (e.g. "AI interface").'),
                        negative_constraints: z.array(z.string()).describe('List of things the user explicitly wants to EXCLUDE from the results (e.g. ["Must not be from CMU", "external to Carnegie Mellon"]). VERY IMPORTANT! Read the ENTIRE conversation history to extract these.'),
                        needed: z.number().int().min(1).max(3).optional()
                    }),
                    execute: async ({ query, negative_constraints = [], needed = 3 }) => {
                        if (remainingSlots <= 0) {
                            console.log(`[tool:find_practitioners] Skipped (already filled 3/3).`);
                            return { practitioners: [] };
                        }

                        const effectiveNeeded = Math.min(Math.max(1, needed ?? 3), remainingSlots);
                        console.log(`[tool:find_practitioners] Sub-inference for query="${query}", negatives=[${negative_constraints.join(', ')}], needed=${effectiveNeeded}`);
                        
                        try {
                            const { object } = await generateObject({
                                model: cmuGateway.chat('claude-sonnet-4-20250514-v1:0'),
                                schema: z.object({
                                    candidates_analysis: z.array(z.object({
                                        id: z.string(),
                                        step_by_step_check: z.string().describe(`Analyze: 1. Do they strictly obey the NEGATIVE CONSTRAINTS: [${negative_constraints.join(', ') || 'None'}]? 2. Do they match the topic: ${query}?`),
                                        violates_negative_constraint: z.boolean().describe("MUST BE TRUE if they have ANY affiliation or trait that the negative constraints forbid."),
                                        is_valid: z.boolean().describe("MUST BE FALSE if violates_negative_constraint is true. True ONLY IF they are highly relevant AND completely obey all negative constraints."),
                                        matchReason: z.string()
                                    }))
                                }),
                                system: `You are an evaluator. Find up to ${needed} practitioners.
Topic: "${query}"
Negative Constraints to EXCLUDE: ${negative_constraints.join(', ') || 'None'}
CRITICAL: Pay extreme attention to the Negative Constraints. If a candidate violates a negative constraint (e.g., they are affiliated with a university the user wants to exclude), you MUST set violates_negative_constraint to true and is_valid to false.
Ignore user profile ID: ${userProfile?.id}.`,
                                prompt: `Candidates:\n${JSON.stringify(practitioners.map((p: any) => ({ id: p.id, name: p.name, keywords: p.keywords, bio: p.bio?.substring(0, 200) })), null, 2)}`
                            });

                            const validMatches = object.candidates_analysis
                                .filter(m => !m.violates_negative_constraint && m.is_valid && practitioners.some((p: any) => p.id === m.id))
                                .slice(0, effectiveNeeded);

                            const out = validMatches.map(m => ({
                                ...practitioners.find((p: any) => p.id === m.id),
                                pre_generated_reason: m.matchReason
                            }));

                            remainingSlots = Math.max(0, remainingSlots - out.length);
                            return { practitioners: out };
                        } catch (e) {
                            return { practitioners: [] };
                        }
                    },
                }),
                find_scholars: tool({
                    description: enforcedDecision.priorityPool === 'scholar' 
                        ? 'Search scholars FIRST (Primary pool for this user).' 
                        : 'Search scholars ONLY to fill gaps if practitioners are insufficient.',
                    inputSchema: z.object({
                        query: z.string().describe('The core topic or keywords to search for (e.g. "AI interface").'),
                        negative_constraints: z.array(z.string()).describe('List of things the user explicitly wants to EXCLUDE from the results (e.g. ["Must not be from CMU", "external to Carnegie Mellon"]). VERY IMPORTANT! Read the ENTIRE conversation history to extract these.'),
                        needed: z.number().int().min(1).max(3).optional()
                    }),
                    execute: async ({ query, negative_constraints = [], needed = 3 }) => {
                        if (remainingSlots <= 0) {
                            console.log(`[tool:find_scholars] Skipped (already filled 3/3).`);
                            return { scholars: [] };
                        }

                        const effectiveNeeded = Math.min(Math.max(1, needed ?? 3), remainingSlots);
                        console.log(`[tool:find_scholars] Sub-inference for query="${query}", negatives=[${negative_constraints.join(', ')}], needed=${effectiveNeeded}`);
                        
                        try {
                            const { object } = await generateObject({
                                model: cmuGateway.chat('claude-sonnet-4-20250514-v1:0'),
                                schema: z.object({
                                    candidates_analysis: z.array(z.object({
                                        id: z.string(),
                                        step_by_step_check: z.string().describe(`Analyze: 1. Do they strictly obey the NEGATIVE CONSTRAINTS: [${negative_constraints.join(', ') || 'None'}]? 2. Do they match the topic: ${query}?`),
                                        violates_negative_constraint: z.boolean().describe("MUST BE TRUE if they have ANY affiliation or trait that the negative constraints forbid."),
                                        is_valid: z.boolean().describe("MUST BE FALSE if violates_negative_constraint is true. True ONLY IF they are highly relevant AND completely obey all negative constraints."),
                                        matchReason: z.string()
                                    }))
                                }),
                                system: `You are an evaluator. Find up to ${needed} scholars.
Topic: "${query}"
Negative Constraints to EXCLUDE: ${negative_constraints.join(', ') || 'None'}
CRITICAL: Pay extreme attention to the Negative Constraints. If a candidate violates a negative constraint (e.g., they are affiliated with a university the user wants to exclude), you MUST set violates_negative_constraint to true and is_valid to false.
Ignore user profile ID: ${userProfile?.id}.`,
                                prompt: `Candidates:\n${JSON.stringify(scholars.map((p: any) => ({ id: p.id, name: p.name, keywords: p.keywords, bio: p.bio?.substring(0, 200) })), null, 2)}`
                            });

                            const validMatches = object.candidates_analysis
                                .filter(m => !m.violates_negative_constraint && m.is_valid && scholars.some((p: any) => p.id === m.id))
                                .slice(0, effectiveNeeded);

                            const out = validMatches.map(m => ({
                                ...scholars.find((p: any) => p.id === m.id),
                                pre_generated_reason: m.matchReason
                            }));

                            remainingSlots = Math.max(0, remainingSlots - out.length);
                            return { scholars: out };
                        } catch (e) {
                            return { scholars: [] };
                        }
                    },
                }),
            },
        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("[API /api/chat] Chat API Error:", error);
        return new Response(JSON.stringify({ error: "Failed to process chat request" }), { status: 500 });
    }
}
