export type ExternalLink = {
  label: string;
  href: string;
};

export type StackRow = {
  label: string;
  value: string;
};

export type CaseStudy = {
  problem: string;
  solution: string;
  stack: StackRow[];
  results: string[];
};

/** Four hex colors, darkest to lightest-accent. Used for the frame gradient and to tint the painting. */
export type Palette = readonly [string, string, string, string];

/** How the screenshot is framed and exposed for its painting. */
export type ArtDirection = {
  /** Point of the screenshot to center on, 0..1 from the top-left. */
  focus: readonly [number, number];
  /** 1 fills the portrait frame; higher crops in. */
  zoom: number;
  /** Above 1 lifts dark screenshots; below 1 dims bright ones. */
  exposure: number;
};

export type Project = {
  slug: string;
  title: string;
  /** One line, shown under the title on the hub and as the case study lede. */
  headline: string;
  description: string;
  tags: string[];
  links: ExternalLink[];
  palette: Palette;
  /** Path under /public of the real screenshot the painting is made from. */
  screenshot: string;
  art: ArtDirection;
  caseStudy: CaseStudy;
  /** ISO date of the last meaningful content change, for the sitemap. */
  updatedAt: string;
};

export type Job = {
  company: string;
  role: string;
  /** Display label, e.g. "Jul 2025 to now". */
  period: string;
  /** "YYYY-MM". Drives the career path layout. */
  start: string;
  /** "YYYY-MM"; absent for the current job. */
  end?: string;
  current: boolean;
  summary: string;
};

export type Capability = {
  title: string;
  body: string;
};

export type ToolRow = {
  label: string;
  items: string[];
};

export type Social = {
  network: string;
  handle: string;
  href: string;
};
