import type { Job } from "@/content/types";
import { careerPath } from "@/lib/career";
import { CareerStroke } from "./CareerStroke";

/**
 * The Work section's timeline: one painted stroke down the middle with a glass card per job.
 * Jobs held at the same time sit on a branch beside the trunk. The cards are plain server HTML;
 * CareerStroke only paints the line over them.
 */
export function CareerPath({ jobs }: { jobs: readonly Job[] }) {
  return (
    <div className="tl">
      <CareerStroke />
      <ol>
        {careerPath(jobs).map(({ job, lane, side }) => (
          <li key={job.company} className="tl-stop" data-lane={lane} data-side={side} data-now={job.current || undefined}>
            <span className="tl-node" aria-hidden="true" />
            <span className="tl-year" aria-hidden="true">
              {job.start.slice(0, 4)}
            </span>
            <article className="tl-card glass rv">
              <span className="when">{job.period}</span>
              <h3>
                {job.company}
                {job.current && <span className="now">Now</span>}
              </h3>
              <p className="role">{job.role}</p>
              <p className="d">{job.summary}</p>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
