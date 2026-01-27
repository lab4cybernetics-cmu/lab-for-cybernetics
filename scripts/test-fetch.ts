
import dotenv from "dotenv";
import path from "path";

// Load environment variables manually since we aren't running in Next.js context
const envPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

// Helper to delay import until env vars are loaded
async function testFetch() {
    // Dynamic import ensures process.env is populated before lib/notion.ts reads it
    const { fetchMatchingItems, fetchProjects, fetchPeople, fetchNews } = await import("../lib/notion");

    console.log("--------------------------------------------------");
    console.log("🧪 Testing Database Fetchers");
    console.log("--------------------------------------------------");

    try {
        console.log("\n1. Matching Items:");
        const matching = await fetchMatchingItems();
        console.log(`   ✅ Fetched ${matching.length} items.`);
        if (matching.length > 0) {
            console.log(`   Sample: ${matching[0].name} (${matching[0].userType})`);
        }

        console.log("\n2. PEOPLE Items:");
        const people = await fetchPeople();
        console.log(`   ✅ Fetched ${people.length} items.`);
        if (people.length > 0) {
            console.log(`   Sample: ${people[0].name} (${people[0].role})`);
        }

        console.log("\n3. PROJECTS Items:");
        const projects = await fetchProjects();
        console.log(`   ✅ Fetched ${projects.length} items.`);
        if (projects.length > 0) {
            console.log(`   Sample: ${projects[0].name} [${projects[0].status}]`);
        }

        console.log("\n4. NEWS Items:");
        const news = await fetchNews();
        console.log(`   ✅ Fetched ${news.length} items.`);
        if (news.length > 0) {
            console.log(`   Sample: ${news[0].title} (${news[0].date})`);
        }

    } catch (error) {
        console.error("❌ Error fetching data:", error);
    }
}

testFetch();
