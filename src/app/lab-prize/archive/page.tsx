import { TitleBar } from "@/components/title-bar";
import { fetchPageBlocks } from "@/lib/notion";
import { BlockRenderer } from "@/components/block-renderer";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { createElement as h } from "react";

export const revalidate = 60;

function renderBlocks(blocks: any[]) {
  const output: any[] = [];
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];
    if (block.type === "numbered_list_item") {
      const group: any[] = [];
      while (i < blocks.length && blocks[i].type === "numbered_list_item") {
        group.push(blocks[i]);
        i++;
      }
      output.push(
        h(
          "ol",
          { key: block.id, className: "list-none pl-0 mb-6" },
          group.map((b) => h(BlockRenderer, { key: b.id, block: b }))
          )
        );
    } else if (block.type === "bulleted_list_item") {
      const group: any[] = [];
      while (i < blocks.length && blocks[i].type === "bulleted_list_item") {
        group.push(blocks[i]);
        i++;
      }
      output.push(
        h(
          "ul",
          { key: block.id, className: "list-none pl-0 mb-6" },
          group.map((b) => h(BlockRenderer, { key: b.id, block: b }))
          )
        );
    } else {
      output.push(h(BlockRenderer, { key: block.id, block: block }));
      i++;
    }
  }
  return output;
}

export default async function PrizeArchivePage() {
  const pageId = process.env.NOTION_PRIZE_ARCHIVE_PAGE_ID;
  const blocks = pageId ? await fetchPageBlocks(pageId) : [];

return h(
  "div",
  { className: "space-y-0 pb-20" },
  h(TitleBar, {
    title: "PRIZE ARCHIVE",
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
      ? renderBlocks(blocks)
      : h(
        "div",
        { className: "text-neutral-500 italic mt-8" },
        'Content is empty. Add content to the "Prize Archive" page in Notion.'
        )
      )
    )
  );
}
