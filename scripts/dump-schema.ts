import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

async function main() {
    const dbId = "2f5526fb-7d8d-807a-898e-000b5108f5e6"; // Inner Data Source ID
    if (!dbId) {
        console.error("Missing NOTION_MATCHING_DB_ID");
        return;
    }

    try {
        console.log(`Inspecting DB: ${dbId}`);
        const response = await notion.databases.retrieve({ database_id: dbId });
        console.log(JSON.stringify(response, null, 2));
    } catch (error) {
        console.error("Error retrieving database:", error);
    }
}

main();
