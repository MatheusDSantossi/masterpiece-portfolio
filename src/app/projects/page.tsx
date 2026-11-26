import type { Metadata } from "next";
import Link from "next/link";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "All projects",
  description: "Every project by Matheus D. Santos: AI tools, web apps, a desktop computer-vision app, a mobile app and a game.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsHubPage() {
  return (
    <div className="wrap phero" data-scene="3">
      <Link className="back label" href="/#projects">
        ← Back to portfolio
      </Link>
      <div className="head" style={{ marginTop: 22 }}>
        <span className="label shadow">All projects</span>
        <h1 className="shadow" style={{ fontSize: "clamp(44px,7.4vw,104px)" }}>
          Everything <em>on the wall.</em>
        </h1>
      </div>
      <div className="hubgrid">
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} index={i} />
        ))}
      </div>
    </div>
  );
}
