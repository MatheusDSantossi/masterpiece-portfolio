import type { Job } from "@/content/types";

/** One job on the career path. Lane 0 is the trunk; lane 1 is a branch running beside it. */
export type PathStop = {
  job: Job;
  lane: 0 | 1;
  side: "left" | "right";
};

/** "YYYY-MM" strings compare correctly as text; an open end sorts after every date. */
const endOf = (job: Job) => job.end ?? "9999-12";
const overlaps = (a: Job, b: Job) => a.start <= endOf(b) && b.start <= endOf(a);

/**
 * Lays jobs out newest first. A job held alongside an older-starting one branches off,
 * since the older job carries the trunk further down. Two lanes are enough for this
 * history; a third concurrent job would share the branch lane.
 */
export function careerPath(jobs: readonly Job[]): PathStop[] {
  const sorted = [...jobs].sort((a, b) => b.start.localeCompare(a.start));
  return sorted.map((job, i) => ({
    job,
    lane: sorted.slice(i + 1).some((older) => overlaps(job, older)) ? 1 : 0,
    side: i % 2 === 0 ? "left" : "right",
  }));
}
