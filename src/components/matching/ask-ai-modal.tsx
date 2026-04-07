"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Check, ChevronsUpDown } from "lucide-react";
import { sendVerificationCode, verifyCode } from "@/app/actions";
import { MatchingItem } from "@/lib/notion-types";
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MatchingRecommendationCard } from "@/components/matching/matching-recommendation-card";
import ReactMarkdown from "react-markdown";

import * as React from "react"
import { cn } from "@/lib/utils"

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
            setMessages([{ id: Date.now().toString(), role: 'assistant', parts: [{ type: 'text', text: `Hello ${verifiedUser.name}! I've reviewed your profile. Here are some collaboration topics I think you might be looking for — click one to get started, or describe what you're looking for in your own words.` }] }]);
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
        // In AI SDK v4, type is 'tool-find_practitioners' etc.
        const toolName = part.type?.replace(/^tool-/, '') ?? '';
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
            <DialogContent className={cn("flex flex-col overflow-hidden transition-all duration-300", step === "chat" ? "sm:max-w-2xl h-[80vh]" : "sm:max-w-md max-h-[90vh]")}>
                {step !== "chat" && (
                    <DialogTitle>
                        {step === "search" && "Find Your Entry"}
                        {step === "confirm" && "Verify Ownership"}
                        {step === "code" && "Verify Ownership"}
                    </DialogTitle>
                )}

                {step !== "chat" && (
                    <DialogDescription>
                        {step === "search" && "Please select your entry to authenticate."}
                        {step === "confirm" && `Is this your entry? We'll send a verification code to ${maskedEmail} to confirm.`}
                        {step === "code" && "Enter the 6-digit code sent to your email."}
                    </DialogDescription>
                )}

                <div className={cn("py-4 flex-1 flex flex-col min-h-0 overflow-hidden", step === "chat" ? "pt-2 pb-0" : "")}>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
                            {error}
                        </div>
                    )}
                    {resendStatus && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-4">
                            {resendStatus}
                        </div>
                    )}

                    {step === "search" && (
                        <div className="flex flex-col gap-4 overflow-hidden">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                <Input
                                    placeholder="Search your name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto max-h-[300px] border rounded-md divide-y divide-neutral-100">
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

                    {step === "confirm" && (
                        <div className="flex justify-end gap-3 mt-4">
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

                    {step === "code" && (
                        <div className="space-y-4">
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
                                Having trouble? Please reach out to the lab at <a href="mailto:lab4cybernetics@andrew.cmu.edu" className="underline hover:text-neutral-600">lab4cybernetics@andrew.cmu.edu</a> for assistance.
                            </p>
                        </div>
                    )}

                    {step === "chat" && (
                        <div className="flex flex-col h-full min-h-0">
                            {/* Chat Header */}
                            <div className="flex items-center justify-between pb-3 mb-4 flex-shrink-0">
                                <div>
                                    <DialogTitle className="text-xl">AI Assistant</DialogTitle>
                                    <p className="text-sm text-neutral-500 mt-1 flex items-center gap-2">
                                        Authenticated as {verifiedUser?.name}
                                        {verifiedUser?.userType && (
                                            <span className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full ${verifiedUser.userType.toLowerCase().includes("scholar") ? "bg-green-100 text-green-800" : verifiedUser.userType.toLowerCase().includes("practitioner") ? "bg-orange-100 text-orange-800" : "bg-neutral-100 text-neutral-600"}`}>
                                                {verifiedUser.userType}
                                            </span>
                                        )}
                                    </p>
                                    {verifiedUser?.keywords && verifiedUser.keywords.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {verifiedUser.keywords.map(kw => (
                                                <span key={kw} className="text-[11px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">{kw}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Messages area */}
                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 min-h-0">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                                        <div className={cn(
                                            "max-w-[85%] rounded-lg p-3 text-sm flex flex-col gap-2",
                                            msg.role === 'user'
                                                ? "bg-blue-600 text-white"
                                                : "bg-neutral-50 border border-neutral-100 text-neutral-900"
                                        )}>
                                            {msg.role === 'user' ? (
                                                <span className="whitespace-pre-wrap">{getMessageText(msg)}</span>
                                            ) : (() => {
                                                // Render parts in order: text segments and tool invocations interleaved
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
                                ))}
                                {/* AI-generated suggestion capsules — shown only before the user sends their first message */}
                                {messages.length === 1 && !isChatLoading && (
                                    <div className="flex items-start">
                                        {suggestionsLoading ? (
                                            <div className="flex items-center gap-2 text-xs text-neutral-400 pl-1">
                                                <Loader2 className="h-3 w-3 animate-spin" /> Analyzing your profile…
                                            </div>
                                        ) : suggestions.length > 0 ? (
                                            <div className="flex flex-col gap-2 w-full max-w-[85%]">
                                                {suggestions.map((s, i) => (
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
                                        ) : null}
                                    </div>
                                )}
                                {isChatLoading && (
                                    <div className="flex items-start">
                                        <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-3">
                                            <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input area */}
                            <form onSubmit={handleSubmit} className="flex gap-3 pt-2 flex-shrink-0">
                                <Input
                                    value={input || ""}
                                    onChange={handleInputChange}
                                    placeholder="Describe who you're looking for..."
                                    className="flex-1 h-12 text-base"
                                />
                                <Button type="submit" disabled={!input || !input.trim() || isChatLoading} className="h-12 px-6">Send</Button>
                            </form>
                        </div>
                    )}

                </div>
            </DialogContent>
        </Dialog>
    );
}
