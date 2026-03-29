// @ts-nocheck

import { Client } from '@notionhq/client';

const notion = new Client({ auth: "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" });

async function main() {
    const response = await notion.blocks.children.list({ block_id: "2f5526fb7d8d8005a152c0fd94aab18c" });
    response.results.forEach((block: any, index: number) => {
        const type = block.type;
        const value = block[type];
        if (value && value.rich_text) {
            const text = value.rich_text.map((t: any) => t.plain_text).join("");
            console.log(`[Block ${index}] Type: ${type} | Text: "${text.substring(0, 100)}"`);
        } else {
            console.log(`[Block ${index}] Type: ${type} | Value: (no rich text)`);
        }
    });
}

main().catch(console.error);
