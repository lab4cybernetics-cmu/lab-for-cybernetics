"use client";

import { useState, useRef } from "react";
import { ArrowRight } from "lucide-react";

export interface DefiningDoc {
  title: string;
  href: string;
  description: string;
}

interface DefiningDocumentsProps {
  docs: DefiningDoc[];
}

export function DefiningDocuments({ docs }: DefiningDocumentsProps) {
  const [activeDoc, setActiveDoc] = useState<DefiningDoc | null>(null);
  const [descTopOffset, setDescTopOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleMouseEnter(doc: DefiningDoc, el: HTMLAnchorElement) {
    setActiveDoc(doc);
    if (containerRef.current) {
      const containerTop = containerRef.current.getBoundingClientRect().top;
      const buttonTop = el.getBoundingClientRect().top;
      setDescTopOffset(buttonTop - containerTop);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-[var(--sys-padding)]">

      {/* Buttons: container spans col 1+2 */}
      <div className="col-span-2 flex flex-col">
        {docs.map((doc) => {
          const isActive = activeDoc?.title === doc.title;
          return (
            <div key={doc.title} className="mb-[12px] flex">
              <a
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={(e) => handleMouseEnter(doc, e.currentTarget)}
                onMouseLeave={() => setActiveDoc(null)}
                style={{
                  width: isActive ? "100%" : "calc(50% - calc(var(--sys-padding) / 2))",
                  borderRadius: isActive ? "0px" : "6px",
                  transition: "width 400ms ease, border-radius 400ms ease, background-color 400ms ease",
                }}
                className="group flex justify-between items-center bg-[#95cee9] px-[20px] py-[14px] text-brand-dark tracking-normal leading-none font-special-condensed uppercase text-[20px] hover:bg-[#8ac1da] overflow-hidden"
              >
                <span className="whitespace-nowrap pt-0.5">{doc.title}</span>
                <ArrowRight className="ml-4 h-[1.2em] w-[1.2em] shrink-0 transition-transform duration-400 group-hover:-rotate-45" strokeWidth={2.5} />
              </a>
            </div>
          );
        })}
      </div>

      {/* 3rd column: description pinned to hovered button's top */}
      <div ref={containerRef} className="col-span-1 relative">
        <div
          style={{
            position: "absolute",
            top: descTopOffset,
            left: 0,
            right: 0,
            opacity: activeDoc ? 1 : 0,
            transform: activeDoc ? "translateY(0)" : "translateY(4px)",
            transition: "opacity 250ms ease, transform 250ms ease, top 300ms ease",
          }}
        >
          <p className="text-[12px] font-medium text-neutral-400 uppercase tracking-widest mb-3">
            {activeDoc?.title}
          </p>
          <p className="text-sys-normal leading-snug text-neutral-600">
            {activeDoc?.description}
          </p>
        </div>
      </div>

    </div>
  );
}
