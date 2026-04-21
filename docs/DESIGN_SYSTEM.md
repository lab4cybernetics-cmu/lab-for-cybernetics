# L4C Website Design System

This document outlines the core design tokens, typography, colors, and layout variables used across the Lab for Cybernetics website. 

The design system is powered by **Tailwind CSS v4** and is officially encoded in the `src/app/globals.css` file via the `@theme inline` directive.

---

## 🎨 Color Palette

The project relies on a minimal, highly legible color palette.

### Brand Colors
| Token Name | Hex Value | Usage |
| :--- | :--- | :--- |
| `brand-dark` | `#323639` | Primary text color (`foreground`), dark divider lines, prominent text elements. |
| `brand-grey` | `#9ba0a5` | Used for subheadings, timestamps, and secondary muted text. |
| `brand-blue` | `#1a0dab` | Used for active links, buttons, and hover states. |
| `brand-tan` | `#f6f4eb` | A soft background color used for secondary sections or callouts. |
| `background` | `#ffffff` | The primary page background. |

*In Tailwind, use these as: `text-brand-dark`, `bg-brand-tan`, `border-brand-grey`, etc.*

---

## 🔤 Typography

The typography system is built around a distinct heading font and standard sans-serif for legibility.

### Font Families
- **Sans (Body):** `Inter` (Standard legible body text).
- **Special Condensed (Headings):** `Special Gothic Condensed`, `Special Gothic Condensed One`. 
  - *Tailwind class:* `font-special-condensed`

### Text Scales
These variables dictate the exact pixel sizes of text across different hierarchy levels. They are available as utility classes in Tailwind (e.g. `text-sys-heading`).

| Token Name | Size | Element Target |
| :--- | :--- | :--- |
| `text-sys-heading` | `36px` | Main page titles (`<h1>`). |
| `text-sys-subheading` | `36px` | Section titles (`<h2>`). Identical to heading size by design. |
| `text-sys-nav` | `20px` | Main navigation menu links. |
| `text-sys-normal` | `16px` | Standard body paragraphs (`<p>`). |
| `text-sys-top-left`| `16px` | Left-aligned utility text (e.g. breadcrumbs or dates). |

---

## 📐 Layout & Spacing

To maintain a consistent vertical and horizontal rhythm, the site uses strict spacing tokens instead of ad-hoc padding/margins.

| CSS Variable | Desktop Value | Mobile Value (<767px) | Purpose |
| :--- | :--- | :--- | :--- |
| `--sys-padding` | `64px` | `32px` | Global page padding. Defines the distance from the browser edge to the content. |
| `--sys-body-width` | `1200px` | `1200px` | Max-width constraint for main reading columns to preserve line-length legibility. |
| `--sys-subheading-gap` | `24px` | `24px` | The exact vertical rhythm spacing between a subheading and the divider rule below/above it. |

*Note: In Tailwind v4, CSS variables can be invoked directly in arbitrary brackets (e.g., `px-[var(--sys-padding)]` or `mt-[var(--sys-subheading-gap)]`).*

---

## 🧩 Component Patterns

### Blue Action Blocks (`heading_3`)
Used for Project Titles and "Defining Document" links.
- **Background:** `#95cee9`
- **Hover Background:** `#8ac1da`
- **Border Radius:** `6px` (becomes `0px` on hover if interactive).
- **Text:** `text-brand-dark`, uppercase, `font-special-condensed`.

### Dividers (`<hr>`)
Horizontal rules across the site should use:
- **Margin:** `my-[var(--sys-subheading-gap)]`
- **Color:** `border-neutral-300` (for page dividers) or `border-neutral-200` (for matching cards).
