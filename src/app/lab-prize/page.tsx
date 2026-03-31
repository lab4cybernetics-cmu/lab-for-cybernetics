import { TitleBar } from "@/components/title-bar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LabPrizePage() {
    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6 text-center">
            <div className="w-full self-start text-left"><TitleBar title="LAB PRIZE" description="Coming Soon" /></div>
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
