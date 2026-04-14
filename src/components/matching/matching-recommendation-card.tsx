import { MatchingItem } from "@/lib/notion-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Mail } from "lucide-react";
import { getMatchingProfileTheme } from "@/lib/matching-user-type-theme";
import { cn } from "@/lib/utils";

interface MatchingRecommendationCardProps {
    item: MatchingItem;
    reason: string;
    userKeywords?: string[];
}

const normalizeKw = (kw: string) => kw.replace(/^#+/, "").trim().toLowerCase();

export function MatchingRecommendationCard({ item, reason, userKeywords = [] }: MatchingRecommendationCardProps) {
    const theme = getMatchingProfileTheme(item.userType);

    return (
        <Card
            className={cn(
                "my-4 border transition-colors shadow-sm bg-white overflow-hidden text-left",
                theme.cardBorder
            )}
        >
            <div
                className={cn(
                    "px-4 py-2 flex justify-between items-center text-xs font-semibold",
                    theme.headerBar
                )}
            >
                <span>✨ AI Recommended Match</span>
                <span className="font-normal">{item.userType}</span>
            </div>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                    {item.name}
                    {item.organization && <span className="block text-sm font-normal text-neutral-500 mt-1">{item.organization}</span>}
                </CardTitle>
                <div className="text-sm italic text-neutral-700 bg-neutral-50 p-3 rounded-md border border-neutral-100 mt-2">
                    <span className="font-semibold not-italic block mb-1">Why this is a good match:</span>
                    {reason}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {item.about && (
                    <blockquote className="text-sm text-neutral-600 line-clamp-3 border-l-2 border-neutral-300 pl-3 italic">
                        {item.about}
                    </blockquote>
                )}
                {item.keywords && item.keywords.length > 0 && (() => {
                    const sharedCount = item.keywords.filter(kw =>
                        userKeywords.some(uk => normalizeKw(uk) === normalizeKw(kw))
                    ).length;
                    return (
                        <div className="space-y-1.5">
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {[...item.keywords].sort((a, b) => {
                                    const aShared = userKeywords.some(uk => uk.toLowerCase() === a.toLowerCase());
                                    const bShared = userKeywords.some(uk => uk.toLowerCase() === b.toLowerCase());
                                    return (bShared ? 1 : 0) - (aShared ? 1 : 0);
                                }).slice(0, 5).map(kw => {
                                    const shared = userKeywords.some(uk => normalizeKw(uk) === normalizeKw(kw));
                                    return (
                                        <Badge key={kw} variant="secondary" className={shared
                                            ? "font-medium text-xs bg-neutral-300 text-neutral-800 hover:bg-neutral-400"
                                            : "font-normal text-xs bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                        }>{kw}</Badge>
                                    );
                                })}
                            </div>
                            {sharedCount > 0 && (
                                <p className="text-xs text-neutral-400">{sharedCount} keyword{sharedCount > 1 ? "s" : ""} in common with you</p>
                            )}
                        </div>
                    );
                })()}

                <div className="flex gap-4 pt-4 border-t border-neutral-100">
                    {item.email && (
                        <a href={`mailto:${item.email}`} className="text-sm flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium">
                            <Mail className="h-4 w-4" /> Reach out
                        </a>
                    )}
                    {item.website && (
                        <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-1.5 text-neutral-500 hover:text-neutral-800 font-medium">
                            <ExternalLink className="h-4 w-4" /> Profile
                        </a>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
