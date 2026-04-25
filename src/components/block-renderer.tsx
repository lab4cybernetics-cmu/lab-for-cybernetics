
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface BlockRendererProps {
    block: any;
    compact?: boolean;
}

export function BlockRenderer({ block, compact = false }: BlockRendererProps) {
    const type = block.type;
    const value = block[type];

    if (!value) return null;

    switch (type) {
        case "paragraph": {
            const textContent = value.rich_text.map((t: any) => t.plain_text).join("");

            // Suppress body paragraphs that follow Defining Documents buttons
            const suppressedParagraphStarts = [
                "Defining a new course entitled Engaging Wicked Challenges",
                "Defining L4C’s resources",
                "Defining L4C's resources",
                "Defining a prize for Best Design Brief",
                "NOTE: The window for submissions is open between April 1 and April 30",
                "Defining Cybernetics as a rationale for the prize",
                "Defining 'wicked challenges'",
                "Defining ‘wicked challenges’",
                "Designing a public exhibit of materials",
            ];
            if (suppressedParagraphStarts.some(s => textContent.trim().startsWith(s))) {
                return null;
            }
            return (
                <p className={cn(compact ? "mb-1" : "mb-6", "mt-0")}>
                    {value.rich_text.map((t: any, i: number) => (
                        <span key={i} className={cn(t.annotations.bold && "font-bold", t.annotations.italic && "italic", t.annotations.underline && "underline")}>
                            {t.href ? (
                                <a href={t.href} target="_blank" rel="noopener noreferrer" className="text-brand-dark underline decoration-1 hover:text-brand-blue">
                                    {t.plain_text}
                                </a>
                            ) : (
                                t.plain_text
                            )}
                        </span>
                    ))}
                </p>
            );
        }
        case "heading_1":
            return (
                <h1 className="text-sys-subheading font-special-condensed uppercase text-brand-grey tracking-normal leading-none mt-[var(--sys-subheading-gap)] mb-[var(--sys-subheading-gap)]">
                    {value.rich_text.map((t: any) => t.plain_text).join("")}
                </h1>
            );
        case "heading_2":
            return (
                <h2 className="text-sys-subheading font-special-condensed uppercase text-brand-grey tracking-normal leading-none mt-[var(--sys-subheading-gap)] mb-[var(--sys-subheading-gap)]">
                    {value.rich_text.map((t: any) => t.plain_text).join("")}
                </h2>
            );
        case "heading_3": {
            const textContent = value.rich_text.map((t: any) => t.plain_text).join("");
            const targetUrl = value.rich_text.find((t: any) => t.href)?.href;
            if (targetUrl) {
                return (
                    <a href={targetUrl} target="_blank" rel="noopener noreferrer" className="group flex justify-between items-center w-full md:w-[calc(50%-12px)] bg-[#95cee9] px-[20px] py-[14px] mb-[12px] text-brand-dark tracking-normal leading-none font-special-condensed uppercase text-[20px] hover:bg-[#8ac1da] rounded-[6px] hover:rounded-none transition-all duration-300">
                        <span className="pt-0.5">{textContent}</span>
                        <ArrowRight className="ml-4 h-[1.2em] w-[1.2em] shrink-0 transition-transform duration-300 group-hover:-rotate-45" strokeWidth={2.5} />
                    </a>
                );
            }
            return (
                <div className="group flex justify-between items-center w-full md:w-[calc(50%-12px)] bg-[#95cee9] px-[20px] py-[14px] mb-[12px] text-brand-dark tracking-normal leading-none font-special-condensed uppercase text-[20px] rounded-[6px]">
                    <span className="pt-0.5">{textContent}</span>
                </div>
            );
        }
        case "heading_4": {
            const textContent = value.rich_text.map((t: any) => t.plain_text).join("");
            return (
                <h4 className="text-lg font-bold font-sans text-brand-dark mt-6 mb-3">
                    {textContent}
                </h4>
            );
        }
        case "numbered_list_item": {
            return (
                <li className={cn(compact ? "mb-1" : "mb-3", "ml-6 list-decimal")}>
                    {value.rich_text.map((t: any, i: number) => (
                        <span key={i} className={cn(t.annotations.bold && "font-bold", t.annotations.italic && "italic", t.annotations.underline && "underline")}>
                            {t.href ? (
                                <a href={t.href} target="_blank" rel="noopener noreferrer" className="text-brand-dark underline decoration-1 hover:text-brand-blue">
                                    {t.plain_text}
                                </a>
                            ) : (
                                t.plain_text
                            )}
                        </span>
                    ))}
                </li>
            );
        }
        case "bulleted_list_item": {
            return (
                <li className={cn(compact ? "mb-1" : "mb-3", "ml-6 list-disc")}>
                    {value.rich_text.map((t: any, i: number) => (
                        <span key={i} className={cn(t.annotations.bold && "font-bold", t.annotations.italic && "italic", t.annotations.underline && "underline")}>
                            {t.href ? (
                                <a href={t.href} target="_blank" rel="noopener noreferrer" className="text-brand-dark underline decoration-1 hover:text-brand-blue">
                                    {t.plain_text}
                                </a>
                            ) : (
                                t.plain_text
                            )}
                        </span>
                    ))}
                </li>
            );
        }
        case "divider":
            return <hr className={cn(compact ? "my-2" : "my-[var(--sys-subheading-gap)]", "border-neutral-300")} />;
        default:
            console.log("Unsupported block type:", type);
            return null;
    }
}
