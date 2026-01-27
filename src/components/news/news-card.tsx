
import { NewsItem } from "@/lib/notion-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

import Link from "next/link";

interface NewsCardProps {
    item: NewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
    const formattedDate = item.date ? format(new Date(item.date), "MMMM d, yyyy") : "";

    return (
        <Link href={`/news/${item.id}`} className="group block">
            <Card className="hover:border-neutral-400 transition-colors">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1.5">
                            <div className="text-xs text-neutral-500 font-medium uppercase tracking-wide">
                                {formattedDate}
                            </div>
                            <CardTitle className="text-lg leading-tight group-hover:underline decoration-neutral-400 underline-offset-4 decoration-1">
                                {item.title}
                            </CardTitle>
                        </div>
                        {item.type && (
                            <Badge variant="secondary" className="whitespace-nowrap flex-shrink-0">
                                {item.type}
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent>
                    {item.summary && (
                        <div className="text-sm text-neutral-600">
                            {item.summary}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
