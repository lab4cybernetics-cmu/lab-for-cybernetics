# L4C Website - Notion CMS Structure

To use Notion as your CMS (Content Management System), you should organize your workspace to match the website's structure.

We recommend creating a single top-level page called **"L4C Website CMS"** and putting everything inside it. This makes it easy to share with the integration.

## 📂 1. Top-Level Page: "L4C Website CMS"
*   **Permissions:** Share this page (and all sub-pages) with your Internal Integration.

---

## 📄 2. Single Pages (Static Content)
For pages that just have text and images, use a normal Notion Page.

### **A. Home / About**
*   **Page Name:** `Home Content`
*   **Content:**
    *   Mission Statement (Text)
    *   Intro Paragraphs (Text)
    *   (Optional) Hero Image (Cover image of the page)
    *   **Footer Section** (see below)

> **How to update the site footer:**  
> At the bottom of the Home Content page, add a **Heading 4** block with the text `footer` (lowercase). Any paragraphs or text you place *directly below* this heading will be rendered as the global website footer across all pages. The heading itself is not displayed. If this section is missing, the site will fall back to a hardcoded default footer.

### **B. Lab Prize**
*   **Page Name:** `Lab Prize`
*   **Content:**
    *   Description of the prize
    *   Eligibility / Rules
    *   Previous winners (Text list)

### **C. Course Info**
*   **Page Name:** `Cybernetics Course`
*   **Content:**
    *   Syllabus
    *   Schedule
    *   Links to materials

---

## 🗃️ 3. Databases (Dynamic Collections)
For sections that have many items (People, News, Projects), use **Databases**. This allows us to filter, sort, and display them nicely on the website.

### **D. Projects Database**
*   **Name:** `L4C Projects`
*   **Properties (Columns):**
    *   `Name` (Title)
    *   `Slug` (Text) - URL friendly ID (e.g., `re-braiding`)
    *   `Type` (Select): `Symposium`, `Knowledge Graph`, `Resource`
    *   `Description` (Text) - Short summary for the card
    *   `Status` (Select): `Active`, `Archived`
    *   `Cover Image` (Files & Media) - For the grid view
*   **Page Content:** The full details of the project go inside the database page.

### **E. People Database**
*   **Name:** `L4C People`
*   **Properties:**
    *   `Name` (Title)
    *   `Role` (Select): `Director`, `Researcher`, `Fellow`, `Alumni`
    *   `Bio` (Text) - Short bio
    *   `Website` (URL)
    *   `Email` (Email)
    *   `Headshot` (Files OR just use the Page Cover/Icon)

### **F. News / Updates Database**
*   **Name:** `L4C News`
*   **Properties:**
    *   `Title` (Title)
    *   `Date` (Date) - For sorting
    *   `Type` (Select): `Announcement`, `Event`, `Press`
    *   `Summary` (Text)
*   **Page Content:** The full article text.

---

## 🔗 4. The Matching System (Existing)
You already have this.
*   **Database Name:** `Matching`
*   **Properties:** (Confirmed)
    *   `Name`
    *   `Domain` (Rich Text) - Mapped from the "What domain is at the core..." form question.
    *   `Keywords` (Multi-select) - Keywords added by users. Automatically cleaned (hashtags removed, case normalized) by the frontend form and backend integration.
    *   `User Type` (Select) - e.g., Scholar, Practitioner.
    *   `Collaboration Mode` (Select)
    *   `Survey Feedback` (Rich Text) - *Internal Use Only*. Stored in Notion but explicitly omitted from the public matching cards.

### Tag Maintenance
The frontend automatically sanitizes tags (stripping `#` and resolving duplicates) during form submission and fetching.
If manual cleanup of historical data in Notion is ever required, you can run the provided maintenance script:
```bash
node scripts/clean-tags.js
```
This script will scan the Matching database, remove leading `#` symbols, split multi-tags (e.g., `#AIgovernance #AIsafety`), and update Notion automatically.


## Summary of IDs needed
Once you create these, you will need to get the **ID** for each of these items to put in your `.env.local` file:
1.  `NOTION_HOME_PAGE_ID`
2.  `NOTION_PRIZE_PAGE_ID`
3.  `NOTION_COURSE_PAGE_ID`
4.  `NOTION_PROJECTS_DB_ID`
5.  `NOTION_PEOPLE_DB_ID`
6.  `NOTION_NEWS_DB_ID`
7.  `NOTION_MATCHING_DB_ID` (Already have)
