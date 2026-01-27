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
**Current state:**
- Matching system lives in Notion
- People fill a form → entries appear in Notion gallery view
- Viewers get view-only access, which means they **can't filter or search**
- Domain field is free-text, so we have "HCI", "Human-Computer Interaction", "human computer interaction" all separate

**What Paul wants:**
1. Type-ahead autocomplete for domains (type "system" → see "systems thinking", "system design" from existing entries)
2. Matching suggestions based on domain overlap + collaboration mode
3. System simple enough that future RAs can maintain it

### What We're Building

#### 1. Form with Autocomplete
- User fills out: name, email, user type (practitioner/scholar), domains, collaboration mode, bio
- When typing in domain field, shows existing domains from database as suggestions
- Submits to Notion via API

#### 2. Browse/Search Interface
- Shows all entries in a searchable view
- Can filter by domain, collaboration mode, user type
- Actually works (unlike Notion view-only)

#### 3. Match Suggestions
- Simple algorithm: count shared domains + check if collaboration mode matches
- Show suggested matches when browsing

---

## Open Questions

**Need to figure out:**
- What's the exact Notion database structure for matching? (field names, types)
- Are practitioners and scholars in one database or two?
- What exactly is "collaboration mode"? (remote/in-person? something else?)
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