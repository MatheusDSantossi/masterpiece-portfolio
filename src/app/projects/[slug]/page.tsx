import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { JsonLd } from "@/components/JsonLd";
import { ProjectCard } from "@/components/ProjectCard";
import { ordinal, ProjectFrame } from "@/components/ProjectFrame";
import { profile } from "@/content/profile";
import { getProject, projects, relatedProjects } from "@/content/projects";
import { absoluteUrl, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return {
    title: `${project.title} case study`,
    description: project.headline,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: `${project.title} · ${profile.name}`, description: project.headline, url: `/projects/${project.slug}` },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const index = projects.indexOf(project);
  const { caseStudy } = project;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          headline: project.headline,
          description: project.description,
          keywords: project.tags.join(", "),
          url: absoluteUrl(`/projects/${project.slug}`),
          image: absoluteUrl(project.screenshot),
          author: { "@type": "Person", name: profile.name, url: SITE_URL },
          sameAs: project.links.map((link) => link.href),
        }}
      />
      <div className="wrap phero" data-scene={index % 4}>
        <Link className="back label" href="/#projects">
          ← Back to portfolio
        </Link>
        <div className="pgrid">
          <div className="pcol">
            <span className="label shadow">
              Case study · {ordinal(index)} of {ordinal(projects.length - 1)}
            </span>
            <h1 className="shadow">{project.title}</h1>
            <p className="say shadow">{project.headline}</p>
            <div className="tags">
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <div className="btns">
              {project.links.map((link, k) => (
                <a key={link.href} className={`btn ${k ? "sec" : "pri"}`} href={link.href} target="_blank" rel="noreferrer">
                  {link.label} ↗
                </a>
              ))}
              <Link className="btn sec" href="/projects">
                Browse all projects
              </Link>
            </div>
          </div>
          <div className="pframe tilt">
            <ProjectFrame project={project} index={index} />
          </div>
        </div>
      </div>
      <section data-scene={(index % 4) + 1}>
        <div className="wrap">
          <div className="cards">
            <article className="glass card">
              <span className="label">What it is</span>
              <p>{project.description}</p>
            </article>
            <article className="glass card">
              <span className="label">Problem</span>
              <p>{caseStudy.problem}</p>
            </article>
            <article className="glass card">
              <span className="label">Solution</span>
              <p>{caseStudy.solution}</p>
            </article>
          </div>
          <div className="cards two">
            <article className="glass card">
              <span className="label">Stack</span>
              <dl className="stack">
                {caseStudy.stack.map((row) => (
                  <Fragment key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </Fragment>
                ))}
              </dl>
            </article>
            <article className="glass card">
              <span className="label">Results</span>
              <ul className="res">
                {caseStudy.results.map((result) => (
                  <li key={result}>{result}</li>
                ))}
              </ul>
            </article>
          </div>
          <div className="head" style={{ marginTop: "clamp(56px,8vw,110px)" }}>
            <span className="label shadow">Keep looking</span>
            <h2 className="shadow">
              More <em>from the wall.</em>
            </h2>
          </div>
          <div className="hubgrid three">
            {relatedProjects(project.slug).map((related) => (
              <ProjectCard key={related.slug} project={related} index={projects.indexOf(related)} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
