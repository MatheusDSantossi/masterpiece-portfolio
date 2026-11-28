import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { JsonLd } from "@/components/JsonLd";
import { PrintButton } from "@/components/PrintButton";
import { capabilities, currentJob, jobs, profile, resume, socials, tools } from "@/content/profile";
import { getProject } from "@/content/projects";
import type { Project } from "@/content/types";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import "./resume.css";

export const metadata: Metadata = {
  title: "Résumé",
  description: `Résumé of ${profile.name}: experience, skills, selected projects and education.`,
  alternates: { canonical: "/resume" },
};

const selected = resume.projectSlugs.map(getProject).filter((project): project is Project => project !== undefined);
const contactLinks = socials.filter((social) => social.network === "LinkedIn" || social.network === "GitHub");
const siteHost = new URL(SITE_URL).host;

export default function ResumePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: absoluteUrl("/resume"),
          mainEntity: {
            "@type": "Person",
            name: profile.name,
            jobTitle: profile.role,
            alumniOf: profile.university,
            worksFor: currentJob ? { "@type": "Organization", name: currentJob.company } : undefined,
            sameAs: socials.map((social) => social.href),
          },
        }}
      />
      <div className="wrap phero rhero" data-scene="1">
        <Link className="back label" href="/">
          ← Back to portfolio
        </Link>
        <div className="head" style={{ marginTop: 22 }}>
          <span className="label shadow">Résumé</span>
          <h1 className="shadow" style={{ fontSize: "clamp(44px,7.4vw,104px)" }}>
            The one-page <em>version.</em>
          </h1>
        </div>
        <div className="btns">
          <PrintButton className="btn pri">Save as PDF</PrintButton>
          <Link className="btn sec" href="/#contact">
            Get in touch
          </Link>
        </div>
      </div>

      <section className="rsec" data-scene="2">
        <div className="wrap">
          <article className="sheet glass">
            <header className="sh-head">
              <div>
                <h2>
                  {profile.firstName} <em>{profile.lastName}</em>
                </h2>
                <p className="sh-role">{profile.role}</p>
              </div>
              <ul className="sh-contact">
                <li>
                  <a href={SITE_URL}>{siteHost}</a>
                </li>
                {contactLinks.map((social) => (
                  <li key={social.network}>
                    <a href={social.href} target="_blank" rel="me noreferrer">
                      {social.network} · {social.handle}
                    </a>
                  </li>
                ))}
              </ul>
            </header>

            <div className="sh-grid">
              <div className="sh-main">
                <section className="sh-block">
                  <h3 className="label">Summary</h3>
                  <p>{resume.summary}</p>
                </section>

                <section className="sh-block">
                  <h3 className="label">Experience</h3>
                  <ol className="sh-list">
                    {jobs.map((job) => (
                      <li key={`${job.company}-${job.start}`}>
                        <div className="sh-row">
                          <b>{job.role}</b>
                          <span className="sh-when">{job.period}</span>
                        </div>
                        <span className="sh-org">{job.company}</span>
                        <p>{job.summary}</p>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="sh-block">
                  <h3 className="label">Selected projects</h3>
                  <ul className="sh-list">
                    {selected.map((project) => (
                      <li key={project.slug}>
                        <div className="sh-row">
                          <Link href={`/projects/${project.slug}`}>
                            <b>{project.title}</b>
                          </Link>
                          <span className="sh-when">{project.tags.slice(0, 3).join(" · ")}</span>
                        </div>
                        <p>{project.headline}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <aside className="sh-side">
                <section className="sh-block">
                  <h3 className="label">Skills</h3>
                  <dl className="sh-skills">
                    {tools.map((row) => (
                      <Fragment key={row.label}>
                        <dt>{row.label}</dt>
                        <dd>{row.items.join(", ")}</dd>
                      </Fragment>
                    ))}
                  </dl>
                </section>

                <section className="sh-block">
                  <h3 className="label">Focus</h3>
                  <ul className="sh-plain">
                    {capabilities.map((cap) => (
                      <li key={cap.title}>{cap.title}</li>
                    ))}
                  </ul>
                </section>

                <section className="sh-block">
                  <h3 className="label">Education</h3>
                  <ul className="sh-plain">
                    {resume.education.map((entry) => (
                      <li key={entry.school}>
                        <b>{entry.school}</b>
                        <span className="sh-org">{entry.detail}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </aside>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
