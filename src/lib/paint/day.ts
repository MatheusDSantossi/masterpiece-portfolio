import { hexToRgb, type Rgb } from "./gl";

export type Light = {
  top: Rgb;
  low: Rgb;
  sun: Rgb;
  hill: Rgb;
  water: Rgb;
  /** Sun position in shader space. */
  sp: [number, number];
  stars: number;
  dim: number;
};

const light = (top: string, low: string, sun: string, hill: string, water: string, sp: [number, number], stars: number, dim: number): Light => ({
  top: hexToRgb(top),
  low: hexToRgb(low),
  sun: hexToRgb(sun),
  hill: hexToRgb(hill),
  water: hexToRgb(water),
  sp,
  stars,
  dim,
});

/** One landscape over one day: dawn, noon, golden hour, dusk, night. A section's data-scene picks one. */
export const DAY: readonly Light[] = [
  light("#2B3F6B", "#F2A98A", "#FFD9A0", "#2A3350", "#27405F", [0.42, 0], 0, 0.84),
  light("#3E7FC6", "#D3E6EA", "#FFF6D8", "#3D6B52", "#2F6F8F", [0.16, 0.34], 0, 0.5),
  light("#565A9C", "#F6B35E", "#FFCF7A", "#5B3A3A", "#6A4A52", [-0.3, 0.1], 0, 0.58),
  light("#1F1D4A", "#C6628A", "#FF9A7A", "#251F3F", "#3A2A55", [-0.5, -0.03], 0.25, 0.66),
  light("#060B1A", "#1B3350", "#3A4A6A", "#0A1220", "#0E2238", [-0.62, -0.4], 1, 0.86),
];

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

export function blendLight(a: Light, b: Light, t: number): Light {
  return {
    top: mixRgb(a.top, b.top, t),
    low: mixRgb(a.low, b.low, t),
    sun: mixRgb(a.sun, b.sun, t),
    hill: mixRgb(a.hill, b.hill, t),
    water: mixRgb(a.water, b.water, t),
    sp: [mix(a.sp[0], b.sp[0], t), mix(a.sp[1], b.sp[1], t)],
    stars: mix(a.stars, b.stars, t),
    dim: mix(a.dim, b.dim, t),
  };
}

export function sceneLight(index: number): Light {
  return DAY[Math.min(Math.max(index, 0), DAY.length - 1)] ?? light("#2B3F6B", "#F2A98A", "#FFD9A0", "#2A3350", "#27405F", [0.42, 0], 0, 0.84);
}
