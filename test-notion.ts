// @ts-nocheck

import { Client } from '@notionhq/client';

const notion = new Client({ auth: "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" });

async function main() {
    const response = await notion.blocks.children.list({ block_id: "2f5526fb7d8d8005a152c0fd94aab18c" });
    for (const block of response.results) {
        if (block.type === 'heading_3') {
            console.log("Found h3:", JSON.stringify(block.heading_3.rich_text, null, 2));
        } else if (block.type === 'paragraph') {
            const txt = block.paragraph.rich_text.map(t => t.plain_text).join("");
            if (txt.includes("Engaging Wicked")) {
                console.log("Found p:", JSON.stringify(block.paragraph, null, 2));
            }
        }
    }
}

main().catch(console.error);
