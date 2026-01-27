
import { fetchNews } from "@/lib/notion";
import { NewsList } from "@/components/news/news-list";

export const revalidate = 60;

export default async function NewsPage() {
    const items = await fetchNews();

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-medium tracking-tight mb-2">News</h1>
                <p className="text-neutral-500 max-w-2xl">
                    Announcements, events, and updates from the lab.
                </p>
            </div>

            <NewsList items={items} />
        </div>
    );
}
