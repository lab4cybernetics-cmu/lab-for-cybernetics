import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const cmuGateway = createOpenAI({
    baseURL: 'https://ai-gateway.andrew.cmu.edu',
    apiKey: process.env.CMU_GATEWAY_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { userProfile } = await req.json();

        const result = await generateObject({
            model: cmuGateway.chat('claude-sonnet-4-20250514-v1:0'),
            schema: z.object({
                suggestions: z.array(z.string()).length(5),
            }),
            prompt: `You are helping a member of the Lab for Cybernetics find collaborators.

Analyze this person's profile and generate exactly 5 short, specific collaboration topics they are likely seeking.
- Synthesize and infer from their keywords, "about" text, organization, and user type — do NOT just copy keywords verbatim
- Each suggestion should be a concrete topic or area (5–10 words max), e.g. "AI governance and policy research", "Urban resilience through digital infrastructure"
- Think about what kind of collaborator they would find useful given their background
- Return only the suggestions array

Profile:
${JSON.stringify(userProfile, null, 2)}`,
        });

        return Response.json(result.object);
    } catch (error) {
        console.error('[API /api/chat/suggest] Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate suggestions' }), { status: 500 });
    }
}
