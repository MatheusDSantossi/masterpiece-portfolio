import type { ArtDirection, Palette } from "@/content/types";

/** Paintings are 300x390 on screen; rendered at 1.5x for sharp strokes on dense displays. */
export const ART_WIDTH = 450;
export const ART_HEIGHT = 585;

export type ArtSource = { slug: string; palette: Palette; art: ArtDirection };

type Rgb = [number, number, number];

export type ArtUniforms = {
  scale: [number, number];
  offset: [number, number];
  exposure: number;
  seed: number;
  dark: Rgb;
  mid: Rgb;
  light: Rgb;
};

const hexToRgb = (hex: string): Rgb => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
];

/**
 * Uniforms for ART_FS. Cover-fits the screenshot into the portrait canvas, cropped by zoom
 * around the focus point. Texture space has y pointing up (the upload is flipped), so the focus y is inverted.
 * Kept free of DOM and alias imports so the painting script can run it under plain Node.
 */
export function artUniforms({ slug, palette, art }: ArtSource, imageWidth: number, imageHeight: number): ArtUniforms {
  const canvasAspect = ART_WIDTH / ART_HEIGHT;
  const imageAspect = imageWidth / imageHeight;
  const fit = imageAspect > canvasAspect ? [canvasAspect / imageAspect, 1] : [1, imageAspect / canvasAspect];
  const scale: [number, number] = [(fit[0] ?? 1) / art.zoom, (fit[1] ?? 1) / art.zoom];
  const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max);
  const [dark, mid, , light] = palette;
  return {
    scale,
    offset: [clamp(art.focus[0] - scale[0] / 2, 1 - scale[0]), clamp(1 - art.focus[1] - scale[1] / 2, 1 - scale[1])],
    exposure: art.exposure,
    seed: (slug.length * 7.3) % 13,
    dark: hexToRgb(dark),
    mid: hexToRgb(mid),
    light: hexToRgb(light),
  };
}

/** Where the pre-rendered painting of a project is served from. */
export const paintingPath = (slug: string) => `/paintings/${slug}.webp`;
