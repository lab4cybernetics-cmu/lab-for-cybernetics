import { TitleBar } from "@/components/title-bar";
import { fetchPageBlocks } from "@/lib/notion";
import { BlockRenderer } from "@/components/block-renderer";
import { ArrowRight } from "lucide-react";
import { DefiningDocuments, type DefiningDoc } from "@/components/defining-documents";
import { SectionWithLinkTooltip } from "@/components/section-link-tooltip";

export const revalidate = 60;

/**
 * Renders a Notion rich_text array into JSX spans with links preserved.
 * Used for inline content inside the grey title bar.
 */
function RichText({ parts, className }: { parts: any[]; className?: string }) {
    return (
        <span className={className}>
            {parts.map((t: any, i: number) => {
                const content = t.href ? (
                    <a
                        key={i}
                        href={t.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-[#90cde8] underline decoration-1 hover:text-white transition-colors ${t.annotations?.bold ? "font-bold" : ""}`}
                    >
                        {t.plain_text}
                    </a>
                ) : (
                    <span key={i} className={t.annotations?.bold ? "font-bold" : ""}>
                        {t.plain_text}
                    </span>
                );
                return content;
            })}
        </span>
    );
}

/**
 * Extracts linked items from a Notion rich_text array that uses "→ LinkText" pattern.
 */
function extractLinkedItems(richText: any[]): { label: string; href: string; bold: boolean }[] {
    const items: { label: string; href: string; bold: boolean }[] = [];
    for (const t of richText) {
        if (t.href && t.plain_text.trim()) {
            items.push({
                label: t.plain_text.trim(),
                href: t.href,
                bold: t.annotations?.bold || false,
            });
        }
    }
    return items;
}

export default async function CourseInfoPage() {
    const pageId = process.env.NOTION_COURSE_INFO_PAGE_ID;
    const rawBlocks = pageId ? await fetchPageBlocks(pageId) : [];
    const blocks = rawBlocks as any[];

    // Split: everything before first divider → title bar content
    // Everything after first divider → body content
    let titleText = "COURSE INFO";
    let headerParagraphs: any[][] = [];
    let relatedDocLinks: { label: string; href: string; bold: boolean }[] = [];

    // Body content: defining docs extracted separately, rest rendered normally
    let definingDocs: DefiningDoc[] = [];
    let contentBlocks: any[] = [];
    let foundFirstDivider = false;
    let inDefiningDocsSection = false;

    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const type = block.type;

        if (!foundFirstDivider) {
            // Title bar content (before first divider)
            if (type === "heading_3") {
                titleText = block.heading_3.rich_text
                    .map((t: any) => t.plain_text)
                    .join("");
            } else if (type === "paragraph") {
                const plainText = block.paragraph.rich_text
                    .map((t: any) => t.plain_text)
                    .join("");

                if (plainText.includes("→")) {
                    relatedDocLinks = extractLinkedItems(block.paragraph.rich_text);
                } else if (plainText.trim()) {
                    const filteredParts = block.paragraph.rich_text.map((t: any) => ({
                        ...t,
                        plain_text: t.plain_text.replace(/\n?Related Documents$/m, ""),
                    })).filter((t: any) => t.plain_text.trim() || t.href);
                    if (filteredParts.length > 0) {
                        headerParagraphs.push(filteredParts);
                    }
                }
            } else if (type === "divider") {
                foundFirstDivider = true;
            }
        } else {
            // Body content (after first divider)
            if (type === "heading_4") {
                const text = block.heading_4.rich_text
                    .map((t: any) => t.plain_text)
                    .join("");

                if (text.toUpperCase() === "DEFINING DOCUMENTS") {
                    // This is the section label — skip it, start capturing defining docs
                    inDefiningDocsSection = true;
                    continue;
                }

                if (inDefiningDocsSection) {
                    // This heading_4 has a link → it's a defining doc button
                    const href = block.heading_4.rich_text.find((t: any) => t.href)?.href;
                    if (href) {
                        // Look ahead for the description paragraph
                        let description = "";
                        if (i + 1 < blocks.length && blocks[i + 1].type === "paragraph") {
                            description = blocks[i + 1].paragraph.rich_text
                                .map((t: any) => t.plain_text)
                                .join("");
                        }
                        definingDocs.push({ title: text, href, description });
                        continue;
                    } else {
                        // heading_4 without link = end of defining docs section, regular subheading
                        inDefiningDocsSection = false;
                        contentBlocks.push(block);
                        continue;
                    }
                }

                // Regular heading_4 subheading
                contentBlocks.push(block);
            } else if (type === "paragraph" && inDefiningDocsSection) {
                // Description paragraph for a defining doc — already captured via look-ahead, skip
                continue;
            } else {
                if (inDefiningDocsSection && type !== "paragraph") {
                    inDefiningDocsSection = false;
                }
                contentBlocks.push(block);
            }
        }
    }

    // Build description JSX for the title bar
    // headerParagraphs[0] = course info + instructor (left side)
    // headerParagraphs[1] = schedule info (right side)
    const leftInfo = headerParagraphs[0] || [];
    const rightInfo = headerParagraphs[1] || [];

    const descriptionContent = (
        <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {leftInfo.length > 0 && (
                    <div className="md:col-span-2 whitespace-pre-line">
                        <RichText parts={leftInfo} />
                    </div>
                )}
                {rightInfo.length > 0 && (
                    <div className="md:col-span-1 whitespace-pre-line md:text-right shrink-0">
                        <RichText parts={rightInfo} />
                    </div>
                )}
            </div>

            {relatedDocLinks.length > 0 && (
                <div className="mt-4">
                    <div className="text-brand-tan font-medium mb-2">Related Documents</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                        {relatedDocLinks.map((link, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <ArrowRight className="w-[0.9em] h-[0.9em] text-[#90cde8] shrink-0" strokeWidth={2.5} />
                                <a
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-[#90cde8] underline decoration-1 hover:text-white transition-colors ${link.bold ? "font-bold" : ""}`}
                                >
                                    {link.label}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-0 pb-20">
            <TitleBar
                title={titleText}
                description={descriptionContent}
            />

            <div className="py-[var(--sys-padding)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--sys-padding)]">
                    {/* Defining Documents blue button — full width */}
                    {definingDocs.length > 0 && (
                        <div className="col-span-1 md:col-span-3">
                            <DefiningDocuments docs={definingDocs} />
                        </div>
                    )}

                    {/* Body content in 2-column layout with tooltip in 3rd column */}
                    <SectionWithLinkTooltip docs={definingDocs}>
                        <section>
                            {contentBlocks.map((block) => (
                                <BlockRenderer key={block.id} block={block} />
                            ))}
                        </section>
                    </SectionWithLinkTooltip>
                </div>
            </div>
        </div>
    );
}
