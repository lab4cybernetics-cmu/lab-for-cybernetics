
import { fetchMatchingItems, fetchMatchingSelectOptions } from "@/lib/notion";
import { MatchingSystem } from "@/components/matching/matching-system";
import { Button } from "@/components/ui/button";

export const revalidate = 60; // Revalidate every minute

export default async function MatchingPage() {
    const items = await fetchMatchingItems();
    const options = await fetchMatchingSelectOptions();

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col gap-8 border-b border-neutral-200 pb-12">
                <div>
                    <h1 className="text-3xl font-medium tracking-tight mb-4">Matching System</h1>
                    <p className="text-neutral-600 max-w-3xl leading-relaxed text-lg">
                        The Matching System is a curated directory designed to bridge the gap between cybernetics
                        scholarship and practice. It facilitates meaningful connections, enabling scholars to find
                        practitioners for collaboration and practitioners to access theoretical frameworks.
                    </p>
                </div>

                <div className="bg-neutral-50 p-6 rounded-sm border border-neutral-100">
                    <h2 className="text-base font-medium text-neutral-900 mb-2">Join the Network</h2>
                    <p className="text-sm text-neutral-500 max-w-2xl mb-6 leading-relaxed">
                        Become part of a growing community of systems thinkers. Joining allows you to showcase your work,
                        find collaborators, and contribute to the evolving field of cybernetics. Choose your path below:
                    </p>

                    <div className="flex gap-4 flex-wrap">
                        <a href="/matching/join?type=Scholar">
                            <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 bg-transparent">
                                Join as Scholar
                            </Button>
                        </a>
                        <a href="/matching/join?type=Practitioner">
                            <Button variant="outline" className="border-orange-600 text-orange-700 hover:bg-orange-50 hover:text-orange-800 bg-transparent">
                                Join as Practitioner
                            </Button>
                        </a>
                    </div>
                </div>
            </div>

            <MatchingSystem items={items} options={options} />
        </div>
    );
}
