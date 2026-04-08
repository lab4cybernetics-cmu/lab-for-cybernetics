"use client";

import { usePathname } from "next/navigation";

export function CoverImage() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  
  return (
    <div className={`w-full h-[397px] relative mb-0 overflow-hidden flex justify-center ${isHome ? "grayscale" : ""}`}>
      <div className="flex h-full min-w-max justify-center">
        {/* Generate enough tiles to seamlessly span ultrawide monitors. 11 tiles ensures the middle item (index 5) is perfectly centered. */}
        {[...Array(11)].map((_, i) => {
            const flipX = i % 2 !== 0;
            const flipY = Math.floor(i / 2) % 2 !== 0;
            const flipClass = [flipX ? "-scale-x-100" : "", flipY ? "-scale-y-100" : ""].filter(Boolean).join(" ");
            return (
              <img
                key={i}
                src="/cover.jpg"
                alt=""
                className={`h-full w-auto shrink-0 object-cover ${flipClass}`}
                aria-hidden="true"
              />
            );
          })}
      </div>
      
      {/* Overlay for magenta tone on non-home pages */}
      {!isHome && (
        <div className="absolute inset-0 bg-[#e0007b] mix-blend-color pointer-events-none opacity-30" />
      )}
    </div>
  );
}
