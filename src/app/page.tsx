
import { fetchPageBlocks, fetchNews } from "@/lib/notion";
import { BlockRenderer } from "@/components/block-renderer";
import { NewsList } from "@/components/news/news-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const revalidate = 60;

export default async function Home() {
  const homePageId = process.env.NOTION_HOME_PAGE_ID;
  const blocks = homePageId ? await fetchPageBlocks(homePageId) : [];
  const news = await fetchNews();
  const recentNews = news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

  return (
    <div className="space-y-20 py-12 max-w-3xl">
      <section>
        {blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
        {blocks.length === 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-medium">Welcome</h3>
            <p className="text-lg text-neutral-600">
              The Laboratory for Cybernetics (Lab4C) at CMU Architecture investigates the intersection of cybernetics, design, and wicked challenges.
            </p>
          </div>
        )}
      </section>

      {recentNews.length > 0 && (
        <section className="space-y-8 border-t border-neutral-200 pt-12">
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-medium">Recent News</h2>
            <Link href="/news">
              <Button variant="link" className="text-neutral-500 hover:text-black p-0 h-auto font-normal">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <NewsList items={recentNews} />
        </section>
      )}
    </div>
  );
}
