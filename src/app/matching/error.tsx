"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function MatchingError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Matching Error Boundary caught an error:", error);
    }, [error]);

    return (
        <div className="pb-20 flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Failed to load the Matching System</h2>
            <p className="text-sm text-neutral-500 max-w-md mb-6">
                We couldn't connect to the database to fetch the community members. This might be a temporary network issue.
            </p>
            <Button 
                onClick={() => reset()}
                className="bg-neutral-900 text-white hover:bg-neutral-800"
            >
                Try Again
            </Button>
        </div>
    );
}
