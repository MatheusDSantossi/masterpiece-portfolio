"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { profile } from "@/content/profile";
import { LogoMark } from "./LogoMark";

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "projects", label: "Projects" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [current, setCurrent] = useState<SectionId | null>(null);

  useEffect(() => {
    if (!isHome) {
      setCurrent(pathname.startsWith("/projects") ? "projects" : null);
      return;
    }
    const update = () => {
      const y = scrollY + innerHeight * 0.4;
      let found: SectionId | null = null;
      for (const { id } of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) found = id;
      }
      setCurrent(found);
    };
    update();
    addEventListener("scroll", update, { passive: true });
    return () => removeEventListener("scroll", update);
  }, [isHome, pathname]);

  return (
    <header className="nav glass">
      <Link className="me" href="/">
        <LogoMark className="mark" />
        {profile.firstName} <i>{profile.lastName}</i>
      </Link>
      {SECTIONS.map(({ id, label }) => (
        <Link key={id} className={`l${current === id ? " on" : ""}`} href={`/#${id}`}>
          {label}
        </Link>
      ))}
      <Link className={`l${pathname === "/resume" ? " on" : ""}`} href="/resume">
        Résumé
      </Link>
      <Link className="btn pri sm" href="/#contact">
        Get in touch
      </Link>
    </header>
  );
}
