import type { ArtDirection, Palette } from "@/content/types";
import { ART_FS } from "./art-shader";
import { createProgram, hexToRgb, type Program } from "./gl";

/** Paintings are 300x390 on screen; rendered at 1.5x for sharp strokes on dense displays. */
export const ART_WIDTH = 450;
export const ART_HEIGHT = 585;

type ArtSource = { slug: string; screenshot: string; palette: Palette; art: ArtDirection };

let program: Program | null | undefined;
const cache = new Map<string, Promise<HTMLCanvasElement | null>>();

function getProgram(): Program | null {
  if (program === undefined) {
    const canvas = document.createElement("canvas");
    canvas.width = ART_WIDTH;
    canvas.height = ART_HEIGHT;
    program = createProgram(canvas, ART_FS);
  }
  return program;
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = src;
  await image.decode();
  return image;
}

async function render({ screenshot, palette, slug, art }: ArtSource): Promise<HTMLCanvasElement | null> {
  const p = getProgram();
  if (!p) return null;
  const image = await loadImage(screenshot);
  const { gl, uniform, draw } = p;

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  // Screenshots are not power-of-two sized, so WebGL 1 needs clamping and no mipmaps.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Cover-fit the screenshot into the portrait canvas, cropped by zoom around the focus point.
  // Texture space has y pointing up (the upload is flipped), so the focus y is inverted.
  const canvasAspect = ART_WIDTH / ART_HEIGHT;
  const imageAspect = image.naturalWidth / image.naturalHeight;
  const fit = imageAspect > canvasAspect ? [canvasAspect / imageAspect, 1] : [1, imageAspect / canvasAspect];
  const scale = [(fit[0] ?? 1) / art.zoom, (fit[1] ?? 1) / art.zoom] as const;
  const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max);
  const offset = [clamp(art.focus[0] - scale[0] / 2, 1 - scale[0]), clamp(1 - art.focus[1] - scale[1] / 2, 1 - scale[1])] as const;
  const [dark, mid, , light] = palette;

  gl.uniform2f(uniform("uRes"), ART_WIDTH, ART_HEIGHT);
  gl.uniform1i(uniform("uTex"), 0);
  gl.uniform2f(uniform("uScale"), scale[0], scale[1]);
  gl.uniform2f(uniform("uOffset"), offset[0], offset[1]);
  gl.uniform1f(uniform("uExposure"), art.exposure);
  gl.uniform1f(uniform("uSeed"), (slug.length * 7.3) % 13);
  gl.uniform3fv(uniform("cDark"), hexToRgb(dark));
  gl.uniform3fv(uniform("cMid"), hexToRgb(mid));
  gl.uniform3fv(uniform("cLight"), hexToRgb(light));
  draw();
  gl.deleteTexture(texture);

  const out = document.createElement("canvas");
  out.width = ART_WIDTH;
  out.height = ART_HEIGHT;
  out.getContext("2d")?.drawImage(gl.canvas, 0, 0);
  return out;
}

let queue: Promise<unknown> = Promise.resolve();

/** Paints a project once per page load; later calls reuse the cached result. Renders run one at a time on a shared context. */
export function paintProject(source: ArtSource): Promise<HTMLCanvasElement | null> {
  let painting = cache.get(source.slug);
  if (!painting) {
    painting = queue.then(() => render(source)).catch(() => null);
    queue = painting;
    cache.set(source.slug, painting);
  }
  return painting;
}
