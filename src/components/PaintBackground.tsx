"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { blendLight, sceneLight, type Light } from "@/lib/paint/day";
import { createPrograms, type Program } from "@/lib/paint/gl";
import { CELLS_FS, LANDSCAPE_FS } from "@/lib/paint/landscape-shader";

/**
 * The painted landscape behind every page. It is still at rest: scrolling moves it
 * through the day (each [data-scene] section names a time of day) and the cursor
 * moves the light and a glass bead. The render loop stops when nothing changes.
 * Which stroke covers each pixel is baked into a texture whenever the canvas changes size,
 * so a frame only shades the strokes (see landscape-shader.ts).
 */
const MIN_QUALITY = 0.6;
const SEED = 3.1;
/** GPU time one full-scale frame may take before the render scale is lowered, in ms. */
const FRAME_BUDGET = 12;
const CALIBRATION_FRAMES = 3;

export function PaintBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wakeRef = useRef<() => void>(() => {});
  const pathname = usePathname();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Until the shaders have compiled, the gradient behind the canvas stands in for the painting.
    let landscape: Program | null = null;
    let cells: Program | null = null;
    let cellTexture: WebGLTexture | null = null;
    let cellBuffer: WebGLFramebuffer | null = null;
    let cellsStale = true;
    let disposed = false;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dpr = 1;
    // Render scale, chosen once before the painting fades in. The painting is soft, so fewer pixels
    // barely show, while a dropped frame does. It never changes afterwards: the grain is drawn per
    // canvas pixel, so lowering it mid-scroll made the whole painting visibly jump to a coarser size.
    let quality = 1;
    let scenes: HTMLElement[] = [];
    // Scene centers in page coordinates. Measured when layout changes, not per frame: reading layout
    // every frame forced a synchronous reflow whenever another effect had just written to the DOM.
    let centers: number[] = [];
    let awake = false;
    let frameId = 0;
    // Targets (t*) and eased values: scroll, light parallax, bead position.
    let sy = scrollY;
    let tx = 0, ty = 0, px = 0, py = 0;
    let tbx = innerWidth * 0.76, tby = innerHeight * 0.36;
    let bx = tbx, by = tby;

    const measureScenes = () => {
      centers = scenes.map((el) => {
        const r = el.getBoundingClientRect();
        return r.top + scrollY + r.height / 2;
      });
    };
    const collectScenes = () => {
      scenes = Array.from(document.querySelectorAll<HTMLElement>("main [data-scene]"));
      measureScenes();
    };

    const currentLight = (): Light & { k: number } => {
      const first = scenes[0];
      if (!first) return { ...sceneLight(0), k: 0 };
      const mid = sy + innerHeight * 0.5;
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

    /** Finds each pixel's stroke for the current canvas size. Costs about one frame of the old shader. */
    const bakeCells = () => {
      if (!cells || !landscape) return;
      const { gl } = cells;
      gl.bindTexture(gl.TEXTURE_2D, cellTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, cellBuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, cellTexture, 0);
      cells.use();
      gl.uniform2f(cells.uniform("uRes"), canvas.width, canvas.height);
      gl.uniform1f(cells.uniform("uSeed"), SEED);
      cells.draw(canvas.width, canvas.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      landscape.use();
      cellsStale = false;
    };

    const render = () => {
      if (!landscape) return;
      if (cellsStale) bakeCells();
      const { gl, uniform } = landscape;
      const s = currentLight();
      gl.uniform2f(uniform("uRes"), canvas.width, canvas.height);
      gl.uniform2f(uniform("uMouse"), bx * dpr, (innerHeight - by) * dpr);
      gl.uniform2f(uniform("uPar"), px, py * 0.6 + (s.k - 0.5) * 1.4);
      gl.uniform2f(uniform("uSun"), s.sp[0], s.sp[1]);
      gl.uniform1f(uniform("uBead"), innerWidth < 640 ? 0 : 0.105);
      gl.uniform1f(uniform("uSeed"), SEED);
      gl.uniform1f(uniform("uDim"), s.dim);
      gl.uniform1f(uniform("uStars"), s.stars);
      gl.uniform3fv(uniform("cTop"), s.top);
      gl.uniform3fv(uniform("cLow"), s.low);
      gl.uniform3fv(uniform("cSun"), s.sun);
      gl.uniform3fv(uniform("cHill"), s.hill);
      gl.uniform3fv(uniform("cWater"), s.water);
      landscape.draw(canvas.width, canvas.height);
    };

    /** Times one synchronous frame at full scale and lowers the render scale to fit FRAME_BUDGET. */
    const calibrate = (gl: WebGLRenderingContext) => {
      const pixel = new Uint8Array(4);
      // readPixels waits for the GPU to finish. The first frame also absorbs driver warm-up and the stroke bake,
      // so it is not timed. The page is still loading while this runs, so one sample can be inflated by other
      // work; the fastest of a few is the closest to what a frame really costs.
      render();
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      let elapsed = Infinity;
      for (let i = 0; i < CALIBRATION_FRAMES; i++) {
        const start = performance.now();
        render();
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        elapsed = Math.min(elapsed, performance.now() - start);
      }
      // Cost grows with the pixel count, the square of the scale.
      quality = Math.min(1, Math.max(MIN_QUALITY, Math.sqrt(FRAME_BUDGET / Math.max(elapsed, 0.001))));
      if (quality < 1) sizeCanvas();
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

    const sizeCanvas = () => {
      dpr = Math.min(devicePixelRatio || 1, 1.5) * (innerWidth > 1600 ? 0.8 : 1) * quality;
      const width = Math.round(innerWidth * dpr);
      const height = Math.round(innerHeight * dpr);
      // Resizing clears the canvas and forces a new bake, so skip it when nothing changed.
      if (width === canvas.width && height === canvas.height) return;
      canvas.width = width;
      canvas.height = height;
      cellsStale = true;
    };
    const resize = () => {
      sizeCanvas();
      measureScenes();
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
    createPrograms(canvas, [CELLS_FS, LANDSCAPE_FS]).then((ready) => {
      const [cellsReady, landscapeReady] = ready ?? [];
      if (disposed || !cellsReady || !landscapeReady) return;
      const { gl } = landscapeReady;
      cellTexture = gl.createTexture();
      cellBuffer = gl.createFramebuffer();
      gl.bindTexture(gl.TEXTURE_2D, cellTexture);
      // Codes must come back exactly, so no filtering between texels.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      cells = cellsReady;
      landscape = landscapeReady;
      landscape.use();
      gl.uniform1i(landscape.uniform("uCells"), 0);
      calibrate(gl);
      render();
      canvas.classList.add("ready");
      wake();
    });
    // Content above a scene can grow after load (fonts, images, the timeline), moving every center below it.
    const layoutObserver = new ResizeObserver(() => {
      measureScenes();
      wake();
    });
    layoutObserver.observe(document.body);
    addEventListener("resize", resize);
    addEventListener("scroll", wake, { passive: true });
    addEventListener("pointermove", onPointerMove);
    addEventListener("pointerdown", wake);
    addEventListener("keydown", wake);
    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      layoutObserver.disconnect();
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
