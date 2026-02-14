
import { Client } from "@notionhq/client";
import { MatchingItem, ProjectItem, PeopleItem, NewsItem } from "./notion-types";

if (!process.env.NOTION_API_KEY) {
    throw new Error("Missing NOTION_API_KEY environment variable");
}

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

// Helper to handle Wiki/Data Source IDs or regular DB IDs consistently
async function getQueryId(databaseId: string) {
    try {
        const db = await notion.databases.retrieve({ database_id: databaseId });
        const dataSources = (db as any).data_sources;
        if (dataSources && Array.isArray(dataSources) && dataSources.length > 0) {
            return { id: dataSources[0].id, isDataSource: true };
        }
        return { id: databaseId, isDataSource: false };
    } catch (error) {
        console.error("Error retrieving database metadata:", error);
        return { id: databaseId, isDataSource: false };
    }
}

// -----------------------------------------------------------------------------
// Type Guards & Extraction Helpers
// -----------------------------------------------------------------------------

function getTitle(page: any, propName: string): string {
    const prop = page.properties[propName];
    if (prop && prop.title && prop.title.length > 0) {
        return prop.title[0].plain_text;
    }
    return "";
}

function getRichText(page: any, propName: string): string {
    const prop = page.properties[propName];
    if (prop && prop.rich_text && prop.rich_text.length > 0) {
        return prop.rich_text.map((part: any) => part.plain_text).join("");
    }
    return "";
}

function getSelect(page: any, propName: string): string {
    const prop = page.properties[propName];
    if (prop && prop.select) {
        return prop.select.name;
    }
    return "";
}

function getMultiSelect(page: any, propName: string): string[] {
    const prop = page.properties[propName];
    if (prop && prop.multi_select) {
        return prop.multi_select.map((item: any) => item.name);
    }
    return [];
}

function getDate(page: any, propName: string): string {
    const prop = page.properties[propName];
    if (prop && prop.date) {
        return prop.date.start;
    }
    return "";
}

function getUrl(page: any, propName: string): string {
    const prop = page.properties[propName];
    if (prop && prop.url) {
        return prop.url;
    }
    return "";
}

function getEmail(page: any, propName: string): string {
    const prop = page.properties[propName];
    if (prop && prop.email) {
        return prop.email;
    }
    return "";
}

function getStatus(page: any, propName: string): string {
    const prop = page.properties[propName];
    if (prop && prop.status) {
        return prop.status.name;
    }
    return "";
}

function getFileUrl(page: any, propName: string): string {
    const prop = page.properties[propName];
    if (prop && prop.files && prop.files.length > 0) {
        const file = prop.files[0];
        if (file.type === 'file') return file.file.url;
        if (file.type === 'external') return file.external.url;
    }
    return "";
}


// -----------------------------------------------------------------------------
// Fetchers
// -----------------------------------------------------------------------------

export async function fetchMatchingItems(): Promise<MatchingItem[]> {
    const dbId = process.env.NOTION_MATCHING_DB_ID;
    if (!dbId) return [];

    const { id: queryId, isDataSource } = await getQueryId(dbId);

    let results: any[] = [];
    try {
        if (isDataSource && (notion as any).dataSources) {
            const response = await (notion as any).dataSources.query({ data_source_id: queryId });
            results = response.results;
        } else {
            const response = await (notion.databases as any).query({ database_id: queryId });
            results = response.results;
        }
    } catch (e) {
        console.error("Error fetching matching items:", e);
        return [];
    }

    return results.map((page: any) => ({
        id: page.id,
        name: getTitle(page, "Name"),
        email: getEmail(page, "Email"),
        practitionerStatus: getStatus(page, "Practitioner Status"),
        website: getUrl(page, "Website"),
        domain: getRichText(page, "Domain"),
        surveyFeedback: getRichText(page, "Survey Feedback"),
        whatToConserve: getRichText(page, "What to Conserve"),
        effectiveCollaboration: getRichText(page, "Effective Collaboration"),
        timeCommitment: getSelect(page, "Time Commitment"),
        userType: getSelect(page, "User Type"),
        submissionDate: getDate(page, "Submission Date"),
        committedTo: getRichText(page, "Committed To"),
        keywords: getMultiSelect(page, "Keywords"),
        about: getRichText(page, "About"),
        organization: getSelect(page, "Organization"),
        whyImportant: getRichText(page, "Why Important"),
    }));
}

export interface MatchingSelectOptions {
    organizations: string[];
    keywords: string[];
    timeCommitments: string[];
    practitionerStatuses: string[];
}

export async function fetchMatchingSelectOptions(): Promise<MatchingSelectOptions> {
    const dbId = process.env.NOTION_MATCHING_DB_ID;
    if (!dbId) {
        return { organizations: [], keywords: [], timeCommitments: [], practitionerStatuses: [] };
    }

    const { id: queryId, isDataSource } = await getQueryId(dbId);

    // Collect unique values from existing records
    const organizationsSet = new Set<string>();
    const keywordsSet = new Set<string>();
    const timeCommitmentsSet = new Set<string>();
    const practitionerStatusesSet = new Set<string>();

    try {
        let results: any[] = [];

        if (isDataSource && (notion as any).dataSources) {
            const response = await (notion as any).dataSources.query({ data_source_id: queryId });
            results = response.results;
        } else {
            const response = await (notion.databases as any).query({ database_id: queryId });
            results = response.results;
        }

        // Iterate through all records and collect unique values
        for (const page of results) {
            const props = page.properties;
            if (!props) continue;

            // Keywords (multi_select)
            if (props["Keywords"]?.multi_select) {
                for (const item of props["Keywords"].multi_select) {
                    if (item.name) keywordsSet.add(item.name);
                }
            }

            // Organization (select)
            if (props["Organization"]?.select?.name) {
                organizationsSet.add(props["Organization"].select.name);
            }

            // Time Commitment (select)
            if (props["Time Commitment"]?.select?.name) {
                timeCommitmentsSet.add(props["Time Commitment"].select.name);
            }

            // Practitioner Status (status or select)
            if (props["Practitioner Status"]?.status?.name) {
                practitionerStatusesSet.add(props["Practitioner Status"].status.name);
            } else if (props["Practitioner Status"]?.select?.name) {
                practitionerStatusesSet.add(props["Practitioner Status"].select.name);
            }
        }

        return {
            organizations: Array.from(organizationsSet).sort(),
            keywords: Array.from(keywordsSet).sort(),
            timeCommitments: Array.from(timeCommitmentsSet),
            practitionerStatuses: Array.from(practitionerStatusesSet),
        };
    } catch (e) {
        console.error("Error fetching matching select options:", e);
        return { organizations: [], keywords: [], timeCommitments: [], practitionerStatuses: [] };
    }
}

export async function fetchProjects(): Promise<ProjectItem[]> {
    const dbId = process.env.NOTION_PROJECTS_DB_ID;
    if (!dbId) return [];

    const { id: queryId, isDataSource } = await getQueryId(dbId);

    let results: any[] = [];
    try {
        if (isDataSource && (notion as any).dataSources) {
            const response = await (notion as any).dataSources.query({ data_source_id: queryId });
            results = response.results;
        } else {
            const response = await (notion.databases as any).query({ database_id: queryId });
            results = response.results;
        }
    } catch (e) {
        console.error("Error fetching projects:", e);
        return [];
    }

    return results.map((page: any) => ({
        id: page.id,
        name: getTitle(page, "Name"),
        type: getRichText(page, "Type"),
        description: getRichText(page, "Description"),
        coverImage: getFileUrl(page, "Cover Image"),
        status: getStatus(page, "Status"),
        slug: getRichText(page, "Slug"),
    }));
}

export async function fetchPeople(): Promise<PeopleItem[]> {
    const dbId = process.env.NOTION_PEOPLE_DB_ID;
    if (!dbId) return [];

    const { id: queryId, isDataSource } = await getQueryId(dbId);

    let results: any[] = [];
    try {
        if (isDataSource && (notion as any).dataSources) {
            const response = await (notion as any).dataSources.query({ data_source_id: queryId });
            results = response.results;
        } else {
            const response = await (notion.databases as any).query({ database_id: queryId });
            results = response.results;
        }
    } catch (e) {
        console.error("Error fetching people:", e);
        return [];
    }

    return results.map((page: any) => ({
        id: page.id,
        name: getTitle(page, "Name"),
        bio: getRichText(page, "Bio"),
        website: getUrl(page, "Website"),
        email: getEmail(page, "Email"),
        role: getRichText(page, "Role"),
        headshot: getFileUrl(page, "Headshot"),
    }));
}

export async function fetchNews(): Promise<NewsItem[]> {
    const dbId = process.env.NOTION_NEWS_DB_ID;
    if (!dbId) return [];

    const { id: queryId, isDataSource } = await getQueryId(dbId);

    let results: any[] = [];
    try {
        if (isDataSource && (notion as any).dataSources) {
            const response = await (notion as any).dataSources.query({ data_source_id: queryId });
            results = response.results;
        } else {
            const response = await (notion.databases as any).query({ database_id: queryId });
            results = response.results;
        }
    } catch (e) {
        console.error("Error fetching news:", e);
        return [];
    }

    return results.map((page: any) => ({
        id: page.id,
        title: getTitle(page, "Title"),
        date: getDate(page, "Date"),
        type: getSelect(page, "Type"),
        summary: getRichText(page, "Summary"),
    }));
}

export async function fetchPageBlocks(pageId: string): Promise<any[]> {
    if (!pageId) return [];

    try {
        const response = await notion.blocks.children.list({ block_id: pageId });
        return response.results;
    } catch (e) {
        console.error(`Error fetching blocks for page ${pageId}:`, e);
        return [];
    }
}
// -----------------------------------------------------------------------------
// Mutations
// -----------------------------------------------------------------------------

export async function createMatchingItem(data: Partial<MatchingItem>): Promise<boolean> {
    const dbId = process.env.NOTION_MATCHING_DB_ID;
    if (!dbId) throw new Error("Missing NOTION_MATCHING_DB_ID");

    // Note: For creating pages, we use the original database ID, not the data source ID
    // The data source ID is only for queries in Wiki-style databases

    try {
        await notion.pages.create({
            parent: { database_id: dbId },
            properties: {
                "Name": {
                    title: [{ text: { content: data.name || "Untitled" } }]
                },
                "Email": {
                    email: data.email || null
                },
                "Website": {
                    url: data.website || null
                },
                "User Type": {
                    select: data.userType ? { name: data.userType } : null
                },
                "Domain": {
                    rich_text: [{ text: { content: data.domain || "" } }]
                },
                "About": {
                    rich_text: [{ text: { content: data.about || "" } }]
                },
                "Why Important": {
                    rich_text: [{ text: { content: data.whyImportant || "" } }]
                },
                "Committed To": {
                    rich_text: [{ text: { content: data.committedTo || "" } }]
                },
                "What to Conserve": {
                    rich_text: [{ text: { content: data.whatToConserve || "" } }]
                },
                "Effective Collaboration": {
                    rich_text: [{ text: { content: data.effectiveCollaboration || "" } }]
                },
                "Survey Feedback": {
                    rich_text: [{ text: { content: data.surveyFeedback || "" } }]
                },
                "Organization": {
                    select: data.organization ? { name: data.organization } : null
                },
                "Practitioner Status": {
                    status: data.practitionerStatus ? { name: data.practitionerStatus } : null
                },
                "Time Commitment": {
                    select: data.timeCommitment ? { name: data.timeCommitment } : null
                },
                "Keywords": {
                    multi_select: data.keywords?.map(k => ({ name: k })) || []
                },
                "Submission Date": {
                    date: { start: new Date().toISOString() }
                }
            }
        });
        return true;
    } catch (e) {
        console.error("Error creating matching item:", e);
        return false;
    }
}

export async function updateMatchingItem(id: string, data: Partial<MatchingItem>): Promise<boolean> {
    try {
        const properties: any = {};

        if (data.name) properties["Name"] = { title: [{ text: { content: data.name } }] };
        if (data.email) properties["Email"] = { email: data.email };
        if (data.website) properties["Website"] = { url: data.website };
        if (data.userType) properties["User Type"] = { select: { name: data.userType } };
        if (data.domain) properties["Domain"] = { rich_text: [{ text: { content: data.domain } }] };
        if (data.about) properties["About"] = { rich_text: [{ text: { content: data.about } }] };
        if (data.whyImportant) properties["Why Important"] = { rich_text: [{ text: { content: data.whyImportant } }] };
        if (data.committedTo) properties["Committed To"] = { rich_text: [{ text: { content: data.committedTo } }] };
        if (data.whatToConserve) properties["What to Conserve"] = { rich_text: [{ text: { content: data.whatToConserve } }] };
        if (data.effectiveCollaboration) properties["Effective Collaboration"] = { rich_text: [{ text: { content: data.effectiveCollaboration } }] };
        if (data.surveyFeedback) properties["Survey Feedback"] = { rich_text: [{ text: { content: data.surveyFeedback } }] };
        if (data.organization) properties["Organization"] = { select: { name: data.organization } };
        if (data.practitionerStatus) properties["Practitioner Status"] = { status: { name: data.practitionerStatus } };
        if (data.timeCommitment) properties["Time Commitment"] = { select: { name: data.timeCommitment } };
        if (data.keywords) properties["Keywords"] = { multi_select: data.keywords.map(k => ({ name: k })) };

        await notion.pages.update({
            page_id: id,
            properties: properties
        });
        return true;
    } catch (e) {
        console.error("Error updating matching item:", e);
        return false;
    }
}

export async function storeVerificationCode(id: string, code: string, expiresAt: Date): Promise<boolean> {
    try {
        await notion.pages.update({
            page_id: id,
            properties: {
                "Verification Code": { rich_text: [{ text: { content: code } }] },
                "Code Expires At": { date: { start: expiresAt.toISOString() } },
                // Reset resend count on new code generation, or handled separately?
                // Let's not reset resend count here, maybe we should just increment it when requesting?
                // Actually, logic says max 2 resends. So we need to track resends.
                // But this function is just storing the code.
            }
        });
        return true;
    } catch (e) {
        console.error("Error storing verification code:", e);
        return false;
    }
}

export async function getVerificationData(id: string): Promise<{ code: string; expiresAt: string; resendCount: number; email: string } | null> {
    try {
        const page = await notion.pages.retrieve({ page_id: id });
        return {
            code: getRichText(page, "Verification Code"),
            expiresAt: getDate(page, "Code Expires At"),
            resendCount: (page as any).properties["Resend Count"]?.number || 0,
            email: getEmail(page, "Email")
        };
    } catch (e) {
        console.error("Error fetching verification data:", e);
        return null;
    }
}

export async function incrementResendCount(id: string, currentCount: number): Promise<boolean> {
    try {
        await notion.pages.update({
            page_id: id,
            properties: {
                "Resend Count": { number: currentCount + 1 }
            }
        });
        return true;
    } catch (e) {
        console.error("Error incrementing resend count:", e);
        return false;
    }
}

export async function setResendCount(id: string, count: number): Promise<boolean> {
    try {
        await notion.pages.update({
            page_id: id,
            properties: {
                "Resend Count": { number: count }
            }
        });
        return true;
    } catch (e) {
        console.error("Error setting resend count:", e);
        return false;
    }
}
