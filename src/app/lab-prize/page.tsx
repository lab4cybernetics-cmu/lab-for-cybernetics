import { TitleBar } from "@/components/title-bar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { createElement as h } from "react";

export const revalidate = 60;

interface PrizeCard {
  title: string;
  href: string;
  description: string;
  items: string[];
}

const PRIZE_CARDS: PrizeCard[] = [
  {
    title: "Current Prize (2026)",
    href: "/lab-prize/current",
    description: "Everything about the active Prize cycle - what it is, who can apply, and how it's judged.",
    items: ["Prize Overview", "Purpose & Intentions", "Eligibility", "Submission Requirements", "Timeline", "Judging Criteria", "Governance", "FAQ"],
  },
  {
    title: "Prize Resources",
    href: "/lab-prize/resources",
    description: "Supporting materials for participants and visitors preparing a submission.",
    items: ["Prize Brief", "Submission Guidelines", "Submission Template", "Frequently Asked Questions", "Cybernetics in a Laboratory Context", "Guide to the Laboratory for Cybernetics"],
  },
  {
    title: "Prize Archive",
    href: "/lab-prize/archive",
    description: "Past Pangaro Cybernetics Prize competitions and winning projects.",
    items: ["2026 Prize Results", "2025 Prize Results"],
  },
  ];

export default function LabPrizeHubPage() {
  return h(
    "div",
    { className: "space-y-0 pb-20" },
    h(TitleBar, {
      title: "PANGARO CYBERNETICS PRIZE",
      description: h(
        "div",
        { className: "space-y-1" },
        h("div", { className: "font-medium" }, "Outstanding Design Proposal"),
        h("div", null, "Increasing human agency through cybernetic design.")
        ),
    }),
    h(
      "div",
      { className: "pb-[var(--sys-padding)]" },
      h(
        "div",
        { className: "grid grid-cols-1 md:grid-cols-3 gap-x-[var(--sys-padding)] gap-y-[var(--sys-padding)]" },
        PRIZE_CARDS.map((card) =>
          h(
            Link,
            { key: card.href, href: card.href, className: "group block h-full" },
            h(
              Card,
              { className: "h-full flex flex-col hover:border-neutral-400 transition-colors" },
              h(
                CardHeader,
                null,
                h(
                  CardTitle,
                  { className: "text-lg leading-tight group-hover:underline decoration-neutral-400 underline-offset-4 decoration-1" },
                  card.title
                  )
                ),
              h(
                CardContent,
                { className: "flex-grow flex flex-col justify-between gap-4" },
                h(
                  "div",
                  null,
                  h("p", { className: "text-sm text-neutral-600 mb-4" }, card.description),
                  h(
                    "ul",
                    { className: "space-y-1.5" },
                    card.items.map((item) =>
                      h(
                        "li",
                        { key: item, className: "text-sm text-neutral-500 flex items-start gap-2" },
                        h("span", { className: "text-neutral-300 mt-1" }, "\u2022"),
                        h("span", null, item)
                        )
                                   )
                    )
                  ),
                h(
                  "div",
                  { className: "flex items-center gap-1.5 text-sm font-medium text-[#4a90ad] group-hover:text-[#2f6d85] transition-colors" },
                  "View",
                  h(ArrowRight, { className: "w-[0.9em] h-[0.9em]", strokeWidth: 2.5 })
                  )
                )
              )
            )
                        )
        )
      )
    );
}
