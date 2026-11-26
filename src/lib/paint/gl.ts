import { logger } from "@/lib/logger";

const VERTEX = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";

export type Program = {
  gl: WebGLRenderingContext;
  uniform: (name: string) => WebGLUniformLocation | null;
  draw: () => void;
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
 * Compiles a full-screen-triangle program. Resolves to null when WebGL is unavailable or the shader fails.
 * The compile runs in the background where the browser supports it: a large fragment shader can take
 * seconds to compile on integrated GPUs the first time, and waiting for it on the main thread froze the page.
 */
export async function createProgram(canvas: HTMLCanvasElement, fragment: string): Promise<Program | null> {
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
  const fs = compile(gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  await linked(gl, program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    logger.error("shader link failed", { log: gl.getProgramInfoLog(program) ?? gl.getShaderInfoLog(fs) });
    return null;
  }

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const cache = new Map<string, WebGLUniformLocation | null>();
  const uniform = (name: string) => {
    if (!cache.has(name)) cache.set(name, gl.getUniformLocation(program, name));
    return cache.get(name) ?? null;
  };

  return {
    gl,
    uniform,
    draw: () => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}

export type Rgb = [number, number, number];

export const hexToRgb = (hex: string): Rgb => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
];
