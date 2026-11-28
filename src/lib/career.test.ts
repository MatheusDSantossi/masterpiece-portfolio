import { describe, expect, it } from "vitest";
import type { Job } from "@/content/types";
import { careerPath } from "./career";

const job = (company: string, start: string, end?: string): Job => ({
  company,
  role: "Role",
  period: "",
  start,
  end,
  current: end === undefined,
  summary: "",
});

describe("careerPath", () => {
  it("orders oldest first and keeps sequential jobs on the trunk", () => {
    const stops = careerPath([job("B", "2021-01"), job("A", "2019-01", "2020-01")]);
    expect(stops.map((s) => [s.job.company, s.lane])).toEqual([
      ["A", 0],
      ["B", 0],
    ]);
  });

  it("branches a job that overlaps an older one, which keeps the trunk", () => {
    const stops = careerPath([
      job("Supermarket", "2019-01", "2022-02"),
      job("Atan", "2025-07"),
      job("Tambau", "2021-01", "2022-02"),
      job("Ceos", "2023-10", "2025-06"),
    ]);
    expect(stops.map((s) => [s.job.company, s.lane])).toEqual([
      ["Supermarket", 0],
      ["Tambau", 1],
      ["Ceos", 0],
      ["Atan", 0],
    ]);
  });

  it("alternates card sides down the path", () => {
    const stops = careerPath([job("A", "2019-01", "2020-01"), job("B", "2020-02", "2021-01"), job("C", "2021-02")]);
    expect(stops.map((s) => s.side)).toEqual(["left", "right", "left"]);
  });
});
