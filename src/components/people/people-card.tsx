"use client";

import { PeopleItem } from "@/lib/notion-types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Mail, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

interface PeopleCardProps {
    item: PeopleItem;
}

export function PeopleCard({ item }: PeopleCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Card className="h-full flex flex-col hover:border-neutral-400 transition-colors group overflow-hidden cursor-pointer rounded-sm shadow-sm border-neutral-200">
                    {item.headshot ? (
                        <div className="relative w-full aspect-square bg-neutral-100 border-b border-neutral-200">
                            <Image
                                src={item.headshot}
                                alt={item.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="relative w-full aspect-square bg-neutral-100 border-b border-neutral-200 flex items-center justify-center text-neutral-300">
                            <span className="text-4xl font-light">?</span>
                        </div>
                    )}

                    <CardHeader className="p-3 space-y-1">
                        <CardTitle className="text-base leading-tight group-hover:underline decoration-neutral-400 underline-offset-4 decoration-1">
                            {item.name}
                        </CardTitle>
                        <div className="text-xs font-medium text-neutral-500">
                            {item.role}
                        </div>
                        <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                            {item.email && (
                                <a href={`mailto:${item.email}`} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                                    <Mail size={14} />
                                </a>
                            )}
                            {item.website && (
                                <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-neutral-900 transition-colors">
                                    <Globe size={14} />
                                </a>
                            )}
                        </div>
                    </CardHeader>
                </Card>
            </DialogTrigger>

            <DialogContent className="sm:max-w-4xl p-8 bg-white rounded-sm border-neutral-200 overflow-hidden max-h-[85vh] flex flex-col">
                <div className="flex flex-col md:flex-row gap-8 h-full overflow-hidden">
                    {/* Left Column: Image + Info */}
                    <div className="flex flex-col gap-6 w-full md:w-72 flex-shrink-0">
                        {/* Image */}
                        <div className="relative w-full aspect-square bg-neutral-100 border border-neutral-200 rounded-sm overflow-hidden">
                            {item.headshot ? (
                                <Image
                                    src={item.headshot}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-neutral-300">
                                    <span className="text-6xl font-light">?</span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div>
                            <DialogTitle className="text-2xl font-medium mb-1 leading-tight text-neutral-900">{item.name}</DialogTitle>
                            <div className="text-neutral-500 font-medium text-base mb-3">{item.role}</div>

                            <div className="flex gap-3 text-neutral-400">
                                {item.email && (
                                    <a href={`mailto:${item.email}`} className="hover:text-neutral-900 transition-colors">
                                        <Mail size={20} />
                                    </a>
                                )}
                                {item.website && (
                                    <a href={item.website} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors">
                                        <Globe size={20} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Bio */}
                    <div className="flex-1 overflow-y-auto pr-2 text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap pt-1">
                        {item.bio}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
