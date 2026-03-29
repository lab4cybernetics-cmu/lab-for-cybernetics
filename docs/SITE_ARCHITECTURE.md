# Lab4C Website Architecture & Documentation

This document explains how the Laboratory for Cybernetics (Lab4C) website functions, how its data is structured, and how to change its content or code.

## 1. Tech Stack Overview
- **Framework**: Next.js 14 (using the generic App Router configuration).
- **Language**: TypeScript (`.ts` and `.tsx`).
- **Styling**: Tailwind CSS & generic CSS modules.
- **UI Components**: Shadcn UI (built on Radix Primitives). Component library elements are located in `src/components/ui/`.
- **CMS (Backend)**: Notion. The website operates as a "headless" front-end to various Notion databases. Pages and database entries in Notion act as the only source of truth for the site's content.

## 2. Notion CMS & Data Architecture
The site does not have a traditional database (like PostgreSQL or MongoDB) for content. It securely queries Notion using `@notionhq/client` in `src/lib/notion.ts`.

### How Data is Fetched
1. The site uses environment variables (like `NOTION_MATCHING_DB_ID`, `NOTION_PROJECTS_DB_ID`, `NOTION_PEOPLE_DB_ID`, etc.) to locate specific data sources.
2. The `fetch*` functions located in `src/lib/notion.ts` pull down page blocks and database properties. 
3. Helper type-guards extract rich text, titles, URLs, and multi-select tags from Notion's JSON response format into simpler TypeScript objects (e.g., `MatchingItem`).

### Which Notion Databases Power What
- **Home Page**: Controlled by `NOTION_HOME_PAGE_ID`. Fetched via `fetchPageBlocks()`. The site recursively renders blocks on `/`.
- **News**: Powered by the News database. Rendered on `/news` and partially on `/` (recent news).
- **Projects**: Powered by the Projects database. Rendered on `/projects`.
- **People**: Powered by the People database. Rendered on `/people`. 
- **Matching System**: 
  - Submissions from `/matching/join` are sent *to* Notion via `createMatchingItem()`.
  - Display options (like organizations, keywords) are dynamically populated by fetching existing options from the Matching Notion database.

### Block Rendering
The site transforms raw Notion blocks (paragraphs, headings, images, columns) into React elements using the `BlockRenderer` component located at `src/components/block-renderer.tsx`. 

> **Important**: This component contains special intercept logic for rendering buttons based on specific text content in Notion. For a detailed explanation of this mechanism, please read the [Block Renderer Documentation](BLOCK_RENDERER.md).

## 3. Site Routing & Pages
The structure of the `src/app/` directory perfectly dictates the URL paths of the website. 

- `src/app/page.tsx` ➝ Home (`/`)
- `src/app/projects/page.tsx` ➝ Projects (`/projects`)
- `src/app/people/page.tsx` ➝ Team/People (`/people`)
- `src/app/news/page.tsx` ➝ News feeds (`/news`)
- `src/app/course-info/page.tsx` ➝ Course Information (`/course-info`)
- `src/app/lab-prize/page.tsx` ➝ Lab Prize (`/lab-prize`)
- `src/app/matching/` ➝ Routing for the matching directory, application flows, forms.

## 4. Server Actions & Forms
Any action that manipulates data (rather than just reading it) relies on Next.js **Server Actions** located within `src/app/actions.ts`. 

- **Submitting Data**: The matching application form points to the server action `submitMatchingApplication()`. When a user submits this form, Next.js calls that function exclusively on the server, which subsequently transforms the data and pushes a new row into the Matching Notion database.
- **Email Verification Flow**: For editing or verifying applicant information, the site uses Nodemailer to send a one-time verification code directly from the lab's Gmail account to the applicant. The metadata and timestamp for these codes are temporarily pushed to the Notion row to simulate a session/database.

## 5. How to Change Things

### Changing Written Content or Existing Items
You **never** need to touch the code to update text, post news, add people, or change project images.
1. Open the corresponding database or page in the Lab4C Notion Workspace.
2. Edit the blocks, text, or database properties.
3. Because the site fetches this data dynamically (and uses Next.js revalidation rules), the live website will typically reflect your changes automatically within 60 seconds.

### Adding New UI or Pages
If you need to create an entirely new section (e.g., `/events`):
1. **Frontend**: Create a new folder in `src/app/events` and a `page.tsx` file inside it. 
2. **Data**: If the `/events` page should pull from a new Notion database, create a new Notion DB, add its ID to `.env.local` (e.g., `NOTION_EVENTS_DB_ID`), map it in `src/lib/notion.ts`, and call it from your `page.tsx`.

### Changing Global Design/Styles
- **Colors, Fonts, Base Utilities**: Modify `src/app/globals.css`. It controls the core definitions. Tailwind configuration is managed strictly in `.css` (via `@tailwindcss/postcss`) or `tailwind.config.ts`.
- **Component Styling**: Locate the component in `src/components/` (or page in `src/app/`) and edit the `className` attribute which leverages Tailwind CSS rules.
