import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

async function main() {
    const dbId = process.env.NOTION_MATCHING_DB_ID;
    if (!dbId) {
        console.error("Missing NOTION_MATCHING_DB_ID");
        return;
    }

    // Resolve query ID (handling Data Source logic internally here for simplicity, reusing logic from lib/notion roughly)
    let queryId = dbId;
    let isDataSource = false;

    try {
        const db = await notion.databases.retrieve({ database_id: dbId });
        const dataSources = (db as any).data_sources;
        if (dataSources && Array.isArray(dataSources) && dataSources.length > 0) {
            queryId = dataSources[0].id;
            isDataSource = true;
        }
    } catch (e) {
        // Ignore initial retrieve error, stick to ID
    }

    console.log(`Scanning Data Source/DB: ${queryId}`);

    let results: any[] = [];
    try {
        if (isDataSource) {
            const response = await (notion as any).dataSources.query({ data_source_id: queryId });
            results = response.results;
        } else {
            const response = await notion.databases.query({ database_id: queryId });
            results = response.results;
        }
    } catch (e) {
        console.error("Query failed:", e);
        return;
    }

    // Aggregators for Select/Multi-Select
    const options: Record<string, Set<string>> = {
        "User Type": new Set(),
        "Time Commitment": new Set(),
        "Practitioner Status": new Set(),
        "Organization": new Set(),
        "Keywords": new Set(),
    };

    results.forEach((page: any) => {
        // User Type (Select)
        const userType = page.properties["User Type"]?.select?.name;
        if (userType) options["User Type"].add(userType);

        // Time Commitment (Select)
        const timeCommitment = page.properties["Time Commitment"]?.select?.name;
        if (timeCommitment) options["Time Commitment"].add(timeCommitment);

        // Practitioner Status (Select) - NOTE: In schema/image it says "Select", checks if status or select
        const practStatus = page.properties["Practitioner Status"]?.select?.name || page.properties["Practitioner Status"]?.status?.name;
        if (practStatus) options["Practitioner Status"].add(practStatus);

        // Organization (Select?) - Image says Text, but inspection said Select. Checking both.
        const orgSelect = page.properties["Organization"]?.select?.name;
        if (orgSelect) options["Organization"].add(orgSelect);

        // Keywords (Multi-Select)
        const keywords = page.properties["Keywords"]?.multi_select;
        if (keywords && Array.isArray(keywords)) {
            keywords.forEach((k: any) => options["Keywords"].add(k.name));
        }
    });

    console.log("\n=== DISCOVERED OPTIONS (From Data Scan) ===");
    Object.entries(options).forEach(([key, set]) => {
        console.log(`\nField: ${key}`);
        console.log(JSON.stringify(Array.from(set), null, 2));
    });
}

main();
