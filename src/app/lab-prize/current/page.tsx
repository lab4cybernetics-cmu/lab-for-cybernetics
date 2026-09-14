import { TitleBar } from "@/components/title-bar";
import { fetchPageBlocks } from "@/lib/notion";
import { BlockRenderer } from "@/components/block-renderer";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { createElement as h } from "react";

export const revalidate = 60;

export default async function CurrentPrizePage() {
  const pageId = process.env.NOTION_PRIZE_CURRENT_PAGE_ID;
  const blocks = pageId ? await fetchPageBlocks(pageId) : [];

return h(
  "div",
  { className: "space-y-0 pb-20" },
  h(TitleBar, {
    title: "CURRENT PRIZE",
    subtitle: "2026",
    description: h(
      Link,
      { href: "/lab-prize", className: "inline-flex items-center gap-1.5 text-[#90cde8] hover:text-white transition-colors" },
      h(ArrowRight, { className: "w-[0.9em] h-[0.9em] rotate-180", strokeWidth: 2.5 }),
      "Back to Pangaro Cybernetics Prize"
      ),
  }),
  h(
    "div",
    { className: "pb-[var(--sys-padding)]" },
    h(
      "section",
      { className: "max-w-3xl" },
      blocks.length > 0
      ? blocks.map((block: any) => h(BlockRenderer, { key: block.id, block: block }))
      : h(
        "div",
        { className: "text-neutral-500 italic mt-8" },
        'Content is empty. Add content to the "Current Prize" page in Notion.'
        )
      )
    )
  );
}
