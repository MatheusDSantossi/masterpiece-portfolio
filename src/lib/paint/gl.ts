import { logger } from "@/lib/logger";

const VERTEX = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";

export type Program = {
  gl: WebGLRenderingContext;
  /** Makes this the program that uniform values and draws apply to. */
  use: () => void;
  uniform: (name: string) => WebGLUniformLocation | null;
  /** Draws over the whole bound target, which is width x height pixels. */
  draw: (width: number, height: number) => void;
};

/** COMPLETION_STATUS_KHR from KHR_parallel_shader_compile. */
const COMPLETION_STATUS = 0x91b1;

/** Resolves on the next animation frame where the driver reports the program as linked. */
function linked(gl: WebGLRenderingContext, program: WebGLProgram): Promise<void> {
  // Without the extension, asking for the link status is the only option, and it blocks until compiled.
  if (!gl.getExtension("KHR_parallel_shader_compile")) return Promise.resolve();
  return new Promise((resolve) => {
    const poll = () => (gl.getProgramParameter(program, COMPLETION_STATUS) ? resolve() : requestAnimationFrame(poll));
    poll();
  });
}

/**
 * Compiles a full-screen-triangle program for each fragment shader on one WebGL context. Resolves to
 * null when WebGL is unavailable or any shader fails. The compiles run in the background, side by side,
 * where the browser supports it: a large fragment shader can take seconds to compile on integrated GPUs
 * the first time, and waiting for it on the main thread froze the page.
 */
export async function createPrograms(canvas: HTMLCanvasElement, fragments: readonly string[]): Promise<Program[] | null> {
  const gl = canvas.getContext("webgl", { antialias: false });
  if (!gl) return null;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const vs = compile(gl.VERTEX_SHADER, VERTEX);
  if (!vs) return null;
  const pending = fragments.map((source) => {
    const fs = compile(gl.FRAGMENT_SHADER, source);
    const program = gl.createProgram();
    if (!fs || !program) return null;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    // Every program reads the triangle from the same attribute slot, so one buffer setup serves them all.
    gl.bindAttribLocation(program, 0, "a");
    gl.linkProgram(program);
    return { fs, program };
  });

  const programs: Program[] = [];
  for (const entry of pending) {
    if (!entry) return null;
    const { fs, program } = entry;
    await linked(gl, program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      logger.error("shader link failed", { log: gl.getProgramInfoLog(program) ?? gl.getShaderInfoLog(fs) });
      return null;
    }
    const cache = new Map<string, WebGLUniformLocation | null>();
    programs.push({
      gl,
      use: () => gl.useProgram(program),
      uniform: (name) => {
        if (!cache.has(name)) cache.set(name, gl.getUniformLocation(program, name));
        return cache.get(name) ?? null;
      },
      draw: (width, height) => {
        gl.viewport(0, 0, width, height);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
    });
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  return programs;
}

export type Rgb = [number, number, number];

export const hexToRgb = (hex: string): Rgb => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
];
