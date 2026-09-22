/**
 * Content for the Re-Braiding landing page (/re-braiding).
 *
 * This page is intentionally NOT Notion-backed. Per docs/SITE_ARCHITECTURE.md §5,
 * a standalone page is the sanctioned route for new sections; Notion is only needed
 * when the content must be editable by non-developers. Keeping the copy here means
 * no new NOTION_*_DB_ID and no new failure mode on a page that must stay up.
 *
 * To move any of this into Notion later, create the DB, add its ID to .env.local,
 * map a fetch function in src/lib/notion.ts, and swap the import in page.tsx.
 * The shapes below are deliberately flat so that swap is mechanical.
 */

export interface SessionMaterial {
      label: string;
      href?: string;
      pendingNote?: string;
}

export interface Session {
      number: number;
      title: string;
      date: string;
      note: string;
      status: "past" | "upcoming";
      materials: SessionMaterial[];
      materialsPendingNote?: string;
      documentation: SessionMaterial[];
      documentationPendingNote?: string;
      context: SessionMaterial[];
      contextPendingNote?: string;
}

export const SESSIONS: Session[] = [
  {
            number: 1,
            title: "The Split",
            date: "March 25, 2026",
            note: "The 1956 break between the fields",
            status: "past",
            materials: [
              { label: "Video", href: "https://tinyurl.com/Re-Braiding-Documentation" },
              { label: "Transcript (open for comments)", href: "https://tinyurl.com/Re-Braiding-Documentation" },
              { label: "Slides", href: "https://tinyurl.com/Re-Braiding-Documentation" },
              { label: "Zoom chat", href: "https://tinyurl.com/Re-Braiding-Documentation" },
              { label: "AI summary", href: "https://tinyurl.com/Re-Braiding-Documentation" },
                      ],
            documentation: [],
            documentationPendingNote: "Not yet compiled for this session.",
            context: [],
            contextPendingNote: "Not yet compiled for this session.",
  },
  {
            number: 2,
            title: "Representation & Process",
            date: "June 24, 2026",
            note: "With Dr. Richard Lewis",
            status: "past",
            materials: [
              { label: "Video", href: "https://tinyurl.com/Re-Braiding-Documentation" },
              { label: "Transcript (open for comments)", href: "https://tinyurl.com/Re-Braiding-Documentation" },
              { label: "Slides", href: "https://tinyurl.com/Re-Braiding-Documentation" },
              { label: "Zoom chat", href: "https://tinyurl.com/Re-Braiding-Documentation" },
              { label: "AI summary", href: "https://tinyurl.com/Re-Braiding-Documentation" },
                      ],
            documentation: [],
            documentationPendingNote: "Not yet compiled for this session.",
            context: [],
            contextPendingNote: "Not yet compiled for this session.",
  },
  {
            number: 3,
            title: "Learning & Knowing",
            date: "September 30, 2026, 12:00 EDT",
            note: "With Andrew Barto, PhD (2024 ACM A.M. Turing Award) and Peter Cariani, PhD",
            status: "upcoming",
            materials: [],
            materialsPendingNote: "Materials are published here after the session.",
            documentation: [],
            documentationPendingNote: "Not yet compiled for this session.",
            context: [],
            contextPendingNote: "Not yet compiled for this session.",
  },
  ];
export interface Insight {
      question: string;
      sessionNumber: number;
}

export const INSIGHTS: Insight[] = [
  {
            question: "How important was the neural technology of 1956 to \u201cthe split\u201d?",
            sessionNumber: 1,
  },
  {
            question:
                          "Why are \u201ceigenforms\u201d relevant to how Cybernetics approaches the representation of knowing?",
            sessionNumber: 2,
  },
  {
            question:
                          "Newell and Simon called it \u201ccomplex information processing,\u201d not AI. What changed when the name did?",
            sessionNumber: 2,
  },
  ];

export interface ExhibitStrand {
      label: string;
      title: string;
}

export const EXHIBIT_STRANDS: ExhibitStrand[] = [
  { label: "Strand pair 1", title: "Representation & Process" },
  { label: "Strand pair 2", title: "Learning & Knowing" },
  { label: "Strand pair 3", title: "Cognition & Time" },
  { label: "Closing", title: "Wrap-up case" },
  ];

export const MAILING_LISTS = [
  {
            name: "Announcements",
            detail: "Session invites, dates, and news. Low volume.",
  },
  {
            name: "Conversations",
            detail: "Ongoing discussion between sessions, seeded with prompts from each symposium.",
  },
  ];

export const REGISTRATION_FORM_URL = "https://forms.gle/Fstt11ofwMKdLVge8";

export interface Curator {
      name: string;
      email: string;
}

export const CURATORS: Curator[] = [
  { name: "Paul Pangaro, PhD", email: "ppangaro@cmu.edu" },
  { name: "Jill Fain Lehman, PhD", email: "jfl@andrew.cmu.edu" },
  ];

export const NEXT_SESSION = SESSIONS.find((s) => s.status === "upcoming");
