
import { cn } from "@/lib/utils";

interface BlockRendererProps {
    block: any;
}

export function BlockRenderer({ block }: BlockRendererProps) {
    const type = block.type;
    const value = block[type];

    if (!value) return null;

    switch (type) {
        case "paragraph":
            return (
                <p className="mb-4 text-lg text-neutral-600 leading-relaxed">
                    {value.rich_text.map((t: any, i: number) => (
                        <span key={i} className={cn(t.annotations.bold && "font-bold", t.annotations.italic && "italic", t.annotations.underline && "underline")}>
                            {t.href ? (
                                <a href={t.href} target="_blank" rel="noopener noreferrer" className="text-[#1a0dab] hover:underline">
                                    {t.plain_text}
                                </a>
                            ) : (
                                t.plain_text
                            )}
                        </span>
                    ))}
                </p>
            );
        case "heading_1":
            return (
                <h1 className="text-3xl font-medium mt-8 mb-4">
                    {value.rich_text.map((t: any) => t.plain_text).join("")}
                </h1>
            );
        case "heading_2":
            return (
                <h2 className="text-2xl font-medium mt-8 mb-4">
                    {value.rich_text.map((t: any) => t.plain_text).join("")}
                </h2>
            );
        case "heading_3":
            return (
                <h3 className="text-xl font-medium mt-6 mb-3">
                    {value.rich_text.map((t: any) => t.plain_text).join("")}
                </h3>
            );
        case "divider":
            return <hr className="my-8 border-neutral-200" />;
        default:
            console.log("Unsupported block type:", type);
            return null;
    }
}
