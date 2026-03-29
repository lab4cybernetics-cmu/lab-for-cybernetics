# Notion Block Renderer (`block-renderer.tsx`)

This document explains the purpose and functionality of the `BlockRenderer` component located at `src/components/block-renderer.tsx`.

## Core Purpose

The `BlockRenderer` acts as a translation layer between **Notion's raw backend JSON** and Next.js / React components. When the site fetches a page (like the Home Page) from Notion, it receives an array of "blocks" (essentially paragraphs, headings, images, etc.). This component iterates through those blocks and returns identically positioned HTML elements styled with Tailwind CSS.

## How it Works

The component receives a `block` prop and switches on its `type` property (e.g., `paragraph`, `heading_1`).

### Supported Block Types
1. **Headings (`heading_1`, `heading_2`, `heading_3`)**: Rendered using the brand's custom `font-special-condensed` typography, uppercase, and specific margin spacing via the `--text-sys-subheading` design token system.
2. **Dividers (`divider`)**: Rendered as a simple horizontal rule (`<hr>`).
3. **Paragraphs (`paragraph`)**: Iterates over the rich text array parsing text, formatting annotations (bold, italic, underline), and embedded links (`href`).

---

## ⚠️ Special Intercept Logic for Buttons ⚠️

Because Notion's standard API and the Next.js site do not inherently share a "Button" block concept, the `BlockRenderer` employs a **manual text-intercept technique** to render stylized blue buttons on the homepage for specific documents.

### The Mechanism:
Inside the `paragraph` block switch branch, the code defines an array called `manualButtons`. It checks if the plain text of a paragraph **starts with specific predefined phrases** (e.g., `"Defining a new course entitled Engaging Wicked Challenges"`). 

If a match is found:
1. It extracts the underlying hyperlink (`href`) assigned to that text in Notion.
2. Instead of returning a standard `<p>` tag, it **hijacks the render** and returns a fully styled `<a>` tag designed to look like a blue bounding box with a right arrow (`→`).
3. The original lengthy trigger text from Notion is swapped out for a shorter, punchy title defined in the code (e.g., swapped for just `"Engaging Wicked Challenges"`).

### How to add a new Button Document:
If you want to add a *new* defining document link button to the homepage in the future:
1. **In Notion**: Add a new paragraph block containing a specific unique sentence containing your hyperlink.
2. **In Code**: Open `src/components/block-renderer.tsx` and add a new object to the `manualButtons` array mapping your unique sentence (`trigger`) to your desired button text (`title`).

### Hidden Text Logic
There is also a hardcoded intercept that hides any paragraph beginning with exactly: `"NOTE: The window for submissions is open between April 1 and April 30"`. This allows lab maintainers to leave administrative backend notes in Notion without them displaying on the live website.
