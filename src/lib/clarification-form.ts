import { z } from 'zod';

/** Sentinel id for the optional free-text "Other" choice (not sent by the model). */
export const CLARIFICATION_OTHER_OPTION_ID = '__other__';

export const clarificationOptionSchema = z.object({
    id: z.string(),
    label: z.string(),
});

export const clarificationQuestionSchema = z.object({
    id: z.string().describe('Stable id for this question; echoed in user answers.'),
    prompt: z.string(),
    /** 1–3 preset options (each ≤3). The UI always adds an "Other" field in addition to these. */
    options: z.array(clarificationOptionSchema).min(1).max(3),
    otherLabel: z.string().optional().describe('Label for the free-text field (e.g. "Other").'),
    otherPlaceholder: z.string().optional(),
});

export const presentClarificationFormInputSchema = z.object({
    title: z.string().optional(),
    intro: z.string().optional().describe('Optional short line; no long bullet lists.'),
    /** At most 3 questions per round; rendered vertically in one card. */
    questions: z.array(clarificationQuestionSchema).min(1).max(3),
});

export type ClarificationQuestion = z.infer<typeof clarificationQuestionSchema>;
export type PresentClarificationFormInput = z.infer<typeof presentClarificationFormInputSchema>;

export type ClarificationAnswer = {
    questionId: string;
    /** One of the preset option ids, or CLARIFICATION_OTHER_OPTION_ID for Other. */
    selectedOptionId: string;
    otherText?: string;
};

const LEGACY_PREFIX = '[Clarification form answers]';

/** User-visible message sent after submitting the form (readable for both humans and the model). */
export function formatClarificationAnswersForChat(
    payload: PresentClarificationFormInput,
    answers: ClarificationAnswer[]
): string {
    const lines: string[] = ['Clarification answers:'];
    for (const a of answers) {
        const q = payload.questions.find((x) => x.id === a.questionId);
        const qHead = q?.prompt?.trim() || a.questionId;
        let choice = '';
        if (a.selectedOptionId === CLARIFICATION_OTHER_OPTION_ID) {
            choice = (a.otherText ?? '').trim() || '(Other)';
        } else {
            const opt = q?.options.find((o) => o.id === a.selectedOptionId);
            choice = opt?.label?.trim() || a.selectedOptionId;
        }
        lines.push(`• ${qHead}: ${choice}`);
    }
    return lines.join('\n');
}

/**
 * Legacy sessions stored raw JSON after the old prefix; map to a short readable summary for the UI.
 * Returns null if the message is not that legacy format (new messages use formatClarificationAnswersForChat).
 */
export function trySummarizeLegacyClarificationMessage(text: string): string | null {
    const trimmed = text.trim();
    if (!trimmed.startsWith(LEGACY_PREFIX)) return null;
    const jsonPart = trimmed.slice(LEGACY_PREFIX.length).trim();
    try {
        const data = JSON.parse(jsonPart) as { answers?: ClarificationAnswer[] };
        const answers = data?.answers;
        if (!Array.isArray(answers) || answers.length === 0) {
            return 'Clarification submitted.';
        }
        const lines = answers.map((a) => {
            const q = a.questionId ?? '?';
            const choice =
                a.selectedOptionId === CLARIFICATION_OTHER_OPTION_ID
                    ? (a.otherText ?? '').trim() || 'Other'
                    : (a.selectedOptionId ?? '');
            return `• ${q}: ${choice}`;
        });
        return `Clarification submitted\n${lines.join('\n')}`;
    } catch {
        return 'Clarification submitted.';
    }
}
