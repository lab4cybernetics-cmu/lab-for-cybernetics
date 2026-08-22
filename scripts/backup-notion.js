/**
 * Notion -> JSON backup script for the Lab for Cybernetics website.
 *
 * Pulls every static page and every database (with full page content)
 * that the site depends on, and writes them to backup/notion/ as JSON.
 * Designed to be run on a schedule via GitHub Actions and committed to git,
 * so git history becomes the version history of the backup.
 *
 * Env vars required (same names as the main app's production env on Vercel):
 *   NOTION_API_KEY
 *   NOTION_HOME_PAGE_ID
 *   NOTION_LAB_PRIZE_PAGE_ID
 *   NOTION_COURSE_INFO_PAGE_ID
 *   NOTION_PROJECTS_DB_ID
 *   NOTION_PEOPLE_DB_ID
 *   NOTION_NEWS_DB_ID
 *   NOTION_MATCHING_DB_ID
 */

const { Client } = require("@notionhq/client");
const fs = require("fs");
const path = require("path");

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const OUTPUT_DIR = path.join(__dirname, "..", "backup", "notion");

// ---- Static pages (rendered directly via Block Renderer) ----
const STATIC_PAGES = {
  home: process.env.NOTION_HOME_PAGE_ID,
  "lab-prize": process.env.NOTION_LAB_PRIZE_PAGE_ID,
  course: process.env.NOTION_COURSE_INFO_PAGE_ID,
};

// ---- Databases ----
const DATABASES = {
  projects: process.env.NOTION_PROJECTS_DB_ID,
  people: process.env.NOTION_PEOPLE_DB_ID,
  news: process.env.NOTION_NEWS_DB_ID,
  matching: process.env.NOTION_MATCHING_DB_ID,
};

/**
 * Recursively fetch all blocks for a given block/page id, including
 * children of children (e.g. nested lists, toggles).
 */
async function fetchAllBlocks(blockId) {
  const blocks = [];
  let cursor;

  do {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  for (const block of blocks) {
    if (block.has_children) {
      block.children = await fetchAllBlocks(block.id);
    }
  }

  return blocks;
}

async function backupPage(pageId) {
  const page = await notion.pages.retrieve({ page_id: pageId });
  const blocks = await fetchAllBlocks(pageId);
  return { page, blocks };
}

async function fetchAllDatabaseEntries(dataSourceId) {
  const entries = [];
  let cursor;

  do {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      page_size: 100,
    });
    entries.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  return entries;
}

async function backupDatabase(databaseId) {
  const database = await notion.databases.retrieve({ database_id: databaseId });

  // Notion's API (2025-09+) splits a database into one or more "data sources".
  // Most databases have exactly one; query entries via that data source id.
  const dataSourceId = database.data_sources?.[0]?.id;
  if (!dataSourceId) {
    throw new Error(`No data source found for database ${databaseId}`);
  }

  const rawEntries = await fetchAllDatabaseEntries(dataSourceId);

  const entries = [];
  for (const entry of rawEntries) {
    const blocks = await fetchAllBlocks(entry.id);
    entries.push({ page: entry, blocks });
  }

  return { database, entries };
}

function writeJson(relativePath, data) {
  const fullPath = path.join(OUTPUT_DIR, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Wrote ${relativePath}`);
}

async function main() {
  if (!process.env.NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY is not set");
  }

  const summary = { generatedAt: new Date().toISOString(), pages: {}, databases: {} };

  for (const [name, id] of Object.entries(STATIC_PAGES)) {
    if (!id) {
      console.warn(`Skipping static page "${name}" — no id set in env`);
      continue;
    }
    console.log(`Backing up page: ${name} (${id})`);
    const data = await backupPage(id);
    writeJson(`pages/${name}.json`, data);
    summary.pages[name] = { id, blockCount: data.blocks.length };
  }

  for (const [name, id] of Object.entries(DATABASES)) {
    if (!id) {
      console.warn(`Skipping database "${name}" — no id set in env`);
      continue;
    }
    console.log(`Backing up database: ${name} (${id})`);
    const data = await backupDatabase(id);
    writeJson(`databases/${name}.json`, data);
    summary.databases[name] = { id, entryCount: data.entries.length };
  }

  writeJson("summary.json", summary);
  console.log("Backup complete.");
}

main().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
