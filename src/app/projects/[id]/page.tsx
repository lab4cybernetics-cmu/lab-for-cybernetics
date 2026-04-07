
import { fetchPageBlocks } from "@/lib/notion";
import { BlockRenderer } from "@/components/block-renderer";
import { fetchProjects } from "@/lib/notion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 60;

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    const projects = await fetchProjects();
    return projects.map((p) => ({ id: p.id }));
}

export default async function ProjectDetailPage({ params }: PageProps) {
    const { id } = await params;
    const blocks = await fetchPageBlocks(id);

    return (
        <div className="max-w-3xl mx-auto py-12 space-y-8">
            <Link href="/projects">
                <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent text-neutral-500 hover:text-brand-dark">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Projects
                </Button>
            </Link>

            <article>
                {blocks.map((block) => (
                    <BlockRenderer key={block.id} block={block} />
                ))}
                {blocks.length === 0 && (
                    <div className="text-neutral-500 italic">
                        No content available for this project.
                    </div>
                )}
            </article>
        </div>
    );
}
