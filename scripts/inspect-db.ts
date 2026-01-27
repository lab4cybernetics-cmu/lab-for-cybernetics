
import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
console.log(`Loading env from: ${envPath}`);
dotenv.config({ path: envPath });

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

async function inspectDatabase(dbName: string, dbId: string | undefined) {
    if (!dbId || dbId.trim() === "") {
        console.log(`⚠️  Skipping ${dbName}: ID is empty`);
        return;
    }

    console.log(`\n🔍 Inspecting ${dbName} (${dbId})...`);

    try {
        const dbResponse = await notion.databases.retrieve({ database_id: dbId });
        const title = (dbResponse as any).title?.[0]?.plain_text || "Untitled";
        console.log(`✅ Metadata Found: "${title}"`);

        // Log Select/Multi-Select Options from Schema
        if (dbResponse.properties) {
            console.log("📋 Schema Options (Select/Multi-Select/Status):");
            Object.entries(dbResponse.properties).forEach(([name, prop]: [string, any]) => {
                if (prop.type === 'select') {
                    console.log(`  - ${name} (select):`, prop.select?.options?.map((o: any) => o.name));
                } else if (prop.type === 'multi_select') {
                    console.log(`  - ${name} (multi_select):`, prop.multi_select?.options?.map((o: any) => o.name));
                } else if (prop.type === 'status') {
                    console.log(`  - ${name} (status):`, prop.status?.options?.map((o: any) => o.name));
                }
            });
        }

        let queryId = dbId;
        let useDataSources = false;

        // Check for nested data_source ID (Wiki Database / Collections feature)
        const dataSources = (dbResponse as any).data_sources;
        if (dataSources && Array.isArray(dataSources) && dataSources.length > 0) {
            const innerId = dataSources[0].id;
            console.log(`ℹ️  Detected Data Source ID inside: ${innerId}`);
            queryId = innerId;
            useDataSources = true;
        }

        // Try query with the best ID we have
        let results: any[] = [];
        try {
            if (useDataSources && (notion as any).dataSources) {
                console.log(`   Executing notion.dataSources.query("${queryId}")...`);
                const response = await (notion as any).dataSources.query({
                    data_source_id: queryId,
                    page_size: 1
                });
                results = response.results;
            } else {
                // Fallback for older databases? or if databases.query existed (it doesn't in this version apparently)
                // But if we didn't confirm 'useDataSources', maybe we should try dataSources anyway?
                // Let's just try dataSources if databases is missing
                if (!(notion.databases as any).query && (notion as any).dataSources) {
                    console.log(`   (databases.query missing) Executing notion.dataSources.query("${queryId}")...`);
                    const response = await (notion as any).dataSources.query({
                        data_source_id: queryId,
                        page_size: 1
                    });
                    results = response.results;
                } else {
                    console.log(`   Executing notion.databases.query("${queryId}")...`);
                    const response = await notion.databases.query({ database_id: queryId, page_size: 1 } as any);
                    results = response.results;
                }
            }
        } catch (e: any) {
            console.log(`   ❌ Query failed: ${e.message}`);
            return;
        }

        if (results.length > 0) {
            const item = results[0];
            const properties = item.properties;
            console.log("📋 Properties (Inferred from Page):");
            Object.entries(properties).forEach(([name, prop]: [string, any]) => {
                console.log(`  - "${name}" (${prop.type})`);
                if (prop.type === "select") {
                    console.log(`    Value: ${prop.select?.name || "(Empty)"}`);
                }
                if (prop.type === "multi_select") {
                    const vals = (prop.multi_select || []).map((o: any) => o.name).join(", ");
                    console.log(`    Value: [${vals}]`);
                }
            });
        } else {
            console.log("   ⚠️  Database is empty. Cannot infer schema.");
        }

    } catch (error: any) {
        console.error(`❌ Inspection failed for ${dbName}:`, error.message);
    }
}

async function main() {
    if (!process.env.NOTION_API_KEY) {
        console.error("❌ Error: NOTION_API_KEY is missing in .env.local");
        return;
    }

    console.log("Starting Notion DB Inspection...");

    await inspectDatabase("Matching DB", process.env.NOTION_MATCHING_DB_ID);
    await inspectDatabase("Projects DB", process.env.NOTION_PROJECTS_DB_ID);
    await inspectDatabase("People DB", process.env.NOTION_PEOPLE_DB_ID);
    await inspectDatabase("News DB", process.env.NOTION_NEWS_DB_ID);

    console.log("\n------------------------------------------------");
    console.log("Inspection complete. Use the property names above in your code.");
}

main();
