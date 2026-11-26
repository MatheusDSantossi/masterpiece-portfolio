import type { Project } from "@/content/types";
import { ProjectArt } from "./ProjectArt";

export const ordinal = (index: number) => String(index + 1).padStart(2, "0");

/** A canvas in its frame with the name plate. Rendered as a <span> inside links, or wrapped by the gallery's buttons. */
export function ProjectFrame({ project, index }: { project: Project; index: number }) {
  const [dark, mid, light] = project.palette;
  return (
    <span className="cv" style={{ background: `linear-gradient(170deg,${dark},${light} 60%,${mid})` }}>
      <ProjectArt project={project} />
      <span className="plate">
        <b>{ordinal(index)}</b>
        <span>{project.title}</span>
      </span>
    </span>
  );
}
