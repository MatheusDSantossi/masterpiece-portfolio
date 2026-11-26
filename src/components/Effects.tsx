"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** 3D tilt for any `.tilt` element, via one delegated listener so server-rendered markup needs no wrapper. */
export function TiltEffect() {
  useEffect(() => {
    let active: HTMLElement | null = null;
    const reset = (el: HTMLElement) => {
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--rx", "0deg");
    };
    const onMove = (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target.closest<HTMLElement>(".tilt") : null;
      if (active && active !== el) reset(active);
      active = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 14}deg`);
      el.style.setProperty("--rx", `${(0.5 - (e.clientY - r.top) / r.height) * 12}deg`);
    };
    addEventListener("pointermove", onMove);
    return () => removeEventListener("pointermove", onMove);
  }, []);
  return null;
}

/** Fades `.rv` blocks in as they scroll into view. Blocks already on screen are left alone. */
export function RevealEffect() {
  const pathname = usePathname();
  useEffect(() => {
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove("pre");
          io.unobserve(entry.target);
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll<HTMLElement>("main .rv").forEach((el) => {
      if (el.getBoundingClientRect().top > innerHeight * 0.9) {
        el.classList.add("pre");
        io.observe(el);
      }
    });
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
