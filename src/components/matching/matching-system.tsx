"use client";

import { MatchingItem } from "@/lib/notion-types";
import { MatchingSelectOptions } from "@/lib/notion";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { MatchingCard } from "./matching-card";
import { Badge } from "@/components/ui/badge";

interface MatchingSystemProps {
    items: MatchingItem[];
    options: MatchingSelectOptions;
}

export function MatchingSystem({ items, options }: MatchingSystemProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState<string | null>(null);

    // Extract unique user types for filter
    const userTypes = useMemo(() => {
        const types = new Set(items.map((i) => i.userType).filter(Boolean));
        return Array.from(types);
    }, [items]);

    // Filter items
    const filteredItems = useMemo(() => {
        return items
            .filter((item) => {
                const matchesSearch =
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.about.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

                const matchesType = selectedType ? item.userType === selectedType : true;

                return matchesSearch && matchesType;
            })
            .sort((a, b) => {
                const dateA = new Date(a.submissionDate || 0).getTime();
                const dateB = new Date(b.submissionDate || 0).getTime();
                return dateB - dateA;
            });
    }, [items, searchQuery, selectedType]);

    return (
        <div className="space-y-8">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="w-full md:w-1/3">
                    <Input
                        placeholder="Search matching database..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedType(null)}
                        className={`text-sm px-3 py-1 border transition-colors ${!selectedType ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 hover:border-neutral-400"}`}
                    >
                        All
                    </button>
                    {userTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type === selectedType ? null : type)}
                            className={`text-sm px-3 py-1 border transition-colors ${type === selectedType ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 hover:border-neutral-400"}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                    <MatchingCard key={item.id} item={item} options={options} />
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-20 text-neutral-500">
                    No matches found.
                </div>
            )}
        </div>
    );
}
