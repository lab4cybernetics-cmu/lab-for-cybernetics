"use client";

import { PeopleItem } from "@/lib/notion-types";
import { PeopleCard } from "./people-card";

interface PeopleListProps {
    items: PeopleItem[];
}

export function PeopleList({ items }: PeopleListProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
                <PeopleCard key={item.id} item={item} />
            ))}

            {items.length === 0 && (
                <div className="text-center col-span-full py-20 text-neutral-500">
                    No people found.
                </div>
            )}
        </div>
    );
}
