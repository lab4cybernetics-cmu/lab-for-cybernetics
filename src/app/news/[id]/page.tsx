
import { fetchPageBlocks } from "@/lib/notion";
import { BlockRenderer } from "@/components/block-renderer";
import { fetchNews } from "@/lib/notion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

export const revalidate = 60;

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    const news = await fetchNews();
    return news.map((n) => ({ id: n.id }));
}

export default async function NewsDetailPage({ params }: PageProps) {
    const { id } = await params;
    const blocks = await fetchPageBlocks(id);
    const news = await fetchNews();
    const item = news.find((n) => n.id === id);

    return (
        <div className="max-w-3xl mx-auto py-12 space-y-8">
            <div className="space-y-4">
                <Link href="/news">
                    <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent text-neutral-500 hover:text-brand-dark">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to News
                    </Button>
                </Link>
                {item && (
                    <div>
                        <div className="text-sm font-medium text-neutral-500 mb-2 uppercase tracking-wide">
                            {item.date ? format(new Date(item.date), "MMMM d, yyyy") : ""}
                        </div>
                        <h1 className="text-4xl font-medium leading-tight">
                            {item.title}
                        </h1>
                    </div>
                )}
            </div>

            <article>
                {blocks.map((block) => (
                    <BlockRenderer key={block.id} block={block} />
                ))}
                {blocks.length === 0 && (
                    <div className="text-neutral-500 italic">
                        No content available for this news item.
                    </div>
                )}
            </article>
        </div>
    );
}
