"use client";

import * as React from "react";
import { MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getMatchingProfileTheme } from "@/lib/matching-user-type-theme";
import {
    CLARIFICATION_OTHER_OPTION_ID,
    type ClarificationAnswer,
    type PresentClarificationFormInput,
} from "@/lib/clarification-form";

type FormPayload = PresentClarificationFormInput & { ok?: boolean };

export type ClarificationFormCardProps = {
    payload: FormPayload;
    onSubmit: (answers: ClarificationAnswer[]) => void;
    disabled?: boolean;
    /** Logged-in viewer profile — drives scholar / practitioner / default styling (same as recommendation cards). */
    viewerUserType?: string | null;
};

function RadioIndicator({ checked, checkedClasses }: { checked: boolean; checkedClasses: string }) {
    return (
        <span
            className={cn(
                "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                checked ? checkedClasses : "border-neutral-300 bg-white"
            )}
            aria-hidden
        >
            {checked ? <span className="h-2 w-2 rounded-full bg-white shadow-sm" /> : null}
        </span>
    );
}

export function ClarificationFormCard({ payload, onSubmit, disabled, viewerUserType }: ClarificationFormCardProps) {
    const theme = getMatchingProfileTheme(viewerUserType, true);

    const [selections, setSelections] = React.useState<Record<string, { optionId: string; otherText: string }>>(() => {
        const init: Record<string, { optionId: string; otherText: string }> = {};
        for (const q of payload.questions) {
            init[q.id] = { optionId: "", otherText: "" };
        }
        return init;
    });

    const setOption = (questionId: string, optionId: string) => {
        setSelections((prev) => ({
            ...prev,
            [questionId]: { optionId, otherText: prev[questionId]?.otherText ?? "" },
        }));
    };

    const setOtherText = (questionId: string, text: string) => {
        setSelections((prev) => ({
            ...prev,
            [questionId]: {
                optionId: CLARIFICATION_OTHER_OPTION_ID,
                otherText: text,
            },
        }));
    };

    const submitAnswers = () => {
        const answers: ClarificationAnswer[] = [];
        for (const q of payload.questions) {
            const sel = selections[q.id];
            if (!sel) continue;
            if (sel.optionId === CLARIFICATION_OTHER_OPTION_ID) {
                const trimmed = sel.otherText.trim();
                if (!trimmed) continue;
                answers.push({
                    questionId: q.id,
                    selectedOptionId: CLARIFICATION_OTHER_OPTION_ID,
                    otherText: trimmed,
                });
            } else {
                answers.push({
                    questionId: q.id,
                    selectedOptionId: sel.optionId,
                });
            }
        }
        if (answers.length !== payload.questions.length) return;
        onSubmit(answers);
    };

    const canSubmit =
        payload.questions.every((q) => {
            const sel = selections[q.id];
            if (!sel?.optionId) return false;
            if (sel.optionId === CLARIFICATION_OTHER_OPTION_ID) return sel.otherText.trim().length > 0;
            return q.options.some((o) => o.id === sel.optionId);
        }) && !disabled;

    return (
        <div className="block w-full">
            <Card
                className={cn(
                    "my-1 overflow-hidden border bg-white text-left shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all rounded-xl",
                    theme.cardBorder
                )}
            >
                <div
                    className={cn(
                        "flex items-center justify-between gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-widest",
                        theme.headerBar
                    )}
                >
                    <span className="flex items-center gap-1.5">
                        <MessageCircleQuestion className={cn("h-3.5 w-3.5 shrink-0", theme.headerIcon)} strokeWidth={2} />
                        <span>Clarification</span>
                    </span>
                    <span className="font-semibold opacity-50 tracking-normal">Questions</span>
                </div>

                {(payload.title || payload.intro) && (
                    <CardHeader className="space-y-2 pb-4 pt-5 px-5">
                        {payload.title && (
                            <CardTitle className="text-base font-bold text-neutral-900 tracking-tight">{payload.title}</CardTitle>
                        )}
                        {payload.intro && (
                            <div className="text-xs text-neutral-500 bg-neutral-50/50 p-3 rounded-lg border border-neutral-100/50 leading-normal italic">
                                "{payload.intro}"
                            </div>
                        )}
                    </CardHeader>
                )}

                <CardContent className="space-y-6 border-t border-neutral-100/60 bg-white px-5 pb-2 pt-5">
                    {payload.questions.map((q, qi) => (
                        <div
                            key={q.id}
                            className={cn(
                                "rounded-xl border border-neutral-50 bg-white py-4 pl-4 pr-3 shadow-[0_1px_4px_rgba(0,0,0,0.02)]",
                                theme.questionAccent
                            )}
                        >
                            <Label className="mb-4 block text-sm font-bold leading-tight text-neutral-900">
                                <span
                                    className={cn(
                                        "mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold",
                                        theme.numberBadge
                                    )}
                                >
                                    {qi + 1}
                                </span>
                                <span className="align-middle">{q.prompt}</span>
                            </Label>

                            <div className="flex flex-col gap-2">
                                {q.options.map((opt) => {
                                    const sel = selections[q.id];
                                    const checked = sel?.optionId === opt.id;
                                    return (
                                        <label
                                            key={opt.id}
                                            className={cn(
                                                "group flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-xs transition-all duration-150",
                                                checked
                                                    ? `${theme.optionSelected} border-neutral-900`
                                                    : "border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50/30"
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name={`clarify-${q.id}`}
                                                className="sr-only"
                                                checked={checked}
                                                onChange={() => setOption(q.id, opt.id)}
                                                disabled={disabled}
                                            />
                                            <RadioIndicator checked={checked} checkedClasses={theme.radioChecked} />
                                            <span className={cn("text-neutral-600", checked && "text-neutral-900 font-medium")}>
                                                {opt.label}
                                            </span>
                                        </label>
                                    );
                                })}

                                <label
                                    className={cn(
                                        "flex cursor-pointer flex-col gap-3 rounded-lg border px-3 py-2.5 text-xs transition-all duration-150",
                                        selections[q.id]?.optionId === CLARIFICATION_OTHER_OPTION_ID
                                            ? `${theme.optionSelected} border-neutral-900`
                                            : "border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50/30"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="radio"
                                            name={`clarify-${q.id}`}
                                            className="sr-only"
                                            checked={selections[q.id]?.optionId === CLARIFICATION_OTHER_OPTION_ID}
                                            onChange={() =>
                                                setSelections((prev) => ({
                                                    ...prev,
                                                    [q.id]: {
                                                        optionId: CLARIFICATION_OTHER_OPTION_ID,
                                                        otherText: prev[q.id]?.otherText ?? "",
                                                    },
                                                }))
                                            }
                                            disabled={disabled}
                                        />
                                        <RadioIndicator
                                            checked={selections[q.id]?.optionId === CLARIFICATION_OTHER_OPTION_ID}
                                            checkedClasses={theme.radioChecked}
                                        />
                                        <span className={cn("text-neutral-600 font-medium", selections[q.id]?.optionId === CLARIFICATION_OTHER_OPTION_ID && "text-neutral-900")}>
                                            {q.otherLabel ?? "Other"}
                                        </span>
                                    </div>
                                    {selections[q.id]?.optionId === CLARIFICATION_OTHER_OPTION_ID && (
                                        <Textarea
                                            value={selections[q.id]?.otherText ?? ""}
                                            onChange={(e) => setOtherText(q.id, e.target.value)}
                                            placeholder={q.otherPlaceholder ?? "Describe…"}
                                            className={cn(
                                                "min-h-[80px] resize-y bg-white text-xs text-neutral-900 rounded-md",
                                                "border-neutral-200 placeholder:text-neutral-400 font-normal",
                                                "focus-visible:border-neutral-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                            )}
                                            disabled={disabled}
                                        />
                                    )}
                                </label>
                            </div>
                        </div>
                    ))}
                </CardContent>

                <div className="flex justify-end border-t border-neutral-100/60 bg-neutral-50/30 px-5 py-3">
                    <Button
                        type="button"
                        disabled={!canSubmit}
                        onClick={submitAnswers}
                        className={cn(
                            "h-9 min-w-[100px] px-4 text-xs font-bold uppercase tracking-wider",
                            theme.continueBtn
                        )}
                    >
                        Continue
                    </Button>
                </div>
            </Card>
        </div>
    );
}
