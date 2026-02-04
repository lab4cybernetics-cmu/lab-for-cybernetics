
import { fetchPeople } from "@/lib/notion";
import { PeopleList } from "@/components/people/people-list";

export const revalidate = 60;

export default async function PeoplePage() {
    const items = await fetchPeople();

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-medium tracking-tight mb-2">People</h1>
                <p className="text-neutral-500 max-w-2xl">
                    The team behind the Laboratory <em>for</em> Cybernetics.
                </p>
            </div>

            <PeopleList items={items} />
        </div>
    );
}
