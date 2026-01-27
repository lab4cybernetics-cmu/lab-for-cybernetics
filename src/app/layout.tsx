import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <header className="p-6 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex flex-col gap-0 items-start">
            <a href="/" className="group">
              <h1 className="text-base font-normal text-[#1a0dab] group-hover:underline cursor-pointer">Laboratory for Cybernetics</h1>
            </a>
            <h2 className="text-base font-normal text-neutral-900">Carnegie Mellon—Architecture</h2>
          </div>
          <nav className="flex gap-6 text-base font-normal">
            <a href="/matching" className="hover:text-[#1a0dab] hover:underline transition-colors">Matching</a>
            <a href="/projects" className="hover:text-[#1a0dab] hover:underline transition-colors">Projects</a>
            <a href="/people" className="hover:text-[#1a0dab] hover:underline transition-colors">People</a>
            <a href="/news" className="hover:text-[#1a0dab] hover:underline transition-colors">News</a>
            <a href="/course-info" className="hover:text-[#1a0dab] hover:underline transition-colors">Course Info</a>
            <a href="/lab-prize" className="hover:text-[#1a0dab] hover:underline transition-colors">Lab Prize</a>
          </nav>
        </header>
        <main className="px-6 max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
