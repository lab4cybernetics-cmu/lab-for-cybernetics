require("dotenv").config({ path: ".env.local" });
const { Client } = require("@notionhq/client");

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

function normalizeTagForMatch(tag) {
    return tag.toLowerCase().replace(/[-\s_]+/g, "");
}

async function getQueryId(databaseId) {
    try {
        const db = await notion.databases.retrieve({ database_id: databaseId });
        const dataSources = db.data_sources;
        if (dataSources && Array.isArray(dataSources) && dataSources.length > 0) {
            return { id: dataSources[0].id, isDataSource: true };
        }
        return { id: databaseId, isDataSource: false };
    } catch (error) {
        console.error("Error retrieving database metadata:", error);
        return { id: databaseId, isDataSource: false };
    }
}

async function run() {
    const dbId = process.env.NOTION_MATCHING_DB_ID;
    if (!dbId) throw new Error("Missing NOTION_MATCHING_DB_ID");
    
    const { id: queryId, isDataSource } = await getQueryId(dbId);
    console.log("Using query ID:", queryId, "isDataSource:", isDataSource);
    
    let results = [];
    if (isDataSource && notion.dataSources) {
        const response = await notion.dataSources.query({ data_source_id: queryId });
        results = response.results;
    } else {
        const response = await notion.databases.query({ database_id: queryId });
        results = response.results;
    }
    
    console.log(`Found ${results.length} items`);
    
    let updatedCount = 0;
    
    for (const page of results) {
        const props = page.properties;
        if (!props || !props["Keywords"] || !props["Keywords"].multi_select) continue;
        
        const originalTags = props["Keywords"].multi_select.map(item => item.name);
        if (originalTags.length === 0) continue;
        
        let needsUpdate = false;
        const newTags = [];
        
        for (const rawTag of originalTags) {
            // Split by comma or hash
            const parts = rawTag.split(/[,#]+/).map(t => t.trim()).filter(t => t.length > 0);
            
            if (parts.length > 1 || parts[0] !== rawTag) {
                needsUpdate = true;
            }
            
            for (const part of parts) {
                const norm = normalizeTagForMatch(part);
                if (!newTags.some(t => normalizeTagForMatch(t) === norm)) {
                    newTags.push(part);
                } else {
                    needsUpdate = true; // Duplicate found and removed
                }
            }
        }
        
        if (needsUpdate || originalTags.length !== newTags.length) {
            console.log(`Updating page ${page.id}`);
            console.log(`  Old tags:`, originalTags);
            console.log(`  New tags:`, newTags);
            
            try {
                await notion.pages.update({
                    page_id: page.id,
                    properties: {
                        "Keywords": {
                            multi_select: newTags.map(t => ({ name: t }))
                        }
                    }
                });
                updatedCount++;
            } catch (err) {
                console.error(`  Error updating page: ${err.message}`);
            }
        }
    }
    
    console.log(`Done! Updated ${updatedCount} pages.`);
}

run().catch(console.error);
