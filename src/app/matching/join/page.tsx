
import { MatchingForm } from "@/components/matching/matching-form";
import { fetchMatchingSelectOptions } from "@/lib/notion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Default options from CSV spec (fallback if Notion doesn't have them yet)
const DEFAULT_TIME_COMMITMENTS = [
    "1-2 Conversations",
    "2+ conversations without email follow-up",
    "2+ Conversations with email follow-up",
    "as-needed",
];

const DEFAULT_PRACTITIONER_STATUSES = [
    "All set",
    "Set but open to more",
    "Still exploring options",
    "Need suggestions",
];

export default async function MatchingJoinPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string }>;
}) {
    // Next.js 16: searchParams is now a Promise
    const params = await searchParams;

    // Default to Scholar if invalid type provided
    const type = params.type === "Practitioner" ? "Practitioner" : "Scholar";

    // Fetch existing select options from Notion
    const selectOptions = await fetchMatchingSelectOptions();

    // Merge with defaults (use Notion options if available, otherwise defaults)
    const timeCommitments = selectOptions.timeCommitments.length > 0
        ? selectOptions.timeCommitments
        : DEFAULT_TIME_COMMITMENTS;

    const practitionerStatuses = selectOptions.practitionerStatuses.length > 0
        ? selectOptions.practitionerStatuses
        : DEFAULT_PRACTITIONER_STATUSES;

    return (
        <div className="max-w-2xl mx-auto py-8">
            <Link href="/matching">
                <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-neutral-900 text-neutral-500">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Directory
                </Button>
            </Link>

            <MatchingForm
                type={type}
                organizationOptions={selectOptions.organizations}
                keywordOptions={selectOptions.keywords}
                timeCommitmentOptions={timeCommitments}
                practitionerStatusOptions={practitionerStatuses}
            />
        </div>
    );
}
