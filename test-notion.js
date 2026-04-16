const { Client } = require("@notionhq/client");
require("dotenv").config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function getBlocks() {
  const pageId = process.env.NOTION_LAB_PRIZE_PAGE_ID;
  const { results } = await notion.blocks.children.list({ block_id: pageId });
  console.log(JSON.stringify(results.map(b => ({
    type: b.type,
    text: b[b.type].rich_text?.map(t => t.plain_text).join("")
  })), null, 2));
}
getBlocks();
