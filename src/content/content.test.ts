import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { paintingPath } from "@/lib/paint/art-layout";
import { jobs, resume, socials, tools } from "./profile";
import { getProject, projects, relatedProjects } from "./projects";

describe("projects", () => {
  it("has unique, url-safe slugs", () => {
    const slugs = projects.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("gives every project a complete case study", () => {
    for (const { slug, caseStudy } of projects) {
      expect(caseStudy.problem, slug).not.toHaveLength(0);
      expect(caseStudy.solution, slug).not.toHaveLength(0);
      expect(caseStudy.stack.length, slug).toBeGreaterThan(0);
      expect(caseStudy.results.length, slug).toBeGreaterThan(0);
    }
  });

  it("points every screenshot at a file in public/", () => {
    for (const { screenshot } of projects) {
      expect(existsSync(join(process.cwd(), "public", screenshot)), screenshot).toBe(true);
    }
  });

  it("has a pre-rendered painting for every project (run `pnpm paint`)", () => {
    for (const { slug } of projects) {
      expect(existsSync(join(process.cwd(), "public", paintingPath(slug))), slug).toBe(true);
    }
  });

  it("uses https links and valid palettes", () => {
    for (const { links, palette } of projects) {
      expect(links.length).toBeGreaterThan(0);
      for (const link of links) expect(link.href).toMatch(/^https:\/\//);
      for (const color of palette) expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it("keeps art direction in range", () => {
    for (const { slug, art } of projects) {
      for (const v of art.focus) expect(v, slug).toBeGreaterThanOrEqual(0);
      for (const v of art.focus) expect(v, slug).toBeLessThanOrEqual(1);
      expect(art.zoom, slug).toBeGreaterThanOrEqual(1);
      expect(art.exposure, slug).toBeGreaterThan(0);
    }
  });

  it("returns three related projects that never include the current one", () => {
    const related = relatedProjects("plai");
    expect(related).toHaveLength(3);
    expect(related.map((project) => project.slug)).not.toContain("plai");
    expect(getProject("missing")).toBeUndefined();
  });
});

describe("profile", () => {
  it("has exactly one current job", () => {
    expect(jobs.filter((job) => job.current)).toHaveLength(1);
  });

  it("dates every job, and only the current one has no end", () => {
    for (const job of jobs) {
      expect(job.start).toMatch(/^\d{4}-\d{2}$/);
      expect(job.end === undefined).toBe(job.current);
      if (job.end) expect(job.end >= job.start).toBe(true);
    }
  });

  it("lists backend tools and the Reddit profile", () => {
    expect(tools.some((row) => row.label === "Backend and infra")).toBe(true);
    expect(socials.some((social) => social.network === "Reddit")).toBe(true);
  });
});

describe("resume", () => {
  it("only lists projects that exist", () => {
    for (const slug of resume.projectSlugs) expect(getProject(slug), slug).toBeDefined();
  });
});
