
import { ProjectItem } from "@/lib/notion-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";

import Link from "next/link";

interface ProjectCardProps {
    item: ProjectItem;
}

export function ProjectCard({ item }: ProjectCardProps) {
    return (
        <Link href={`/projects/${item.id}`} className="group block h-full">
            <Card className="h-full flex flex-col hover:border-neutral-400 transition-colors overflow-hidden">
                {item.coverImage && (
                    <div className="relative w-full h-48 bg-neutral-100 border-b border-neutral-200">
                        <Image
                            src={item.coverImage}
                            alt={item.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-lg leading-tight group-hover:underline decoration-neutral-400 underline-offset-4 decoration-1">
                            {item.name}
                        </CardTitle>
                        <Badge variant={item.status === "Completed" ? "outline" : "default"} className="whitespace-nowrap">
                            {item.status}
                        </Badge>
                    </div>
                    <div className="text-sm font-medium text-neutral-500">
                        {item.type}
                    </div>
                </CardHeader>

                <CardContent className="flex-grow">
                    {item.description && (
                        <div className="text-sm text-neutral-600 line-clamp-4">
                            {item.description}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
