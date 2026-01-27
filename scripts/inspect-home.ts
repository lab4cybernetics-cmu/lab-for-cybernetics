
import { Client } from "@notionhq/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const HOME_PAGE_ID = process.env.NOTION_HOME_PAGE_ID;

async function inspectHome() {
    if (!HOME_PAGE_ID) {
        console.error("No NOTION_HOME_PAGE_ID found in .env.local");
        return;
    }

    console.log(`Inspecting Home Page: ${HOME_PAGE_ID}...\n`);

    try {
        const response = await notion.blocks.children.list({ block_id: HOME_PAGE_ID });

        response.results.forEach((block: any, index) => {
            const type = block.type;
            let content = "";

            if (block[type] && block[type].rich_text) {
                content = block[type].rich_text.map((t: any) => t.plain_text).join("");
            } else if (type === "child_database") {
                content = `[Database Title: ${block.child_database.title}]`;
            } else if (type === "heading_1" || type === "heading_2" || type === "heading_3") {
                content = block[type].rich_text.map((t: any) => t.plain_text).join("");
            }

            console.log(`${index + 1}. [${type}] ${content}`);
        });

    } catch (error) {
        console.error("Error retrieving home blocks:", error);
    }
}

inspectHome();
