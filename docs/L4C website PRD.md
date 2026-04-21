# L4C Website PRD

**Project:** Lab for Cybernetics Website  
**Author:** Narayan  
**Date:** January 26, 2025  

---

## What We're Building

A full website for Lab for Cybernetics using Notion as the CMS and database, with a custom frontend for better user experience.

---

## Technical Approach

**Stack:**
- Frontend: Next.js + Tailwind CSS
- CMS & Database: Notion (we already have Notion Plus)
- Hosting: Vercel free tier
- API: Notion JavaScript SDK

**Why this:**
- Notion handles all content and data storage
- Paul can edit everything in Notion (familiar interface)
- We build a better public-facing interface on top
- Free hosting, simple to maintain

---

## Website Sections

### 1. Home/About
- Overview of the lab
- What we do, mission, etc.
- Pulls from Notion page

### 2. Lab Prize
- Information about the lab prize
- Pulls from Notion page

### 3. Course
- Paul's cybernetics course information
- Pulls from Notion page

### 4. Projects
- **Re-Braiding Project** - AI-Cybernetics symposium series info
- **Cybernetics of Cybernetics** - Link to Obsidian vault (existing knowledge graph)
- **Resources** - Papers, definitions, reading lists
- Pulls from Notion database

### 5. Matching (most complex)
- Practitioner-scholar matching system
- Custom form + browse interface
- See detailed requirements below

### 6. News
- Lab updates, announcements
- Pulls from Notion database

### 7. People
- Lab members, contact info
- Pulls from Notion database

---

## Matching System (Detailed Requirements)

### The Problem
**Previous state:**
- Matching system lives in Notion
- People fill a form → entries appear in Notion gallery view
- Viewers get view-only access, which means they **can't filter or search**
- Domain field is free-text, so we have "HCI", "Human-Computer Interaction", "human computer interaction" all separate
- Keyword tags were messy (users typing leading hashtags, inconsistent spacing, duplicate entries).

### What We Built

#### 1. Form with Intelligent Autocomplete
- User fills out: name, email, user type (practitioner/scholar), domains, collaboration mode, bio
- **Smart Tags:** When entering tags, the system intelligently parses commas and hashtags (converting strings like `#AI #Cybernetics` into clean `AI`, `Cybernetics` tags), normalizes cases, and strips hyphens to prevent duplicate variants.
- Submits seamlessly to Notion via API while enforcing data cleanliness.

#### 2. Browse/Search Interface
- Shows all entries in a highly polished, responsive grid.
- **Card UI:** Cards feature constrained line-clamping (e.g., Domain text limited to 15 lines), a balanced divider line layout, and distinct visual badges. Internal fields (like Survey Feedback) are parsed but explicitly hidden from public view.
- Real-time filtering by search text and user type.

#### 3. Match Suggestions
- Algorithm ranks shared domains + collaboration mode matching.
- Prioritizes cross-role matching by default (Scholars → Practitioners first).

---

## Open Questions

**Resolved:**
- **Notion Schema:** Mapped `Matching` database perfectly. "What domain is at the core..." safely routes to the `Domain` text column, not `About`.
- **Tag Cleanliness:** Implemented `scripts/clean-tags.js` to retroactively repair Notion data and robust API middleware to keep it clean going forward.

**Pending:**
- How should Projects section be structured in Notion?
- What fields do we need for News, People sections?

---

## What's NOT in MVP

- User login/accounts
- Email notifications
- Editing your entry after submission
- Analytics dashboard
- Advanced search across entire site

Can add these later if needed.

---

## Next Steps

1. Get Notion database IDs and schema for matching
2. Plan Notion structure for other sections (Projects, News, People)
3. Set up development environment
4. Build matching system first (most complex part)
5. Build other pages (simpler - pull from Notion and display)
6. Deploy

---

## Notes

- Keep it simple so future RAs can maintain it
- Document everything clearly
- All content managed in Notion - no need to touch code for content updates

Claude