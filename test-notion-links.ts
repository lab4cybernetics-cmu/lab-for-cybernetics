import { Client } from '@notionhq/client';

const notion = new Client({ auth: "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" });

async function main() {
    const response = await notion.blocks.children.list({ block_id: "2f5526fb7d8d8005a152c0fd94aab18c" });
    const blocks = response.results as any[];

    // Collect DefiningDoc hrefs
    const defDocHrefs: string[] = [];
    for (const b of blocks) {
        if (b.type === "heading_4") {
            const href = b.heading_4.rich_text.find((t: any) => t.href)?.href;
            if (href) defDocHrefs.push(href);
        }
    }

    console.log("=== DEFINING DOC HREFS ===");
    defDocHrefs.forEach(h => console.log("  ", h));

    // Now find all links in paragraphs and which sections they belong to
    let section = "BEFORE";
    console.log("\n=== ALL PARAGRAPH LINKS ===");
    for (const b of blocks) {
        if (b.type === "heading_2") {
            const text = b.heading_2.rich_text.map((t: any) => t.plain_text).join("");
            if (text.toUpperCase().includes("DEFINING DOCUMENTS")) section = "DEFINING_DOCS";
            else if (section === "DEFINING_DOCS") section = "AFTER";
            console.log(`\n--- Section: ${section} (${text}) ---`);
        }
        if (b.type === "paragraph") {
            for (const t of b.paragraph.rich_text) {
                if (t.href) {
                    console.log(`  [${section}] "${t.plain_text}" -> ${t.href}`);
                }
            }
        }
    }
}

main().catch(console.error);
