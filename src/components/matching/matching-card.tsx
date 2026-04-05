"use client";

import { MatchingItem } from "@/lib/notion-types";
import { MatchingSelectOptions } from "@/lib/notion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Mail, Globe, Calendar, Clock, Link as LinkIcon, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { VerificationModal } from "./verification-modal";
import { MatchingForm } from "./matching-form";

interface MatchingCardProps {
    item: MatchingItem;
    options: MatchingSelectOptions;
}

export function MatchingCard({ item, options }: MatchingCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [copied, setCopied] = useState(false);

    const elementId = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (window.location.hash === `#${elementId}`) {
                setIsOpen(true);
                // Allow time for rendering before scrolling
                setTimeout(() => {
                    const element = document.getElementById(elementId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            }
        }
    }, [elementId]);

    // Reset editing state when dialog closes
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            // Delay reset slightly to avoid UI flash, or just reset immediately
            setTimeout(() => setIsEditing(false), 300);
            
            // Clean up URL hash if we close the dialog that was opened via hash
            if (typeof window !== 'undefined' && window.location.hash === `#${elementId}`) {
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        } else {
            // Optionally set the hash when opening manually
            if (typeof window !== 'undefined' && window.location.hash !== `#${elementId}`) {
                history.replaceState(null, '', window.location.pathname + window.location.search + `#${elementId}`);
            }
        }
    };

    const handleCopyLink = () => {
        if (typeof window === 'undefined') return;
        const url = `${window.location.origin}${window.location.pathname}#${elementId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Card id={elementId} className="h-full flex flex-col justify-between hover:border-neutral-400 transition-colors cursor-pointer text-left scroll-mt-24">
                    <CardHeader>
                        <div className="flex justify-between items-start gap-2">
                            <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
                            {item.userType && (
                                <Badge
                                    className={`text-[10px] uppercase tracking-wider whitespace-nowrap border-0 shadow-none ${item.userType.toLowerCase().includes("scholar")
                                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                                        : item.userType.toLowerCase().includes("practitioner")
                                            ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                                            : "bg-neutral-100 text-neutral-600"
                                        }`}
                                >
                                    {item.userType}
                                </Badge>
                            )}
                        </div>
                        <div className="text-sm text-neutral-500 font-medium">{item.organization}</div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {item.about && (
                            <div className="text-sm text-neutral-600 line-clamp-3">
                                {item.about}
                            </div>
                        )}

                        {item.domain && (
                            <div className="text-sm">
                                <span className="font-semibold text-neutral-800">Domain: </span>
                                <span className="text-neutral-600">{item.domain}</span>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-2">
                            {item.keywords.map((keyword, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px]">
                                    {keyword}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </DialogTrigger>

            <DialogContent className="sm:max-w-4xl p-8 bg-white rounded-sm border-neutral-200 overflow-hidden max-h-[85vh] flex flex-col">
                {isEditing ? (
                    <div className="h-full overflow-y-auto">
                        <MatchingForm
                            type={item.userType as "Scholar" | "Practitioner"} // Cast assuming valid type from DB or handle fallback
                            organizationOptions={options.organizations}
                            keywordOptions={options.keywords}
                            timeCommitmentOptions={options.timeCommitments}
                            practitionerStatusOptions={options.practitionerStatuses}
                            initialData={item}
                            itemId={item.id}
                            onCancel={() => setIsEditing(false)}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2">
                        {/* Header Section */}
                        <div className="border-b border-neutral-100 pb-6">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <DialogTitle className="text-3xl font-medium mb-2">{item.name}</DialogTitle>
                                    <div className="text-xl text-neutral-500 font-medium">{item.organization}</div>
                                </div>
                                <div className="flex gap-3 items-center">
                                    {item.email && (
                                        <a href={`mailto:${item.email}`} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                                            <Mail size={24} />
                                        </a>
                                    )}
                                    {item.website && (
                                        <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-neutral-900 transition-colors">
                                            <Globe size={24} />
                                        </a>
                                    )}
                                    <button onClick={handleCopyLink} className="text-neutral-400 hover:text-neutral-900 transition-colors" title="Copy profile link">
                                        {copied ? <Check size={24} className="text-green-600" /> : <LinkIcon size={24} />}
                                    </button>

                                    <VerificationModal
                                        itemId={item.id}
                                        email={item.email}
                                        onVerified={() => setIsEditing(true)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-neutral-500 mt-4">
                                {item.userType && (
                                    <Badge
                                        className={`uppercase tracking-wider border-0 shadow-none ${item.userType.toLowerCase().includes("scholar")
                                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                                            : item.userType.toLowerCase().includes("practitioner")
                                                ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                                                : "bg-neutral-100 text-neutral-600"
                                            }`}
                                    >
                                        {item.userType}
                                    </Badge>
                                )}
                                {item.practitionerStatus && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-medium text-neutral-700">Status:</span> {item.practitionerStatus}
                                    </div>
                                )}
                                {item.timeCommitment && (
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={16} />
                                        {item.timeCommitment}
                                    </div>
                                )}
                                {item.submissionDate && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={16} />
                                        {format(new Date(item.submissionDate), "PPP")}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed text-neutral-600">
                            {/* Column 1 */}
                            <div className="space-y-6">
                                {item.about && (
                                    <div>
                                        <h4 className="font-semibold text-neutral-900 mb-2 text-base">About</h4>
                                        <p className="whitespace-pre-wrap">{item.about}</p>
                                    </div>
                                )}
                                {item.domain && (
                                    <div>
                                        <h4 className="font-semibold text-neutral-900 mb-2 text-base">Domain</h4>
                                        <p>{item.domain}</p>
                                    </div>
                                )}
                                {item.committedTo && (
                                    <div>
                                        <h4 className="font-semibold text-neutral-900 mb-2 text-base">Committed To</h4>
                                        <p className="whitespace-pre-wrap">{item.committedTo}</p>
                                    </div>
                                )}
                                {item.keywords.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-neutral-900 mb-2 text-base">Keywords</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {item.keywords.map((k, i) => (
                                                <Badge key={i} variant="secondary">{k}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Column 2 */}
                            <div className="space-y-6">
                                {item.whyImportant && (
                                    <div>
                                        <h4 className="font-semibold text-neutral-900 mb-2 text-base">Why Important</h4>
                                        <p className="whitespace-pre-wrap">{item.whyImportant}</p>
                                    </div>
                                )}
                                {item.whatToConserve && (
                                    <div>
                                        <h4 className="font-semibold text-neutral-900 mb-2 text-base">What to Conserve</h4>
                                        <p className="whitespace-pre-wrap">{item.whatToConserve}</p>
                                    </div>
                                )}
                                {item.effectiveCollaboration && (
                                    <div>
                                        <h4 className="font-semibold text-neutral-900 mb-2 text-base">Effective Collaboration</h4>
                                        <p className="whitespace-pre-wrap">{item.effectiveCollaboration}</p>
                                    </div>
                                )}
                                {item.surveyFeedback && (
                                    <div>
                                        <h4 className="font-semibold text-neutral-900 mb-2 text-base">Survey Feedback</h4>
                                        <p className="whitespace-pre-wrap">{item.surveyFeedback}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
