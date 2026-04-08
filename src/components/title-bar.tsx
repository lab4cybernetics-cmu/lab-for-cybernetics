import React from "react";

interface TitleBarProps {
  title: string;
  description?: React.ReactNode;
  subtitle?: string;
  showFor?: boolean;
}

export function TitleBar({ title, description, subtitle, showFor = false }: TitleBarProps) {
  return (
    <div className="w-screen -ml-[var(--sys-padding)] mt-[var(--sys-padding)] mb-[var(--sys-padding)]">
      <div className="w-full bg-brand-dark py-9 px-[var(--sys-padding)] text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] md:shadow-none hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-shadow duration-300">
        <h2 className="text-sys-heading uppercase tracking-normal font-special-condensed leading-none">
          {title}{showFor && <em className="lowercase text-brand-grey font-special-condensed leading-none px-1">for</em>} {subtitle}
        </h2>
        {description && (
          <div className="text-sys-normal text-brand-tan mt-4 w-full font-sans tracking-normal font-normal leading-snug">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
