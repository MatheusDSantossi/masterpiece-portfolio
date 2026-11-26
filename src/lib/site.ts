const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;

/** Canonical origin, without a trailing slash. Set NEXT_PUBLIC_SITE_URL in each environment. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? (fromVercel ? `https://${fromVercel}` : "http://localhost:3000")).replace(/\/+$/, "");

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
