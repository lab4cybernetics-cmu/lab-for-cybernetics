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

## 🔹 Blue Buttons & Project Titles (`heading_3`)

The `BlockRenderer` repurposes Notion's **Heading 3** blocks to serve as stylized blue UI blocks. This is used for "Defining Documents" buttons and Project Titles in news articles.

### The Mechanism:
When the renderer encounters a `heading_3` block, it checks if any text within the heading contains a hyperlink (`href`).
1. **With a Link**: It renders an interactive blue button (`<a>` tag) with an animated right arrow (`→`) that appears on hover.
2. **Without a Link**: It renders a static blue block (used for displaying project titles in news updates) without the arrow or hover effects.

---

## ⚠️ Special Intercept Logic for Paragraphs ⚠️

The `paragraph` block renderer contains hardcoded logic to **suppress (hide)** specific text strings from rendering on the live website.

### 1. Redundant Text Suppression
Because certain documents (like "Defining a new course...") are now represented by the stylized `heading_3` buttons, the raw paragraph text that immediately follows them in Notion is often redundant. The `BlockRenderer` intercepts and returns `null` for paragraphs starting with specific phrases (e.g., `"Defining a new course entitled Engaging Wicked Challenges"`).

### 2. Admin Notes
There is a hardcoded intercept that hides any paragraph beginning exactly with: `"NOTE: The window for submissions is open between April 1 and April 30"`. This allows lab maintainers to leave administrative backend notes in Notion without them displaying to the public.
