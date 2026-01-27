
import { Client } from "@notionhq/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const PARENT_ID = "24b526fb-7d8d-801c-8b59-e5c5dcd94411";

async function inspectParent() {
    console.log(`Inspecting Parent Page: ${PARENT_ID}...\n`);

    try {
        const response = await notion.blocks.children.list({ block_id: PARENT_ID });

        response.results.forEach((block: any, index) => {
            const type = block.type;
            let content = "";

            if (block[type] && block[type].rich_text) {
                content = block[type].rich_text.map((t: any) => t.plain_text).join("");
            } else if (type === "child_database") {
                content = `[Database Title: ${block.child_database.title}]`;
            }

            console.log(`${index + 1}. [${type}] ${content}`);
        });

    } catch (error) {
        console.error("Error retrieving parent blocks:", error);
    }
}

inspectParent();
