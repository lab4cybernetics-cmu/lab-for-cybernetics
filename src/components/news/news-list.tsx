"use client";

import { NewsItem } from "@/lib/notion-types";
import { NewsCard } from "./news-card";

interface NewsListProps {
    items: NewsItem[];
}

export function NewsList({ items }: NewsListProps) {
    // Sort by date descending
    const sortedItems = [...items].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return (
        <div className="space-y-4 max-w-3xl">
            {sortedItems.map((item) => (
                <NewsCard key={item.id} item={item} />
            ))}

            {items.length === 0 && (
                <div className="text-center py-20 text-neutral-500">
                    No news found.
                </div>
            )}
        </div>
    );
}
