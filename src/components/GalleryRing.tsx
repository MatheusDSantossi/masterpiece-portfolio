"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Project } from "@/content/types";
import { ProjectArt } from "./ProjectArt";
import { ordinal } from "./ProjectFrame";

/** Project canvases hung on a 3D ring. Drag, arrow buttons or arrow keys rotate it; the front canvas opens its case study. */
export function GalleryRing({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const stepRef = useRef<(direction: number) => void>(() => {});
  const pickRef = useRef<(index: number) => void>(() => {});
  const movedRef = useRef(false);
  const [selected, setSelected] = useState(0);
  const count = projects.length;

  useEffect(() => {
    const stage = stageRef.current;
    const ring = ringRef.current;
    if (!stage || !ring) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const theta = 360 / count;
    let radius = 0;
    let angle = 0;
    let target = 0;
    let sel = -1;
    let running = false;
    let frameId = 0;
    let drag: { x: number; t: number } | null = null;

    const size = () => {
      const cw = innerWidth < 640 ? 210 : innerWidth < 1000 ? 250 : 300;
      radius = Math.round(cw / 2 / Math.tan(Math.PI / count)) + (innerWidth < 640 ? 34 : 80);
      stage.style.setProperty("--cw", `${cw}px`);
      stage.style.setProperty("--ch", `${Math.round(cw * 1.3)}px`);
      cardRefs.current.forEach((card, i) => {
        if (card) card.style.transform = `rotateY(${i * theta}deg) translateZ(${radius}px)`;
      });
      sel = -1;
      wake();
    };

    const tick = () => {
      const d = target - angle;
      if (Math.abs(d) < 0.02 && sel >= 0) {
        angle = target;
        running = false;
        return;
      }
      angle += d * (reduce ? 1 : 0.085);
      ring.style.transform = `translateZ(${-radius}px) rotateY(${angle}deg)`;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const a = ((((i * theta + angle) % 360) + 540) % 360) - 180;
        const k = Math.max(0, Math.cos((a * Math.PI) / 180));
        card.style.filter = `brightness(${0.38 + 0.62 * k * k})`;
        card.tabIndex = Math.abs(a) < theta * 1.5 ? 0 : -1;
      });
      const front = (((Math.round(-angle / theta) % count) + count) % count);
      if (front !== sel) {
        sel = front;
        setSelected(front);
      }
      frameId = requestAnimationFrame(tick);
    };
    function wake() {
      if (running) return;
      running = true;
      frameId = requestAnimationFrame(tick);
    }

    stepRef.current = (direction) => {
      target = Math.round(target / theta) * theta - direction * theta;
      wake();
    };
    pickRef.current = (index) => {
      target = -index * theta + Math.round((target + index * theta) / 360) * 360;
      wake();
    };

    const onDown = (e: PointerEvent) => {
      drag = { x: e.clientX, t: target };
      movedRef.current = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 6) movedRef.current = true;
      target = drag.t + dx * 0.22;
      wake();
    };
    const onUp = () => {
      if (!drag) return;
      drag = null;
      target = Math.round(target / theta) * theta;
      wake();
    };

    size();
    stage.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(frameId);
      stage.removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("resize", size);
    };
  }, [count]);

  const onCardClick = (index: number) => {
    if (movedRef.current) return;
    const project = projects[index];
    if (index === selected && project) router.push(`/projects/${project.slug}`);
    else pickRef.current(index);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") stepRef.current(1);
    else if (e.key === "ArrowLeft") stepRef.current(-1);
    else return;
    e.preventDefault();
  };

  const current = projects[selected] ?? projects[0];

  return (
    <>
      <div
        className="stage"
        ref={stageRef}
        tabIndex={0}
        role="group"
        aria-label="Project gallery. Drag, or use the arrow keys."
        onKeyDown={onKeyDown}
      >
        <div className="ring" ref={ringRef}>
          {projects.map((project, i) => {
            const [dark, mid, light] = project.palette;
            return (
              <button
                key={project.slug}
                type="button"
                className="cv"
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                aria-label={`Show ${project.title}`}
                onClick={() => onCardClick(i)}
                style={{ background: `linear-gradient(170deg,${dark},${light} 60%,${mid})` }}
              >
                <ProjectArt project={project} />
                <span className="plate">
                  <b>{ordinal(i)}</b>
                  <span>{project.title}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="wrap">
        <div className="ctrl">
          <button type="button" aria-label="Previous project" onClick={() => stepRef.current(-1)}>
            ←
          </button>
          <span>
            {ordinal(selected)} / {ordinal(count - 1)}
          </span>
          <button type="button" aria-label="Next project" onClick={() => stepRef.current(1)}>
            →
          </button>
        </div>
        {current && (
          <div className="detail glass" aria-live="polite">
            <div>
              <h3>{current.title}</h3>
              <p>{current.description}</p>
              <div className="tags">
                {current.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
            <div className="btns">
              <Link className="btn pri sm" href={`/projects/${current.slug}`}>
                Case study
              </Link>
              {current.links.map((link) => (
                <a key={link.href} className="btn sec sm" href={link.href} target="_blank" rel="noreferrer">
                  {link.label} ↗
                </a>
              ))}
            </div>
          </div>
        )}
        <p className="center">
          <Link className="btn sec" href="/projects">
            View all projects
          </Link>
        </p>
      </div>
    </>
  );
}
