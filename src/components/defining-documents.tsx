"use client";

import { useState, useRef } from "react";

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
                  transition: "width 300ms ease, border-radius 300ms ease, background-color 200ms ease",
                }}
                className="flex justify-between items-center bg-[#95cee9] px-[20px] py-[14px] text-black tracking-normal leading-none text-sys-normal hover:bg-[#8ac1da] overflow-hidden"
              >
                <span className="font-medium whitespace-nowrap">{doc.title}</span>
                <span className="font-sans font-medium ml-4 shrink-0">→</span>
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
