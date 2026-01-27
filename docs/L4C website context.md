# L4C Website - Project Context & Handoff
**Date:** January 26, 2025
**Status:** Ready for Initialization
---
## 🚀 The Mission
Build a website for the **Lab for Cybernetics** that serves as:
1.  **A Center:** Home for course info, lab prize, and people.
2.  **A Connector:** Matching system for Practitioners and Scholars.
3.  **A Archive:** Access to the "Cybernetics of Cybernetics" knowledge graph.
## 🛠️ Technical Decisions
### 1. The Stack (AI-Maintenance First)
*   **Framework:** **Next.js 14+ (App Router)** - Modern standard.
*   **Language:** **TypeScript** - Chosen to help future AI tools understand and maintain the code (strict types = better AI context).
*   **Styling:** **Tailwind CSS**.
*   **CMS & Database:** **Notion** (via Notion API).
### 2. Key Features
*   **Notion as CMS:** Paul edits pages/databases in Notion; website fetches and renders them.
*   **Matching System:**
    *   **Architecture:** Custom server-side form (Server Actions).
    *   **Autocomplete:** `Box` -> `Systems...` (fetches distinct domains from Notion).
    *   **Visualization:** **React Force Graph** or D3 to show connections between people/concepts.
*   **Auth (Edit Flow):**
    *   **Magic Links:** User enters email -> gets link -> can edit their entry.
    *   **Service:** **Resend** (Free tier).
---
## 📄 The PRD
### 1. Website Sections
*   **Home/About:** Lab mission.
*   **Lab Prize:** Info page.
*   **Course:** Syllabus/Info.
*   **Projects:**
    *   *Re-Braiding Project* (Symposia).
    *   *Cybernetics of Cybernetics* (Link to Obsidian vault).
    *   *Resources* (Definitions, etc.).
*   **Matching:** The core interactive tool.
*   **News:** Updates.
*   **People:** Team listing.
### 2. Matching System Requirements
**The Problem:** Notion's view-only mode prevents search/filter. Domain entries are messy ("HCI" vs "Human Comp Interaction").
**The Solution:**
1.  **Form:** Type-ahead autocomplete for domains (normalizes data).
2.  **Browse:** Real search/filter interface (by domain, collaboration mode).
3.  **Match:** Suggest "You should talk to..." based on shared domains.
### 3. Open Questions (To Resolve in Code)
*   Exact Notion Database IDs.
*   Standardizing "Collaboration Mode" options.
---
## ✅ Next Steps
1.  Restart workspace in `l4cybernetics` folder.
2.  Run initialization: `npx create-next-app@latest . --use-npm --typescript --tailwind --eslint --app`
3.  Set up `lib/notion.ts` with TypeScript interfaces.