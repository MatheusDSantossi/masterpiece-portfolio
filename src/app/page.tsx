import Link from "next/link";
import { Fragment } from "react";
import { CareerPath } from "@/components/CareerPath";
import { ContactForm } from "@/components/ContactForm";
import { RevealEffect } from "@/components/Effects";
import { GalleryRing } from "@/components/GalleryRing";
import { JsonLd } from "@/components/JsonLd";
import { capabilities, currentJob, jobs, profile, socials, tools } from "@/content/profile";
import { projects } from "@/content/projects";
import { SITE_URL } from "@/lib/site";

const NUMERALS = ["i.", "ii.", "iii.", "iv.", "v.", "vi."];

const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: SITE_URL,
  jobTitle: profile.role,
  alumniOf: profile.university,
  worksFor: currentJob ? { "@type": "Organization", name: currentJob.company } : undefined,
  sameAs: socials.map((social) => social.href),
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={person} />
      <RevealEffect />
      <div className="wrap hero" data-scene="0">
        <span className="label shadow">{profile.tagline}</span>
        <h1 className="shadow">
          Software, built <em>in public.</em>
        </h1>
        <p className="lede shadow">{profile.lede}</p>
        <div className="row">
          <Link className="btn pri" href="#projects">
            See the work
          </Link>
          <Link className="btn sec" href="#contact">
            Say hello
          </Link>
        </div>
        <div className="foot label shadow">
          {currentJob && (
            <span>
              Now · {currentJob.role} at {currentJob.company}
            </span>
          )}
          <span>Scroll and the day moves. Stop and it holds still.</span>
        </div>
      </div>

      <section id="about" data-scene="1">
        <div className="wrap">
          <div className="head rv">
            <span className="label shadow">About</span>
            <h2 className="shadow">
              Curious first, <em>then useful.</em>
            </h2>
          </div>
          <div className="about rv">
            <p className="say shadow">
              {profile.aboutQuote.before}
              <em>{profile.aboutQuote.emphasis}</em>
              {profile.aboutQuote.after}
            </p>
            <div className="txt glass">
              {profile.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="caps rv">
            {capabilities.map((cap, i) => (
              <article key={cap.title} className="cap glass tilt">
                <span className="n">{NUMERALS[i]}</span>
                <div>
                  <h3>{cap.title}</h3>
                  <p>{cap.body}</p>
                </div>
              </article>
            ))}
          </div>
          <dl className="tools glass rv">
            {tools.map((row) => (
              <Fragment key={row.label}>
                <dt>{row.label}</dt>
                <dd>
                  {row.items.map((item, i) => (
                    <Fragment key={item}>
                      {i > 0 && (
                        <>
                          <span>/</span>
                          <wbr />
                        </>
                      )}
                      {item}
                    </Fragment>
                  ))}
                </dd>
              </Fragment>
            ))}
          </dl>
        </div>
      </section>

      <section id="work" data-scene="2">
        <div className="wrap">
          <div className="head rv">
            <span className="label shadow">Experience</span>
            <h2 className="shadow">
              Where I&apos;ve <em>worked.</em>
            </h2>
          </div>
          <CareerPath jobs={jobs} />
        </div>
      </section>

      <section id="projects" data-scene="3">
        <div className="wrap">
          <div className="head rv">
            <span className="label shadow">Selected projects</span>
            <h2 className="shadow">
              Seven pieces, <em>one wall.</em>
            </h2>
          </div>
        </div>
        <GalleryRing projects={projects} />
      </section>

      <section id="contact" data-scene="4">
        <div className="wrap contact">
          <div className="rv">
            <span className="label shadow">Contact</span>
            <h2 className="shadow mt">
              Let&apos;s build <em>something good.</em>
            </h2>
            <div className="soc">
              {socials.map((social) => (
                <a key={social.network} href={social.href} target="_blank" rel="me noreferrer">
                  {social.network} <span>{social.handle}</span>
                </a>
              ))}
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
