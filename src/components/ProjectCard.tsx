import Link from "next/link";
import type { Project } from "@/content/types";
import { ProjectFrame } from "./ProjectFrame";

/** A painting with its title and headline, linking to the case study. Used on the hub and under each case study. */
export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Link className="hub tilt" href={`/projects/${project.slug}`}>
      <ProjectFrame project={project} index={index} />
      <span className="hub-t">
        <b>{project.title}</b>
        <span>{project.headline}</span>
      </span>
    </Link>
  );
}
