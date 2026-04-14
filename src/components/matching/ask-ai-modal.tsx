"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Check, MessageCircleQuestion, ChevronLeft, ChevronRight } from "lucide-react";
import { sendVerificationCode, verifyCode } from "@/app/actions";
import { MatchingItem } from "@/lib/notion-types";
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MatchingRecommendationCard } from "@/components/matching/matching-recommendation-card";
import { Textarea } from "@/components/ui/textarea";
import {
    formatClarificationAnswersForChat,
    trySummarizeLegacyClarificationMessage,
    type PresentClarificationFormInput,
    type ClarificationAnswer,
    CLARIFICATION_OTHER_OPTION_ID,
} from "@/lib/clarification-form";
import { getMatchingProfileTheme } from "@/lib/matching-user-type-theme";
import ReactMarkdown from "react-markdown";

import * as React from "react"
import { cn } from "@/lib/utils"

// ─── Inline clarification panel ──────────────────────────────────────────────
// Replaces the text-input area while a clarification form is active.
// Shows one question at a time; Continue is enabled only when every question
// has an answer.

type InlinePanelProps = {
    payload: PresentClarificationFormInput & { ok?: boolean };
    viewerUserType?: string | null;
    disabled?: boolean;
    onSubmit: (answers: ClarificationAnswer[]) => void;
};

function InlineClarificationPanel({ payload, viewerUserType, disabled, onSubmit }: InlinePanelProps) {
    const theme = getMatchingProfileTheme(viewerUserType, true);
    const [index, setIndex] = React.useState(0);
    const [answers, setAnswers] = React.useState<Record<string, { optionId: string; otherText: string }>>(() => {
        const init: Record<string, { optionId: string; otherText: string }> = {};
        for (const q of payload.questions) init[q.id] = { optionId: '', otherText: '' };
        return init;
    });

    const question = payload.questions[index];
    const total = payload.questions.length;
    const sel = answers[question.id];

    const isAnswered = (qid: string) => {
        const s = answers[qid];
        if (!s?.optionId) return false;
        if (s.optionId === CLARIFICATION_OTHER_OPTION_ID) return s.otherText.trim().length > 0;
        return payload.questions.find(q => q.id === qid)?.options.some(o => o.id === s.optionId) ?? false;
    };
    const allAnswered = payload.questions.every(q => isAnswered(q.id));

    const pickOption = (optionId: string) =>
        setAnswers(prev => ({ ...prev, [question.id]: { optionId, otherText: '' } }));

    const handleSubmit = () => {
        const ans: ClarificationAnswer[] = [];
        for (const q of payload.questions) {
            const s = answers[q.id];
            if (!s?.optionId) continue;
            if (s.optionId === CLARIFICATION_OTHER_OPTION_ID) {
                const t = s.otherText.trim();
                if (t) ans.push({ questionId: q.id, selectedOptionId: CLARIFICATION_OTHER_OPTION_ID, otherText: t });
            } else {
                ans.push({ questionId: q.id, selectedOptionId: s.optionId });
            }
        }
        if (ans.length === payload.questions.length) onSubmit(ans);
    };

    return (
        <div className="border-t border-neutral-200 bg-white pt-2.5 pb-1">
            {/* Header row: title + dot progress */}
            <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    <MessageCircleQuestion className="h-3.5 w-3.5" />
                    {payload.title ?? 'Clarification'}
                </span>
                <span className="flex items-center gap-1">
                    {payload.questions.map((q, i) => (
                        <button key={q.id} onClick={() => setIndex(i)}
                            className={cn("h-2 w-2 rounded-full transition-colors focus:outline-none",
                                i === index ? "bg-neutral-800" : isAnswered(q.id) ? "bg-neutral-400" : "bg-neutral-200"
                            )}
                        />
                    ))}
                </span>
            </div>

            {/* Current question */}
            <div className="rounded-xl border border-neutral-100 bg-neutral-50/40 px-4 py-3">
                <p className="text-[13px] font-semibold text-neutral-900 mb-2.5 flex items-start gap-2">
                    <span className={cn("shrink-0 mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold", theme.numberBadge)}>
                        {index + 1}
                    </span>
                    {question.prompt}
                </p>
                <div className="flex flex-col gap-1.5">
                    {question.options.map(opt => {
                        const checked = sel?.optionId === opt.id;
                        return (
                            <label key={opt.id} className={cn(
                                "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2 text-xs transition-all",
                                checked ? `${theme.optionSelected}` : "border-neutral-100 bg-white hover:bg-neutral-50"
                            )}>
                                <input type="radio" name={`icf-${question.id}`} className="sr-only"
                                    checked={checked} onChange={() => pickOption(opt.id)} disabled={disabled} />
                                <span className={cn(
                                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                    checked ? theme.radioChecked : "border-neutral-300 bg-white"
                                )} aria-hidden>
                                    {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                                </span>
                                <span className={cn("text-neutral-600", checked && "font-medium text-neutral-900")}>{opt.label}</span>
                            </label>
                        );
                    })}
                    {/* "Other" free-text option */}
                    <label className={cn(
                        "flex cursor-pointer flex-col gap-2 rounded-lg border px-3 py-2 text-xs transition-all",
                        sel?.optionId === CLARIFICATION_OTHER_OPTION_ID ? theme.optionSelected : "border-neutral-100 bg-white hover:bg-neutral-50"
                    )}>
                        <div className="flex items-start gap-2.5">
                            <input type="radio" name={`icf-${question.id}`} className="sr-only"
                                checked={sel?.optionId === CLARIFICATION_OTHER_OPTION_ID}
                                onChange={() => setAnswers(prev => ({
                                    ...prev,
                                    [question.id]: { optionId: CLARIFICATION_OTHER_OPTION_ID, otherText: prev[question.id]?.otherText ?? '' },
                                }))}
                                disabled={disabled} />
                            <span className={cn(
                                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                sel?.optionId === CLARIFICATION_OTHER_OPTION_ID ? theme.radioChecked : "border-neutral-300 bg-white"
                            )} aria-hidden>
                                {sel?.optionId === CLARIFICATION_OTHER_OPTION_ID && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </span>
                            <span className={cn("text-neutral-600 font-medium", sel?.optionId === CLARIFICATION_OTHER_OPTION_ID && "text-neutral-900")}>
                                {question.otherLabel ?? 'Other'}
                            </span>
                        </div>
                        {sel?.optionId === CLARIFICATION_OTHER_OPTION_ID && (
                            <Textarea
                                value={sel.otherText ?? ''}
                                onChange={e => setAnswers(prev => ({
                                    ...prev,
                                    [question.id]: { optionId: CLARIFICATION_OTHER_OPTION_ID, otherText: e.target.value },
                                }))}
                                placeholder={question.otherPlaceholder ?? 'Describe…'}
                                className="min-h-[56px] resize-none bg-white text-xs rounded-md border-neutral-200 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                disabled={disabled}
                            />
                        )}
                    </label>
                </div>
            </div>

            {/* Footer: prev/next + continue */}
            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                        onClick={() => setIndex(i => i - 1)} disabled={index === 0 || disabled}>
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-xs text-neutral-400 px-1">{index + 1} / {total}</span>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                        onClick={() => setIndex(i => i + 1)} disabled={index === total - 1 || disabled}>
                        <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                </div>
                <Button type="button" size="sm"
                    disabled={!allAnswered || disabled}
                    onClick={handleSubmit}
                    className={cn("h-8 px-5 text-xs font-bold uppercase tracking-wider", theme.continueBtn)}
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

interface AskAiModalProps {
    items: MatchingItem[];
}

export function AskAiModal({ items }: AskAiModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<"search" | "confirm" | "code" | "chat">("search");
    const devMode = false;

    // Search & Select State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItem, setSelectedItem] = useState<MatchingItem | null>(null);

    // Verification State
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendStatus, setResendStatus] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Chat State
    const [verifiedUser, setVerifiedUser] = useState<MatchingItem | null>(null);
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [submittedClarificationKeys, setSubmittedClarificationKeys] = useState<Set<string>>(() => new Set());

    // In @ai-sdk/react 3.x, useChat no longer returns input, handleInputChange, or handleSubmit.
    const transport = React.useMemo(() => {
        return new DefaultChatTransport({
            api: "/api/chat",
            body: {
                userProfile: verifiedUser,
                candidates: items.filter(i => i.id !== verifiedUser?.id)
            }
        });
    }, [verifiedUser, items]);

    const { messages, setMessages, sendMessage, status } = useChat({
        id: verifiedUser?.id || "guest-chat",
        transport,
        onFinish: (message: any) => {
            console.log("[useChat] onFinish. Final message:", message);
        },
        onError: (error: any) => {
            console.error("[useChat] onError:", error);
        }
    });

    React.useEffect(() => {
        console.log(`[AskAiModal] Messages updated. Count: ${messages.length}, status: ${status}`);
        messages.forEach(msg => {
            // In AI SDK v4, tool parts have type 'tool-{toolName}' (not 'tool-invocation')
            const toolParts = (msg.parts ?? []).filter((p: any) => p.type?.startsWith('tool-') && p.type !== 'step-start');
            if (toolParts.length > 0) {
                console.log(`[AskAiModal] Tool parts in msg ${msg.id}:`, toolParts.map((p: any) => ({
                    type: p.type,
                    toolName: p.type?.replace(/^tool-/, ''),
                    state: p.state,
                    input: p.input,
                    outputSummary: p.output
                        ? Object.fromEntries(Object.entries(p.output).map(([k, v]) => [k, Array.isArray(v) ? `[${(v as any[]).length} items]` : v]))
                        : null,
                })));
            }
            const textParts = (msg.parts ?? []).filter((p: any) => p.type === 'text');
            if (textParts.length > 0) {
                console.log(`[AskAiModal] Text in msg ${msg.id}:`, textParts.map((p: any) => ({ state: p.state, preview: p.text?.slice(0, 80) })));
            }
        });
    }, [messages, status]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isChatLoading = status === 'streaming' || status === 'submitted';

    // Most-recent unsubmitted clarification form — drives the inline bottom panel.
    // Must be after useChat so `messages` is defined.
    const activeClarificationForm = React.useMemo(() => {
        for (let mi = messages.length - 1; mi >= 0; mi--) {
            const msg = messages[mi];
            if (msg.role !== 'assistant') continue;
            const parts = (msg.parts ?? []) as any[];
            for (let pi = 0; pi < parts.length; pi++) {
                const part = parts[pi];
                if (part.type === 'tool-present_clarification_form' && part.state === 'output-available') {
                    const key = `${msg.id}-tool-${pi}`;
                    if (!submittedClarificationKeys.has(key)) {
                        return { key, payload: part.output as PresentClarificationFormInput & { ok?: boolean } };
                    }
                }
            }
        }
        return null;
    }, [messages, submittedClarificationKeys]);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isChatLoading]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input || !input.trim() || isChatLoading) return;
        sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] });
        setInput("");
    };

    React.useEffect(() => {
        if (step === 'chat' && verifiedUser && messages.length === 0) {
            setMessages([{ id: Date.now().toString(), role: 'assistant', parts: [{ type: 'text', text: `Hello ${verifiedUser.name}. Based on this profile, here are collaboration topics that may be relevant — click one to get started, or describe what you are looking for in your own words.` }] }]);
            // Fetch AI-generated suggestions
            setSuggestionsLoading(true);
            fetch('/api/chat/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userProfile: verifiedUser }),
            })
                .then(res => res.json())
                .then(data => { if (data.suggestions) setSuggestions(data.suggestions); })
                .catch(err => console.error('[AskAiModal] Failed to fetch suggestions:', err))
                .finally(() => setSuggestionsLoading(false));
        }
    }, [step, verifiedUser, messages.length, setMessages]);

    // Helper to get text from UIMessage (v4)
    const getMessageText = (msg: any) => {
        if (!msg.parts) return '';
        return msg.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Reset state on modal close/open
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            // Give time for transition out before resetting
            setTimeout(() => {
                setStep("search");
                setSelectedItem(null);
                setSearchQuery("");
                setCode("");
                setError("");
                setResendStatus("");
                setVerifiedUser(null);
                setMessages([]);
                setSuggestions([]);
                setSuggestionsLoading(false);
                setSubmittedClarificationKeys(new Set());
            }, 300);
        }
    };

    const handleSelect = (item: MatchingItem) => {
        setSelectedItem(item);
        setStep("confirm");
        setError("");
        setResendStatus("");
    };

    async function handleSendCode() {
        if (!selectedItem) return;

        setIsLoading(true);
        setError("");
        setResendStatus("");

        const result = await sendVerificationCode(selectedItem.id);

        setIsLoading(false);
        if (result.success) {
            setStep("code");
        } else {
            setError(result.error || "Failed to send code.");
        }
    }

    async function handleVerify(inputCode: string) {
        if (!selectedItem) return;
        if (inputCode.length !== 6) return;

        setIsLoading(true);
        setError("");

        const result = await verifyCode(selectedItem.id, inputCode);

        setIsLoading(false);
        if (result.success) {
            setVerifiedUser(selectedItem); // Save whole Notion entry
            setStep("chat");
        } else {
            setError(result.error || "Verification failed");
        }
    }

    async function handleResend() {
        if (!selectedItem) return;

        setIsLoading(true);
        setError("");
        setResendStatus("");

        const result = await sendVerificationCode(selectedItem.id);

        setIsLoading(false);
        if (result.success) {
            setResendStatus("Code resent!");
        } else {
            setError(result.error || "Failed to resend.");
        }
    }

    const mdClass = "[&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_p]:mb-2 last:[&_p]:mb-0";

    const renderMarkdown = (text: string, key: number | string) => (
        <div key={key} className={mdClass}>
            <ReactMarkdown
                components={{
                    h3: ({ node, ...props }) => (
                        <div className="flex items-center gap-3 mt-6 mb-3">
                            <div className="h-px bg-neutral-200 flex-1"></div>
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest" {...props} />
                            <div className="h-px bg-neutral-200 flex-1"></div>
                        </div>
                    ),
                    hr: () => null
                }}
            >
                {text}
            </ReactMarkdown>
        </div>
    );

    const renderToolInvocation = (part: any, key: string) => {
        const toolName = part.type?.replace(/^tool-/, '') ?? '';

        if (toolName === 'present_clarification_form') {
            const isDone = part.state === 'output-available';
            const payload = part.output as (PresentClarificationFormInput & { ok?: boolean }) | undefined;
            if (!isDone || !payload?.questions?.length) {
                return (
                    <div key={key} className="flex items-center gap-2 py-1 text-xs text-neutral-400">
                        <Loader2 className="h-3 w-3 flex-shrink-0 animate-spin" /> Preparing questions…
                    </div>
                );
            }
            if (submittedClarificationKeys.has(key)) {
                return (
                    <div key={key} className="rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
                        Form submitted.
                    </div>
                );
            }
            // Active form is handled by InlineClarificationPanel at the bottom.
            return (
                <div key={key} className="flex items-center gap-2 py-1 text-xs text-neutral-500">
                    <MessageCircleQuestion className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                    <span className="font-medium">{payload.title ?? 'Clarification questions'}</span>
                    <span className="text-neutral-400">— answer below ↓</span>
                </div>
            );
        }

        const isPractitioner = toolName === 'find_practitioners';
        const label = isPractitioner ? 'Practitioners' : 'Scholars';
        const isDone = part.state === 'output-available';
        const count = isDone
            ? (isPractitioner ? part.output?.practitioners?.length : part.output?.scholars?.length)
            : null;

        console.log(`[renderToolInvocation] toolName=${toolName} state=${part.state} count=${count}`);

        return (
            <div key={key} className="flex items-center gap-2 text-xs text-neutral-400 py-0.5">
                {isDone
                    ? <><Check className="h-3 w-3 text-green-500 flex-shrink-0" /> Found {count} {label.toLowerCase()}</>
                    : <><Loader2 className="h-3 w-3 animate-spin flex-shrink-0" /> Searching {label}…</>
                }
            </div>
        );
    };

    const renderMessageContent = (content: string) => {
        // Strip closing tags first — they carry no data and may have stray whitespace/newlines
        // that prevent the opening-tag regex from consuming them
        const normalized = content.replace(/<\/recommendation>/g, '');
        // Model often omits the closing ">", so don't require it — just capture id and reason
        const regex = /<recommendation\s+id="([^"]+)"\s+reason="([^"]+)"/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(normalized)) !== null) {
            if (match.index > lastIndex) {
                parts.push(renderMarkdown(normalized.slice(lastIndex, match.index), lastIndex));
            }

            const candidateId = match[1];
            const reason = match[2].replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
            const candidate = items.find(i => i.id === candidateId)
                ?? items.find(i => i.id.replace(/-/g, '') === candidateId.replace(/-/g, ''));

            if (candidate) {
                parts.push(<MatchingRecommendationCard key={match.index} item={candidate} reason={reason} userKeywords={verifiedUser?.keywords ?? []} />);
            }

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < normalized.length) {
            parts.push(renderMarkdown(normalized.slice(lastIndex), lastIndex));
        }

        return parts.length > 0 ? parts : renderMarkdown(normalized, 0);
    }


    const maskedEmail = selectedItem?.email || "the registered email";

    if (!isMounted) {
        return (
            <Button variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-50 hover:text-blue-800 bg-transparent">
                AI Matching
            </Button>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-50 hover:text-blue-800 bg-transparent">
                    AI Matching
                </Button>
            </DialogTrigger>
            <DialogContent
                className={cn(
                    "overflow-hidden p-0 !gap-0 transition-all duration-300",
                    step === "chat"
                        ? "sm:max-w-4xl"
                        : "sm:max-w-xl max-h-[95vh]"
                )}
            >
                {/* Outer wrapper: inline styles for layout-critical properties so they
                    cannot be missed by Tailwind JIT or overridden by DialogContent's
                    default `grid` display. */}
                <div
                    className={step === "chat" ? "w-full overflow-hidden" : "flex flex-col p-6 w-full"}
                    style={step === "chat" ? {
                        display: 'grid',
                        gridTemplateRows: 'auto 1fr auto',
                        height: '90vh',
                        padding: '1rem 1.5rem',
                        overflow: 'hidden',
                    } : undefined}
                >
                    {/* Header for Verification Steps (Search, Confirm, Code) */}
                    {step !== "chat" && (
                        <div className="mb-6 flex-shrink-0">
                            <DialogTitle className="text-xl font-bold">
                                {step === "search" && "Find Your Entry"}
                                {step === "confirm" && "Verify Ownership"}
                                {step === "code" && "Verify Ownership"}
                            </DialogTitle>
                            <DialogDescription className="mt-1.5 text-neutral-500">
                                {step === "search" && "Please select your entry to authenticate."}
                                {step === "confirm" && `Is this your entry? We'll send a verification code to ${maskedEmail} to confirm.`}
                                {step === "code" && "Enter the 6-digit code sent to your email."}
                            </DialogDescription>
                        </div>
                    )}

                    {/* Shared Error/Status area */}
                    {(error || resendStatus) && (
                        <div className="flex-shrink-0 mb-4">
                            {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
                            {resendStatus && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">{resendStatus}</div>}
                        </div>
                    )}

                    {/* Search Logic */}
                    {step === "search" && (
                        <div className="flex-1 flex flex-col min-h-0 gap-4 overflow-hidden">
                            <div className="relative flex-shrink-0">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                <Input
                                    placeholder="Search your name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto border rounded-md divide-y divide-neutral-100 min-h-0 max-h-[50vh]">
                                {filteredItems.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-neutral-500">No entries found.</div>
                                ) : (
                                    filteredItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSelect(item)}
                                            className="w-full text-left p-3 hover:bg-neutral-50 transition-colors flex flex-col gap-1"
                                        >
                                            <div className="font-medium text-sm">{item.name}</div>
                                            <div className="text-xs text-neutral-500 flex gap-2">
                                                <span>{item.userType}</span>
                                                {item.organization && <span>• {item.organization}</span>}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Confirm Step */}
                    {step === "confirm" && (
                        <div className="flex justify-end gap-3 mt-4 flex-shrink-0">
                            <Button variant="ghost" onClick={() => setStep("search")}>Back</Button>
                            {devMode && (
                                <Button
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                        if (selectedItem) {
                                            setVerifiedUser(selectedItem);
                                            setStep("chat");
                                        }
                                    }}
                                >
                                    Test bypass
                                </Button>
                            )}
                            <Button onClick={handleSendCode} disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                                Yes, send code
                            </Button>
                        </div>
                    )}

                    {/* Verification Code Step */}
                    {step === "code" && (
                        <div className="space-y-4 flex-shrink-0">
                            <div className="flex justify-center">
                                <Input
                                    className="text-center text-2xl tracking-widest w-40 h-12"
                                    maxLength={6}
                                    placeholder="000000"
                                    value={code}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        setCode(val);
                                        if (val.length === 6) handleVerify(val);
                                    }}
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-between items-center text-sm text-neutral-500 pt-2">
                                <Button variant="ghost" size="sm" onClick={() => setStep("confirm")} disabled={isLoading}>Back</Button>
                                <Button variant="link" className="p-0 h-auto text-neutral-500" onClick={handleResend} disabled={isLoading}>
                                    Resend Code
                                </Button>
                            </div>
                            <p className="text-xs text-center text-neutral-400 mt-4 border-t pt-4">
                                Having trouble? Contact <a href="mailto:lab4cybernetics@andrew.cmu.edu" className="underline hover:text-neutral-600">lab4cybernetics@andrew.cmu.edu</a>
                            </p>
                        </div>
                    )}

                    {/* Chat Flow */}
                    {step === "chat" && (
                        <>
                            {/* Chat Header — grid row 1 (auto height) */}
                            <div className="bg-background pb-3 mb-4">
                                <DialogTitle className="text-xl">AI Assistant</DialogTitle>
                                <div className="text-sm text-neutral-500 mt-1 flex items-center gap-2">
                                    Authenticated as {verifiedUser?.name}
                                    {verifiedUser?.userType && (
                                        <span className={cn(
                                            "text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full",
                                            verifiedUser.userType.toLowerCase().includes("scholar") ? "bg-green-100 text-green-800" :
                                                verifiedUser.userType.toLowerCase().includes("practitioner") ? "bg-orange-100 text-orange-800" :
                                                    "bg-neutral-100 text-neutral-600"
                                        )}>
                                            {verifiedUser.userType}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-neutral-400 mt-1 truncate">
                                    Finding collaborators in Lab for Cybernetics community...
                                </p>
                            </div>

                            {/* Scrollable Messages Area — grid row 2 (1fr) */}
                            <div style={{ overflow: 'auto', minHeight: 0 }} className="overscroll-contain pr-2 pb-2 space-y-4">
                                {messages.map((msg) => {
                                    return (
                                        <div key={msg.id} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                                            <div className={cn(
                                                "rounded-lg p-3 text-sm flex flex-col gap-2 shadow-sm max-w-[85%]",
                                                msg.role === 'user'
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-neutral-50 border border-neutral-100 text-neutral-900"
                                            )}>
                                                {msg.role === 'user' ? (
                                                    <span className="whitespace-pre-wrap">
                                                        {trySummarizeLegacyClarificationMessage(getMessageText(msg)) ?? getMessageText(msg)}
                                                    </span>
                                                ) : (() => {
                                                    const elements: React.ReactNode[] = [];
                                                    let textBuffer = '';
                                                    (msg.parts ?? []).forEach((part: any, i: number) => {
                                                        if (part.type === 'text') {
                                                            textBuffer += part.text;
                                                        } else if (part.type?.startsWith('tool-') && part.type !== 'step-start') {
                                                            if (textBuffer.trim()) {
                                                                elements.push(renderMessageContent(textBuffer));
                                                                textBuffer = '';
                                                            }
                                                            elements.push(renderToolInvocation(part, `${msg.id}-tool-${i}`));
                                                        }
                                                    });
                                                    if (textBuffer.trim()) elements.push(renderMessageContent(textBuffer));
                                                    return elements.length > 0 ? elements : null;
                                                })()}
                                            </div>
                                        </div>
                                    );
                                })}

                                {messages.length === 1 && !isChatLoading && (
                                    <div className="flex flex-col gap-2 w-full max-w-[85%]">
                                        {suggestionsLoading ? (
                                            <div className="flex items-center gap-2 text-xs text-neutral-400 pl-1">
                                                <Loader2 className="h-3 w-3 animate-spin" /> Analyzing profile…
                                            </div>
                                        ) : suggestions.map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    sendMessage({ role: 'user', parts: [{ type: 'text', text: s }] });
                                                    setSuggestions([]);
                                                }}
                                                className="text-xs px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 transition-colors font-medium text-left"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {isChatLoading && (
                                    <div className="flex items-start">
                                        <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-3 shadow-sm">
                                            <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Bottom area (grid row 3): clarification panel OR regular input */}
                            {activeClarificationForm ? (
                                <InlineClarificationPanel
                                    key={activeClarificationForm.key}
                                    payload={activeClarificationForm.payload}
                                    viewerUserType={verifiedUser?.userType}
                                    disabled={isChatLoading}
                                    onSubmit={(answers) => {
                                        setSubmittedClarificationKeys(prev => new Set(prev).add(activeClarificationForm.key));
                                        sendMessage({
                                            role: 'user',
                                            parts: [{ type: 'text', text: formatClarificationAnswersForChat(activeClarificationForm.payload, answers) }],
                                        });
                                    }}
                                />
                            ) : (
                                <form
                                    onSubmit={handleSubmit}
                                    className="flex gap-3 border-t border-neutral-100 bg-background pt-3 shadow-[0_-12px_24px_rgba(255,255,255,0.85)]"
                                >
                                    <Input
                                        value={input || ""}
                                        onChange={handleInputChange}
                                        placeholder="Describe who you're looking for..."
                                        className="flex-1 h-12 text-base"
                                    />
                                    <Button type="submit" disabled={!input || !input.trim() || isChatLoading} className="h-12 px-6 shrink-0">Send</Button>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
