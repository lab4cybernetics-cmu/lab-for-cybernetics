"use client";

import { MatchingItem } from "@/lib/notion-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Mail, Globe, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface MatchingCardProps {
    item: MatchingItem;
}

export function MatchingCard({ item }: MatchingCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Card className="h-full flex flex-col justify-between hover:border-neutral-400 transition-colors cursor-pointer text-left">
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
                <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2">
                    {/* Header Section */}
                    <div className="border-b border-neutral-100 pb-6">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <DialogTitle className="text-3xl font-medium mb-2">{item.name}</DialogTitle>
                                <div className="text-xl text-neutral-500 font-medium">{item.organization}</div>
                            </div>
                            <div className="flex gap-3">
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
            </DialogContent>
        </Dialog>
    );
}
