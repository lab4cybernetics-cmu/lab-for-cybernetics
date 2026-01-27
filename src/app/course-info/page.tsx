
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CourseInfoPage() {
    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6 text-center">
            <h1 className="text-3xl font-medium">Course Info</h1>
            <p className="text-xl text-neutral-500">Coming Soon</p>
            <div className="pt-4">
                <Link href="/">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Return Home
                    </Button>
                </Link>
            </div>
        </div>
    );
}
