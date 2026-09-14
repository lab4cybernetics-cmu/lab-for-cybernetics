import Link from "next/link";
import { createElement as h } from "react";

interface PrizeTabsProps {
  active: "current" | "resources" | "archive";
}

const TABS = [
  { key: "current", label: "Current Prize", href: "/lab-prize/current" },
  { key: "resources", label: "Resources", href: "/lab-prize/resources" },
  { key: "archive", label: "Archive", href: "/lab-prize/archive" },
  ] as const;

export function PrizeTabs({ active }: PrizeTabsProps) {
  return h(
    "div",
    { className: "flex items-center gap-8 border-b border-neutral-300 mb-10" },
    TABS.map((tab) => {
      const isActive = tab.key === active;
      return h(
        Link,
        {
          key: tab.key,
          href: tab.href,
          className: isActive
          ? "text-sys-nav font-special-condensed uppercase pb-3 border-b-2 border-brand-blue text-brand-dark tracking-normal"
            : "text-sys-nav font-special-condensed uppercase pb-3 border-b-2 border-transparent text-brand-grey hover:text-brand-dark transition-colors tracking-normal",
        },
        tab.label
        );
    })
    );
}
