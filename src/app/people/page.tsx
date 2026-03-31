import { TitleBar } from "@/components/title-bar";
import { fetchPeople } from "@/lib/notion";
import { PeopleList } from "@/components/people/people-list";

export const revalidate = 60;

export default async function PeoplePage() {
    const items = await fetchPeople();

    return (
        <div className="space-y-8 pb-20">
            <TitleBar 
                title="PEOPLE" 
                description={<>The team behind the Laboratory <em>for</em> Cybernetics.</>} 
            />

            <PeopleList items={items} />
        </div>
    );
}
