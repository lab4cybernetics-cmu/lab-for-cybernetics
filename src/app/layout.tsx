import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import { ArrowRight } from "lucide-react";
import "./globals.css";

const inter = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Laboratory for Cybernetics",
  description: "Carnegie Mellon — Architecture",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased text-sys-normal`}>
        <div className="w-full px-[var(--sys-padding)]">
          {/* Header */}
          <header className="pt-[var(--sys-padding)] pb-[32px] flex flex-col md:flex-row justify-between items-end gap-[var(--sys-padding)]">
            <div className="flex flex-col md:flex-row items-end gap-[16px]">
              <div className="flex flex-col items-start leading-tight">
                <a href="/" className="group tracking-tight">
                  <h1 className="text-sys-top-left font-medium text-brand-blue underline decoration-1 cursor-pointer">Laboratory <em>for</em> Cybernetics</h1>
                </a>
                <h2 className="text-sys-top-left font-medium text-neutral-900 mt-0.5 tracking-tight">Carnegie Mellon—Architecture</h2>
              </div>
              <div className="hidden md:block w-[1px] bg-brand-dark self-stretch"></div>
              <div className="flex flex-col items-start leading-tight">
                <div className="text-sys-top-left font-bold text-brand-dark tracking-tight">
                  Paul Pangaro <span className="font-normal text-brand-dark mx-1">|</span> <a href="mailto:ppangaro@cmu.edu" className="font-normal text-brand-blue underline decoration-1">ppangaro@cmu.edu</a>
                </div>
                <div className="text-sys-top-left font-normal text-brand-dark mt-0.5 tracking-tight">Director, Laboratory <em>for</em> Cybernetics</div>
              </div>
            </div>

            {/* Navigation Bar */}
            <nav className="flex flex-wrap justify-start md:justify-end md:text-right gap-[24px] text-sys-nav font-normal pb-0.5 items-end">
              <a href="/news" className="group flex items-center hover:text-[#90cde8] transition-all duration-300">
                <span data-text="News" className="after:content-[attr(data-text)] after:block after:font-medium after:invisible after:h-0 after:overflow-hidden group-hover:font-medium group-hover:underline decoration-1 underline-offset-2 transition-all duration-300">
                  News
                </span>
                <ArrowRight className="w-[0.9em] h-[0.9em] ml-1 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-rotate-45" strokeWidth={2.5} />
              </a>
              <a href="/course-info" className="group flex items-center hover:text-[#90cde8] transition-all duration-300">
                <span data-text="Course" className="after:content-[attr(data-text)] after:block after:font-medium after:invisible after:h-0 after:overflow-hidden group-hover:font-medium group-hover:underline decoration-1 underline-offset-2 transition-all duration-300">
                  Course
                </span>
                <ArrowRight className="w-[0.9em] h-[0.9em] ml-1 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-rotate-45" strokeWidth={2.5} />
              </a>
              <a href="/lab-prize" className="group flex items-center hover:text-[#90cde8] transition-all duration-300">
                <span data-text="Cybernetics Prize" className="after:content-[attr(data-text)] after:block after:font-medium after:invisible after:h-0 after:overflow-hidden group-hover:font-medium group-hover:underline decoration-1 underline-offset-2 transition-all duration-300">
                  Cybernetics Prize
                </span>
                <ArrowRight className="w-[0.9em] h-[0.9em] ml-1 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-rotate-45" strokeWidth={2.5} />
              </a>
              <a href="/projects" className="group flex items-center hover:text-[#90cde8] transition-all duration-300">
                <span data-text="Projects" className="after:content-[attr(data-text)] after:block after:font-medium after:invisible after:h-0 after:overflow-hidden group-hover:font-medium group-hover:underline decoration-1 underline-offset-2 transition-all duration-300">
                  Projects
                </span>
                <ArrowRight className="w-[0.9em] h-[0.9em] ml-1 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-rotate-45" strokeWidth={2.5} />
              </a>
              <a href="/people" className="group flex items-center hover:text-[#90cde8] transition-all duration-300">
                <span data-text="People" className="after:content-[attr(data-text)] after:block after:font-medium after:invisible after:h-0 after:overflow-hidden group-hover:font-medium group-hover:underline decoration-1 underline-offset-2 transition-all duration-300">
                  People
                </span>
                <ArrowRight className="w-[0.9em] h-[0.9em] ml-1 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-rotate-45" strokeWidth={2.5} />
              </a>
              <a href="/matching" className="group flex items-center hover:text-[#90cde8] transition-all duration-300">
                <span data-text="Collaboration" className="after:content-[attr(data-text)] after:block after:font-medium after:invisible after:h-0 after:overflow-hidden group-hover:font-medium group-hover:underline decoration-1 underline-offset-2 transition-all duration-300">
                  Collaboration
                </span>
                <ArrowRight className="w-[0.9em] h-[0.9em] ml-1 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-rotate-45" strokeWidth={2.5} />
              </a>
            </nav>
          </header>
        </div>

        {/* Cover Image (Full Width, synced to Figma height, alternating mirrored horizontal tiles) */}
        <div className="w-full h-[397px] relative mb-0 overflow-hidden flex justify-center">
          <div className="flex h-full min-w-max justify-center">
            {/* Generate enough tiles to seamlessly span ultrawide monitors. 11 tiles ensures the middle item (index 5) is perfectly centered. */}
            {[...Array(11)].map((_, i) => (
              <img
                key={i}
                src="/cover.jpg"
                alt=""
                className={`h-full w-auto shrink-0 object-cover ${(i + 1) % 2 !== 0 ? '-scale-x-100' : ''}`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>

        {/* Pages render their own TitleBars now */}

        <div className="w-full px-[var(--sys-padding)]">
          <main className="pb-20 text-sys-normal tracking-normal leading-[1.12]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
