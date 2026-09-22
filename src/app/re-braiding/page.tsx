import type { Metadata } from "next";
import { TitleBar } from "@/components/title-bar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionBlock } from "@/components/rebraiding/action-block";
import { SessionArchive } from "@/components/rebraiding/session-archive";
import { BraidPanel } from "@/components/rebraiding/braid-panel";
import { createElement as h } from "react";
import {
    SESSIONS,
    INSIGHTS,
    EXHIBIT_STRANDS,
    MAILING_LISTS,
    NEXT_SESSION,
    REGISTRATION_FORM_URL,
    CURATORS,
} from "@/lib/rebraiding-data";

export const metadata: Metadata = {
    title: "Re-Braiding Cybernetics & AI \u2014 Laboratory for Cybernetics",
    description:
          "A symposium series bringing Cybernetics and Artificial Intelligence \u2014 two fields that split in 1956 \u2014 back into conversation, building toward a Spring 2027 exhibit at the Posner Center.",
};

function SectionHeading({ children }: { children: React.ReactNode }) {
    return h(
          "h2",
      {
              className:
                        "text-sys-subheading font-special-condensed uppercase text-brand-grey tracking-normal leading-none mt-[var(--sys-subheading-gap)] mb-[var(--sys-subheading-gap)]",
      },
          children
        );
}

function Section({
    heading,
    children,
}: {
    heading: string;
    children: React.ReactNode;
}) {
    return h(
          "section",
      { className: "pt-[var(--sys-padding)] border-t border-neutral-200 first:border-t-0 first:pt-0" },
          h(SectionHeading, {}, heading),
          children
        );
}

export default function ReBraidingPage() {
    return h(
          "div",
      { className: "pb-20" },
          h(TitleBar, {
                  title: "RE-BRAIDING",
                  subtitle: "Cybernetics & Artificial Intelligence",
                  description:
                            "Two fields split in 1956 and largely stopped speaking. This series puts them back in the same room \u2014 and keeps a public record of what they turn out to still share.",
          }),
          h(
                  "div",
            { className: "flex flex-col gap-[var(--sys-padding)]" },

                  h(
                            Section,
                    { heading: "Start here" },
                            h(
                                        "div",
                              { className: "grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[32px]" },
                                        h(
                                                      "div",
                                          { className: "bg-brand-tan rounded-sm p-[24px]" },
                                                      h(
                                                                      "h3",
                                                        { className: "text-[13px] uppercase tracking-widest text-brand-blue font-medium" },
                                                                      "Unspoken continuities"
                                                                    ),
                                                      h(
                                                                      "p",
                                                        { className: "text-[14px] text-neutral-600 leading-snug mt-2 mb-[18px]" },
                                                                      "Questions the sessions actually surfaced \u2014 the things neither field expected to still have in common. This list changes as the series goes on."
                                                                    ),
                                                      h(
                                                                      "ul",
                                                        { className: "flex flex-col" },
                                                                      INSIGHTS.map((insight, i) =>
                                                                                        h(
                                                                                                            "li",
                                                                                          {
                                                                                                                key: insight.question,
                                                                                                                className: `py-[16px] ${i > 0 ? "border-t border-neutral-300" : "pt-0"}`,
                                                                                            },
                                                                                                            h(
                                                                                                                                  "p",
                                                                                                              { className: "text-sys-normal font-medium leading-snug" },
                                                                                                                                  insight.question
                                                                                                                                ),
                                                                                                            h(
                                                                                                                                  "p",
                                                                                                              { className: "text-[13px] text-neutral-600 mt-1" },
                                                                                                                                  `Raised in Symposium #${insight.sessionNumber} \u00b7 `,
                                                                                                                                  h(
                                                                                                                                                          "a",
                                                                                                                                    {
                                                                                                                                                              href: "#archive",
                                                                                                                                                              className: "text-brand-blue underline decoration-1 underline-offset-2",
                                                                                                                                      },
                                                                                                                                                          "go to the recording"
                                                                                                                                                        )
                                                                                                                                )
                                                                                                          )
                                                                                                 )
                                                                    )
                                                    ),
                                        h(
                                                      "div",
                                          {},
                                                      h(
                                                                      "h3",
                                                        { className: "text-[13px] uppercase tracking-widest text-brand-blue font-medium mb-2" },
                                                                      "Take part"
                                                                    ),
                                                      h(
                                                                      "p",
                                                        { className: "text-[14px] text-neutral-600 leading-snug mb-[18px]" },
                                                                      "Two ways in \u2014 join the ongoing conversation, or come to the next session."
                                                                    ),
                                                      h(
                                                                      "div",
                                                        { className: "flex flex-col gap-[16px]" },
                                                                      h(ActionBlock, {
                                                                                        title: "Join the conversation",
                                                                                        href: "#conversation",
                                                                                        tone: "blue",
                                                                                        description:
                                                                                                            "Open discussion between sessions, by email. Everyone welcome \u2014 you do not need to have attended.",
                                                                      }),
                                                                      NEXT_SESSION &&
                                                                        h(ActionBlock, {
                                                                                            title: `Register for Symposium #${NEXT_SESSION.number}`,
                                                                                            href: "#next",
                                                                                            tone: "tan",
                                                                                            description: `\u201c${NEXT_SESSION.title}\u201d \u00b7 ${NEXT_SESSION.date} \u00b7 online and free.`,
                                                                        })
                                                                    )
                                                    )
                                      )
                          ),

                  // ---------- Next session ----------
                  NEXT_SESSION &&
                    h(
                                "section",
                      {
                                    id: "next",
                                    className: "pt-[var(--sys-padding)] border-t border-neutral-200 scroll-mt-[24px]",
                      },
                                h(SectionHeading, {}, "Next session"),
                                h(
                                              "div",
                                  { className: "max-w-[680px]" },
                                              h(
                                                              "p",
                                                { className: "font-special-condensed uppercase text-sys-subheading leading-none" },
                                                              `Symposium #${NEXT_SESSION.number} \u2014 ${NEXT_SESSION.title}`
                                                            ),
                                              h(
                                                              "p",
                                                { className: "text-sys-normal text-neutral-600 leading-snug mt-[16px]" },
                                                              `The third of the strand pairs. ${NEXT_SESSION.date}, online, free. `,
                                                              `${NEXT_SESSION.note}. If you are already on the announcements list, the calendar invite and joining link reach you automatically \u2014 no need to register again.`
                                                            ),
                                              h(
                                                              "div",
                                                { className: "mt-[24px] max-w-[380px]" },
                                                              h(ActionBlock, {
                                                                                title: "Register / get the invite",
                                                                                href: REGISTRATION_FORM_URL,
                                                                                tone: "blue",
                                                                                external: true,
                                                              })
                                                            )
                                            )
                              ),

                  // ---------- Series at a glance ----------
                  h(
                            Section,
                    { heading: "The series at a glance" },
                            h(
                                        "p",
                              { className: "text-sys-normal text-neutral-600 leading-snug max-w-[680px] mb-[24px]" },
                                        "A roughly quarterly series running through Spring 2027. Each session takes one pair of strands \u2014 a place the two fields diverged \u2014 and builds toward the physical exhibit at the Posner Center."
                                      ),
                            h(
                                        "div",
                              { className: "grid grid-cols-1 md:grid-cols-3 gap-[24px]" },
                                        SESSIONS.map((session) =>
                                                      h(
                                                                      "a",
                                                        {
                                                                          key: session.number,
                                                                          href: session.status === "upcoming" ? "#next" : "#archive",
                                                                          className: "group block h-full",
                                                        },
                                                                      h(
                                                                                        Card,
                                                                        { className: "h-full flex flex-col hover:border-neutral-400 transition-colors" },
                                                                                        h(
                                                                                                            CardHeader,
                                                                                          {},
                                                                                                            h(
                                                                                                                                  "div",
                                                                                                              { className: "flex justify-between items-start gap-2" },
                                                                                                                                  h(
                                                                                                                                                          "div",
                                                                                                                                    { className: "text-[12px] uppercase tracking-widest text-brand-grey" },
                                                                                                                                                          `Symposium #${session.number}`
                                                                                                                                                        ),
                                                                                                                                  h(
                                                                                                                                                          Badge,
                                                                                                                                    {
                                                                                                                                                              variant: session.status === "upcoming" ? "default" : "outline",
                                                                                                                                                              className: "whitespace-nowrap",
                                                                                                                                      },
                                                                                                                                                          session.status === "upcoming" ? "Upcoming" : "Past"
                                                                                                                                                        )
                                                                                                                                ),
                                                                                                            h(
                                                                                                                                  CardTitle,
                                                                                                              {
                                                                                                                                      className:
                                                                                                                                                                "font-special-condensed uppercase text-[24px] leading-none pt-1 group-hover:underline decoration-neutral-400 underline-offset-4 decoration-1",
                                                                                                                },
                                                                                                                                  session.title
                                                                                                                                )
                                                                                                          ),
                                                                                        h(
                                                                                                            CardContent,
                                                                                          { className: "flex-grow" },
                                                                                                            h("p", { className: "text-[14px] text-neutral-600 leading-snug" }, session.date),
                                                                                                            h(
                                                                                                                                  "p",
                                                                                                              { className: "text-[14px] text-neutral-600 leading-snug mt-1" },
                                                                                                                                  session.note
                                                                                                                                )
                                                                                                          )
                                                                                      )
                                                                    )
                                                               )
                                      )
                          ),

                  // ---------- Archive ----------
                  h(
                            "section",
                    {
                                id: "archive",
                                className: "pt-[var(--sys-padding)] border-t border-neutral-200 scroll-mt-[24px]",
                    },
                            h(SectionHeading, {}, "Watch, read, revisit"),
                            h(
                                        "p",
                              { className: "text-sys-normal text-neutral-600 leading-snug max-w-[680px] mb-[24px]" },
                                        "Every session is kept in the same shape: the video, a transcript open for comments, the slides, the chat, and a summary. Nothing is behind a login."
                                      ),
                            h(SessionArchive, { sessions: SESSIONS })
                          ),
                  // ---------- Braid assistant ----------
                  h(Section, { heading: "Ask the archive" }, h(BraidPanel, {})),

                  // ---------- Exhibit ----------
                  h(
                            Section,
                    { heading: "Where this is heading" },
                            h(
                                        "p",
                              { className: "text-sys-normal text-neutral-600 leading-snug max-w-[680px] mb-[24px]" },
                                        "The series builds toward a physical exhibit at CMU\u2019s Posner Center for Special Collections in Spring 2027, pairing books from Heinz von Foerster\u2019s (Cybernetics) and Allen Newell\u2019s (AI) collections \u2014 three strand pairs and a closing case."
                                      ),
                            h(
                                        "div",
                              { className: "grid grid-cols-2 lg:grid-cols-4 gap-[16px]" },
                                        EXHIBIT_STRANDS.map((strand) =>
                                                      h(
                                                                      "div",
                                                        {
                                                                          key: strand.title,
                                                                          className: "border border-neutral-200 rounded-sm p-[16px]",
                                                        },
                                                                      h(
                                                                                        "div",
                                                                        { className: "text-[12px] uppercase tracking-widest text-brand-grey" },
                                                                                        strand.label
                                                                                      ),
                                                                      h(
                                                                                        "div",
                                                                        { className: "font-special-condensed uppercase text-[20px] leading-none mt-2" },
                                                                                        strand.title
                                                                                      )
                                                                    )
                                                                      )
                                      )
                          ),

                  // ---------- Conversation ----------
                  h(
                            "section",
                    {
                                id: "conversation",
                                className: "pt-[var(--sys-padding)] border-t border-neutral-200 scroll-mt-[24px]",
                    },
                            h(SectionHeading, {}, "Keep talking between sessions"),
                            h(
                                        "div",
                              { className: "grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-[32px] items-start" },
                                        h(
                                                      "div",
                                          {},
                                                      h(
                                                                      "p",
                                                        { className: "text-sys-normal text-neutral-600 leading-snug max-w-[680px]" },
                                                                      "Most of what the series turns up happens between the sessions, not during them. Two email groups carry it \u2014 one signup form covers both, and you can pick either or both."
                                                                    ),
                                                      h(
                                                                      "dl",
                                                        { className: "mt-[24px] flex flex-col gap-[16px]" },
                                                                      MAILING_LISTS.map((list) =>
                                                                                        h(
                                                                                                            "div",
                                                                                          { key: list.name },
                                                                                                            h(
                                                                                                                                  "dt",
                                                                                                              { className: "font-special-condensed uppercase text-[20px] leading-none" },
                                                                                                                                  list.name
                                                                                                                                ),
                                                                                                            h(
                                                                                                                                  "dd",
                                                                                                              { className: "text-[14px] text-neutral-600 leading-snug mt-1" },
                                                                                                                                  list.detail
                                                                                                                                )
                                                                                                          )
                                                                                                      )
                                                                    )
                                                    ),
                                        h(
                                                      "div",
                                          { className: "w-full" },
                                                      h(ActionBlock, {
                                                                      title: "Sign up for the mailing lists",
                                                                      href: REGISTRATION_FORM_URL,
                                                                      tone: "blue",
                                                                      external: true,
                                                                      description:
                                                                                        "One form. Choose announcements, conversations, or both. Already signed up? You do not need to do it again.",
                                                      })
                                                    )
                                      ),
                            h(
                                        "p",
                              { className: "text-[13px] text-brand-grey leading-snug mt-[var(--sys-padding)]" },
                                        "Questions or critique? Reach the co-curators \u2014 ",
                                        CURATORS.map((c, i) =>
                                                      h(
                                                                      "span",
                                                        { key: c.email },
                                                                      `${c.name} (`,
                                                                      h(
                                                                                        "a",
                                                                        {
                                                                                            href: `mailto:${c.email}`,
                                                                                            className: "text-brand-blue underline decoration-1 underline-offset-2",
                                                                        },
                                                                                        c.email
                                                                                      ),
                                                                      `)${i < CURATORS.length - 1 ? " / " : ""}`
                                                                    )
                                                               ),
                                        "."
                                      ),
                            h(
                                        "p",
                              { className: "text-[13px] text-brand-grey leading-snug mt-[8px]" },
                                        "Re-Braiding is funded by the CMU\u2014Architecture Computational Design Laboratory (CodeLab) and the Posner Center for Special Collections."
                                      )
                          )
                )
        );
}
