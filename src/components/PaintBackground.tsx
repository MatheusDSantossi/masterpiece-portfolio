"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { blendLight, sceneLight, type Light } from "@/lib/paint/day";
import { createProgram } from "@/lib/paint/gl";
import { LANDSCAPE_FS } from "@/lib/paint/landscape-shader";

/**
 * The painted landscape behind every page. It is still at rest: scrolling moves it
 * through the day (each [data-scene] section names a time of day) and the cursor
 * moves the light and a glass bead. The render loop stops when nothing changes.
 */
export function PaintBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wakeRef = useRef<() => void>(() => {});
  const pathname = usePathname();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const program = createProgram(canvas, LANDSCAPE_FS);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dpr = 1;
    let scenes: HTMLElement[] = [];
    let awake = false;
    let frameId = 0;
    // Targets (t*) and eased values: scroll, light parallax, bead position.
    let sy = scrollY;
    let tx = 0, ty = 0, px = 0, py = 0;
    let tbx = innerWidth * 0.76, tby = innerHeight * 0.36;
    let bx = tbx, by = tby;

    const collectScenes = () => {
      scenes = Array.from(document.querySelectorAll<HTMLElement>("main [data-scene]"));
    };

    const currentLight = (): Light & { k: number } => {
      const first = scenes[0];
      if (!first) return { ...sceneLight(0), k: 0 };
      const mid = sy + innerHeight * 0.5;
      const centers = scenes.map((el) => {
        const r = el.getBoundingClientRect();
        return r.top + scrollY + r.height / 2;
      });
      let i = 0;
      while (i < centers.length - 2 && mid > (centers[i + 1] ?? Infinity)) i++;
      const a = scenes[i] ?? first;
      const b = scenes[i + 1] ?? a;
      const c0 = centers[i] ?? 0;
      const c1 = centers[i + 1] ?? c0;
      const k = centers.length > 1 && c1 !== c0 ? Math.min(1, Math.max(0, (mid - c0) / (c1 - c0))) : 0;
      const e = k * k * (3 - 2 * k);
      return { ...blendLight(sceneLight(Number(a.dataset.scene)), sceneLight(Number(b.dataset.scene)), e), k: e };
    };

    const render = () => {
      if (!program) return;
      const { gl, uniform, draw } = program;
      const s = currentLight();
      gl.uniform2f(uniform("uRes"), canvas.width, canvas.height);
      gl.uniform2f(uniform("uMouse"), bx * dpr, (innerHeight - by) * dpr);
      gl.uniform2f(uniform("uPar"), px, py * 0.6 + (s.k - 0.5) * 1.4);
      gl.uniform2f(uniform("uSun"), s.sp[0], s.sp[1]);
      gl.uniform1f(uniform("uBead"), innerWidth < 640 ? 0 : 0.105);
      gl.uniform1f(uniform("uSeed"), 3.1);
      gl.uniform1f(uniform("uDim"), s.dim);
      gl.uniform1f(uniform("uStars"), s.stars);
      gl.uniform3fv(uniform("cTop"), s.top);
      gl.uniform3fv(uniform("cLow"), s.low);
      gl.uniform3fv(uniform("cSun"), s.sun);
      gl.uniform3fv(uniform("cHill"), s.hill);
      gl.uniform3fv(uniform("cWater"), s.water);
      draw();
    };

    const frame = () => {
      const ease = reduce ? 1 : 0.09;
      const d = [scrollY - sy, tx - px, ty - py, tbx - bx, tby - by] as const;
      sy += d[0] * ease;
      px += d[1] * ease;
      py += d[2] * ease;
      bx += d[3] * ease;
      by += d[4] * ease;
      render();
      const moving = Math.abs(d[0]) > 0.4 || Math.abs(d[1]) + Math.abs(d[2]) > 0.002 || Math.abs(d[3]) + Math.abs(d[4]) > 0.4;
      if (moving) frameId = requestAnimationFrame(frame);
      else awake = false;
    };

    const wake = () => {
      if (awake) return;
      awake = true;
      frameId = requestAnimationFrame(frame);
    };
    wakeRef.current = () => {
      collectScenes();
      wake();
    };

    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 1.5) * (innerWidth > 1600 ? 0.8 : 1);
      canvas.width = Math.round(innerWidth * dpr);
      canvas.height = Math.round(innerHeight * dpr);
      render();
      wake();
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        tbx = e.clientX;
        tby = e.clientY;
        tx = (e.clientX / innerWidth) * 2 - 1;
        ty = 1 - (e.clientY / innerHeight) * 2;
      }
      wake();
    };

    collectScenes();
    resize();
    addEventListener("resize", resize);
    addEventListener("scroll", wake, { passive: true });
    addEventListener("pointermove", onPointerMove);
    addEventListener("pointerdown", wake);
    addEventListener("keydown", wake);
    return () => {
      cancelAnimationFrame(frameId);
      removeEventListener("resize", resize);
      removeEventListener("scroll", wake);
      removeEventListener("pointermove", onPointerMove);
      removeEventListener("pointerdown", wake);
      removeEventListener("keydown", wake);
    };
  }, []);

  // A new route has new [data-scene] sections.
  useEffect(() => {
    wakeRef.current();
  }, [pathname]);

  return <canvas id="paint" ref={canvasRef} aria-hidden="true" />;
}
