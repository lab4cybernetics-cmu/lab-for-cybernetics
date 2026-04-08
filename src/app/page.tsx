import { TitleBar } from "@/components/title-bar";
import { fetchPageBlocks, fetchNews } from "@/lib/notion";
import { BlockRenderer } from "@/components/block-renderer";
import { NewsList } from "@/components/news/news-list";
import { DefiningDocuments, type DefiningDoc } from "@/components/defining-documents";
import { SectionWithLinkTooltip } from "@/components/section-link-tooltip";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const revalidate = 60;

export default async function Home() {
  const homePageId = process.env.NOTION_HOME_PAGE_ID;
  const rawBlocks = homePageId ? await fetchPageBlocks(homePageId) : [];
  const blocks = rawBlocks as any[];
  const news = await fetchNews();
  const recentNews = news
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // Split blocks into: [before-defining-docs, defining-docs-section, after-defining-docs]
  let beforeBlocks: any[] = [];
  let definingDocsHeading: any = null;
  let definingDocs: DefiningDoc[] = [];
  let afterBlocks: any[] = [];

  let splitState: "before" | "inside" | "after" = "before";
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];
    const text = (block as any)[block.type]?.rich_text
      ?.map((t: any) => t.plain_text)
      .join("") ?? "";

    if (
      splitState === "before" &&
      block.type === "heading_2" &&
      text.toUpperCase().includes("DEFINING DOCUMENTS")
    ) {
      splitState = "inside";
      definingDocsHeading = block;
      i++;
      continue;
    }

    if (splitState === "inside") {
      if (block.type === "heading_4") {
        const title = block.heading_4.rich_text.map((t: any) => t.plain_text).join("");
        const href = block.heading_4.rich_text.find((t: any) => t.href)?.href || "#";
        let description = "";
        for (let j = i + 1; j < blocks.length; j++) {
          if (blocks[j].type !== "paragraph") break;
          const pText = blocks[j].paragraph.rich_text.map((t: any) => t.plain_text).join("");
          if (!pText.startsWith("NOTE:")) { description = pText; break; }
        }
        if (title) definingDocs.push({ title, href, description });
        i++;
        continue;
      }
      if (block.type === "paragraph") { i++; continue; }
      splitState = "after";
    }

    if (splitState === "before") beforeBlocks.push(block);
    if (splitState === "after") afterBlocks.push(block);
    i++;
  }

  return (
    <>
      <TitleBar title="GUIDE: LABORATORY" subtitle="CYBERNETICS" showFor={true} />
      <div className="pb-[var(--sys-padding)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[var(--sys-padding)] gap-y-0">

        {/* ── Before Defining Documents ── */}
        <SectionWithLinkTooltip docs={definingDocs}>
          <section>
            {beforeBlocks.map((block) => (
              <BlockRenderer key={block.id} block={block} />
            ))}
            {beforeBlocks.length === 0 && (
              <div className="space-y-6">
                <p className="text-lg text-neutral-600">
                  The Laboratory <em>for</em> Cybernetics (Lab4C) at CMU Architecture.
                </p>
              </div>
            )}
          </section>
        </SectionWithLinkTooltip>

        {/* ── Defining Documents: full 3-col width ── */}
        {definingDocsHeading && (
          <div className="col-span-1 md:col-span-3">
            <div className="-mt-[var(--sys-subheading-gap)]">
              <BlockRenderer block={definingDocsHeading} />
            </div>
            <DefiningDocuments docs={definingDocs} />
          </div>
        )}

        {/* ── After Defining Documents ── */}
        {afterBlocks.length > 0 && (
          <SectionWithLinkTooltip docs={definingDocs}>
            <section className="mt-8">
              {afterBlocks.map((block) => (
                <BlockRenderer key={block.id} block={block} />
              ))}
            </section>
          </SectionWithLinkTooltip>
        )}

        {/* ── Recent News ── */}
        {recentNews.length > 0 && (
          <>
            <div className="col-span-1 md:col-span-2">
              <section className="space-y-8 border-t border-neutral-200 pt-12 mt-12">
                <div className="flex justify-between items-end">
                  <h2 className="text-2xl font-medium">Recent News</h2>
                  <Link href="/news">
                    <Button variant="link" className="text-neutral-500 hover:text-brand-dark p-0 h-auto font-normal">
                      View all <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <NewsList items={recentNews} />
              </section>
            </div>
            <div className="col-span-1 hidden md:block" />
          </>
        )}

      </div>
    </div>
  </>
  );
}
