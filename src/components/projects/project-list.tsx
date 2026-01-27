"use client";

import { ProjectItem } from "@/lib/notion-types";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "./project-card";

interface ProjectListProps {
    items: ProjectItem[];
}

export function ProjectList({ items }: ProjectListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string | null>(null);

    // Extract unique types
    const types = useMemo(() => {
        return Array.from(new Set(items.map(i => i.type).filter(Boolean)));
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = filterType ? item.type === filterType : true;

            return matchesSearch && matchesType;
        });
    }, [items, searchQuery, filterType]);

    return (
        <div className="space-y-8">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="w-full md:w-1/3">
                    <Input
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilterType(null)}
                        className={`text-sm px-3 py-1 border transition-colors ${!filterType ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 hover:border-neutral-400"}`}
                    >
                        All
                    </button>
                    {types.map(t => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t === filterType ? null : t)}
                            className={`text-sm px-3 py-1 border transition-colors ${t === filterType ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 hover:border-neutral-400"}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                    <ProjectCard key={item.id} item={item} />
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-20 text-neutral-500">
                    No projects found.
                </div>
            )}
        </div>
    );
}
