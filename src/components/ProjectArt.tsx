"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/content/types";
import { ART_HEIGHT, ART_WIDTH, paintProject } from "@/lib/paint/project-art";

/** The painting inside a project frame. Until it is painted, the frame's palette gradient shows through. */
export function ProjectArt({ project }: { project: Project }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { slug, screenshot, palette, art } = project;

  useEffect(() => {
    let cancelled = false;
    paintProject({ slug, screenshot, palette, art }).then((painting) => {
      const canvas = ref.current;
      if (cancelled || !painting || !canvas) return;
      canvas.getContext("2d")?.drawImage(painting, 0, 0);
    });
    return () => {
      cancelled = true;
    };
  }, [slug, screenshot, palette, art]);

  return <canvas ref={ref} width={ART_WIDTH} height={ART_HEIGHT} />;
}
