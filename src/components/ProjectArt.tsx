import Image from "next/image";
import type { Project } from "@/content/types";
import { ART_HEIGHT, ART_WIDTH, paintingPath } from "@/lib/paint/art-layout";

/**
 * The painting inside a project frame, pre-rendered by `pnpm paint`.
 * Until it loads, the frame's palette gradient shows through.
 * Served as-is: the files are already sized and compressed for the frame.
 */
export function ProjectArt({ project }: { project: Project }) {
  return <Image src={paintingPath(project.slug)} width={ART_WIDTH} height={ART_HEIGHT} alt="" unoptimized />;
}
