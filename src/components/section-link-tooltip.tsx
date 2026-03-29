"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import type { DefiningDoc } from "@/components/defining-documents";

interface SectionWithLinkTooltipProps {
  docs: DefiningDoc[];
  children: ReactNode;
}

export function SectionWithLinkTooltip({ docs, children }: SectionWithLinkTooltipProps) {
  const [activeDoc, setActiveDoc] = useState<DefiningDoc | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tooltipColRef = useRef<HTMLDivElement>(null);
  const [headingOffset, setHeadingOffset] = useState(0);

  // Build a lookup map: normalized href → DefiningDoc
  const docsByHref = useRef(
    new Map(docs.map((d) => [normalizeUrl(d.href), d]))
  ).current;

  // Measure the first heading's offset relative to the content container
  useEffect(() => {
    if (!contentRef.current) return;
    const heading = contentRef.current.querySelector("h1, h2, h3");
    if (heading) {
      const containerRect = contentRef.current.getBoundingClientRect();
      const headingRect = heading.getBoundingClientRect();
      setHeadingOffset(headingRect.top - containerRect.top);
    }
  }, []);

  const handleMouseOver = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;
      const match = docsByHref.get(normalizeUrl(href));
      if (match) setActiveDoc(match);
    },
    [docsByHref]
  );

  const handleMouseOut = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = (e.target as HTMLElement).closest("a");
      if (target) setActiveDoc(null);
    },
    []
  );

  return (
    <>
      {/* Content col-span-2 with event delegation */}
      <div
        ref={contentRef}
        className="col-span-1 md:col-span-2"
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        {children}
      </div>

      {/* 3rd column: tooltip aligned to section heading, sticky when heading scrolls away */}
      <div ref={tooltipColRef} className="col-span-1 hidden md:block self-stretch">
        {/* Spacer to push the sticky container down to heading level */}
        <div style={{ height: headingOffset }} />
        <div
          className="sticky top-[var(--sys-padding)]"
          style={{
            opacity: activeDoc ? 1 : 0,
            transform: activeDoc ? "translateY(0)" : "translateY(4px)",
            transition: "opacity 250ms ease, transform 250ms ease",
            pointerEvents: "none",
          }}
        >
          {activeDoc && (
            <>
              <p className="text-[12px] font-medium text-neutral-400 uppercase tracking-widest mb-3">
                {activeDoc.title}
              </p>
              <p className="text-sys-normal leading-snug text-neutral-600">
                {activeDoc.description}
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/** Strip trailing slashes and fragments for comparison */
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return (u.origin + u.pathname).replace(/\/$/, "") + u.search;
  } catch {
    return url.replace(/\/$/, "");
  }
}
