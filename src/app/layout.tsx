import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { TiltEffect } from "@/components/Effects";
import { Nav } from "@/components/Nav";
import { PaintBackground } from "@/components/PaintBackground";
import { profile } from "@/content/profile";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
});
const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name} · ${profile.role}`,
    template: `%s · ${profile.name}`,
  },
  description: profile.description,
  authors: [{ name: profile.name }],
  openGraph: {
    type: "website",
    siteName: profile.name,
    images: [{ url: "/og-image.jpg", width: 1200, height: 632 }],
  },
  twitter: { card: "summary_large_image", creator: "@MSantos79880" },
};

export const viewport: Viewport = {
  themeColor: "#0C1320",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrument.variable}`}>
      <body>
        <PaintBackground />
        <Nav />
        <main id="top">{children}</main>
        <footer>
          <div className="wrap">
            <span>{profile.name} · 2026</span>
          </div>
        </footer>
        <TiltEffect />
      </body>
    </html>
  );
}
