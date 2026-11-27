"use client";

import { useEffect, useId, useRef, useState } from "react";

/** `end` is where the trunk's tail finishes fading out. */
type Stroke = { width: number; height: number; end: number; paths: string[] };

/** Length of the S-curve where a branch leaves the trunk, in px. */
const SPLIT = 90;
/** How far the stroke runs past its last node before fading out, in px. */
const TAIL = 70;

/**
 * Paints the career path behind the timeline's nodes. Paths are measured from the rendered
 * nodes, so card heights and breakpoints need no layout math here. The stroke is revealed
 * down to a line 62% into the viewport, so it paints itself in as the page scrolls.
 */
export function CareerStroke() {
  const svgRef = useRef<SVGSVGElement>(null);
  const revealRef = useRef<SVGRectElement>(null);
  const scheduleRef = useRef<() => void>(() => {});
  const [stroke, setStroke] = useState<Stroke | null>(null);
  // useId output contains characters that break url(#...) references.
  const id = `tl${useId().replace(/[^\w-]/g, "")}`;

  useEffect(() => {
    const svg = svgRef.current;
    const tl = svg?.parentElement;
    if (!svg || !tl) return;
    tl.classList.add("drawn");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stops: { li: HTMLElement; y: number }[] = [];
    let frameId = 0;

    const measure = () => {
      const box = tl.getBoundingClientRect();
      const nodes = Array.from(tl.querySelectorAll<HTMLElement>(".tl-node")).map((node) => {
        const r = node.getBoundingClientRect();
        const li = node.closest<HTMLElement>(".tl-stop");
        return { li, lane: li?.dataset.lane === "1" ? 1 : 0, x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
      });
      const trunk = nodes.filter((n) => n.lane === 0);
      const first = trunk[0];
      const last = trunk[trunk.length - 1];
      if (!first || !last) return;

      const paths = [`M${first.x} ${first.y - 40}V${last.y + TAIL}`];
      nodes.forEach((n, i) => {
        if (n.lane === 0) return;
        // Leave the trunk below the stop above, curving out to the branch's lane.
        const above = nodes[i - 1];
        const top = above ? above.y + Math.min(60, (n.y - above.y) / 3) : n.y - SPLIT * 2;
        const curve = Math.min(SPLIT, (n.y - top) * 0.8);
        const mid = top + curve / 2;
        paths.push(`M${first.x} ${top}C${first.x} ${mid} ${n.x} ${mid} ${n.x} ${top + curve}V${n.y + TAIL}`);
      });
      stops = nodes.flatMap((n) => (n.li ? [{ li: n.li, y: n.y }] : []));
      setStroke({ width: box.width, height: box.height, end: last.y + TAIL, paths });
    };

    const reveal = () => {
      frameId = 0;
      const top = tl.getBoundingClientRect().top;
      const height = reduce ? tl.offsetHeight : Math.max(0, Math.min(tl.offsetHeight, innerHeight * 0.62 - top));
      revealRef.current?.setAttribute("height", String(height));
      for (const stop of stops) stop.li.classList.toggle("lit", stop.y <= height);
    };
    const schedule = () => {
      if (!frameId) frameId = requestAnimationFrame(reveal);
    };
    scheduleRef.current = schedule;

    const observer = new ResizeObserver(() => {
      measure();
      schedule();
    });
    observer.observe(tl);
    addEventListener("scroll", schedule, { passive: true });
    return () => {
      observer.disconnect();
      removeEventListener("scroll", schedule);
      cancelAnimationFrame(frameId);
    };
  }, []);

  // A new measurement renders a fresh clip rect, so reapply the current reveal to it.
  useEffect(() => {
    if (stroke) scheduleRef.current();
  }, [stroke]);

  const clip = `${id}-clip`;
  const fade = `${id}-fade`;
  const mask = `${id}-mask`;
  return (
    <svg ref={svgRef} className="tl-stroke" width={stroke?.width} height={stroke?.height} aria-hidden="true" focusable="false">
      {stroke && (
        <>
          <defs>
            <clipPath id={clip}>
              <rect ref={revealRef} width={stroke.width} height="0" />
            </clipPath>
            <linearGradient id={fade} x1="0" y1={stroke.end - TAIL} x2="0" y2={stroke.end} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fff" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <mask id={mask}>
              <rect width={stroke.width} height={stroke.height} fill={`url(#${fade})`} />
            </mask>
          </defs>
          <g clipPath={`url(#${clip})`} mask={`url(#${mask})`}>
            {stroke.paths.map((d) => (
              <g key={d}>
                <path className="body" d={d} />
                <path className="edge" d={d} />
                <path className="streak" d={d} />
              </g>
            ))}
          </g>
        </>
      )}
    </svg>
  );
}
