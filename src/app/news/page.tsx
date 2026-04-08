import { TitleBar } from "@/components/title-bar";
import { fetchNews } from "@/lib/notion";
import { NewsList } from "@/components/news/news-list";

export const revalidate = 60;

export default async function NewsPage() {
    const items = await fetchNews();

    return (
        <div className="pb-20">
            <TitleBar 
                title="NEWS" 
                description="Announcements, events, and updates from the lab." 
            />

            <NewsList items={items} />
        </div>
    );
}
