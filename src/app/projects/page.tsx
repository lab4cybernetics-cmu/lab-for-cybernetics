import { TitleBar } from "@/components/title-bar";
import { fetchProjects } from "@/lib/notion";
import { ProjectList } from "@/components/projects/project-list";

export const revalidate = 60;

export default async function ProjectsPage() {
    const items = await fetchProjects();

    return (
        <div className="pb-20">
            <TitleBar 
                title="PROJECTS" 
                description="Ongoing investigations, design courses, and cybernetic interventions." 
            />

            <ProjectList items={items} />
        </div>
    );
}
