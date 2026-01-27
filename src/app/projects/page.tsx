
import { fetchProjects } from "@/lib/notion";
import { ProjectList } from "@/components/projects/project-list";

export const revalidate = 60;

export default async function ProjectsPage() {
    const items = await fetchProjects();

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-medium tracking-tight mb-2">Projects</h1>
                <p className="text-neutral-500 max-w-2xl">
                    Ongoing investigations, design courses, and cybernetic interventions.
                </p>
            </div>

            <ProjectList items={items} />
        </div>
    );
}
