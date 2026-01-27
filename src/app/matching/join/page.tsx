
import { MatchingForm } from "@/components/matching/matching-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MatchingJoinPage({
    searchParams,
}: {
    searchParams: { type?: string };
}) {
    // Default to Scholar if invalid type provided, but prefer the exact param
    const type = searchParams.type === "Practitioner" ? "Practitioner" : "Scholar";

    return (
        <div className="max-w-2xl mx-auto py-8">
            <Link href="/matching">
                <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-neutral-900 text-neutral-500">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Directory
                </Button>
            </Link>

            <MatchingForm type={type} />
        </div>
    );
}
