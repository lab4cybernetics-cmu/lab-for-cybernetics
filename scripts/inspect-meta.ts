
import { Client } from "@notionhq/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const dbIds = {
    Matching: process.env.NOTION_MATCHING_DB_ID,
    Projects: process.env.NOTION_PROJECTS_DB_ID,
    People: process.env.NOTION_PEOPLE_DB_ID,
    News: process.env.NOTION_NEWS_DB_ID,
};

async function inspectMeta() {
    console.log("Inspecting Database Metadata...\n");

    for (const [name, id] of Object.entries(dbIds)) {
        if (!id) {
            console.log(`[${name}] No ID configured.`);
            continue;
        }

        try {
            // Using retrieve to get database metadata (title, description)
            const response = await notion.databases.retrieve({ database_id: id });

            // Extract rich text description
            const description = (response as any).description
                ? (response as any).description.map((d: any) => d.plain_text).join("")
                : "No description";

            // Extract title
            const title = (response as any).title
                ? (response as any).title.map((d: any) => d.plain_text).join("")
                : "No title";

            console.log(`[${name}]`);
            console.log(`  Title: "${title}"`);
            console.log(`  Description: "${description}"`);
            console.log(`  Parent:`, (response as any).parent);
            console.log("-----------------------------------");
        } catch (error) {
            console.error(`[${name}] Error retrieving metadata:`, error);
        }
    }
}

inspectMeta();
