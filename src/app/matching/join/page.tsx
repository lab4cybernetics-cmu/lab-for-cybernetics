
import { MatchingForm } from "@/components/matching/matching-form";
import { fetchMatchingSelectOptions } from "@/lib/notion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Default options from CSV spec (fallback if Notion doesn't have them yet)
const DEFAULT_TIME_COMMITMENTS = [
    "Single meeting for specific questions",
    "2+ conversations but not on-going email exchanges",
    "Mix of live conversation and email follow up",
    "Regular check-ins if possible",
    "as-needed",
];

const DEFAULT_PRACTITIONER_STATUSES = [
    "Still haven't found",
    "All set",
    "Have identified a few sufficient for now",
    "Have identified but need more",
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

    // Merge defaults with Notion options (defaults always included, deduplicated)
    const timeCommitments = [...new Set([...DEFAULT_TIME_COMMITMENTS, ...selectOptions.timeCommitments])];

    const practitionerStatuses = [...new Set([...DEFAULT_PRACTITIONER_STATUSES, ...selectOptions.practitionerStatuses])];

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
