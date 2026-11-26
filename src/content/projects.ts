import type { Project } from "./types";

const GITHUB = "https://github.com/MatheusDSantossi";

export const projects: Project[] = [
  {
    slug: "plai",
    title: "Plai",
    headline: "An AI curation tool that turns a prompt into a learning path.",
    description:
      "An app that turns plain-text intent into tailored learning paths of videos, podcasts and articles. I designed and built the product and its public launch page.",
    tags: ["Next.js", "React", "AI", "Building in public"],
    links: [{ label: "Live demo", href: "https://plai.matheusdsantosr.com/" }],
    palette: ["#231335", "#C22B4E", "#F08A5D", "#F9D57A"],
    screenshot: "/projects/plai.webp",
    art: { focus: [0.3, 0.45], zoom: 1, exposure: 2.2 },
    updatedAt: "2026-11-25",
    caseStudy: {
      problem:
        "Learning something new online means stitching videos, articles and podcasts together yourself, with no order and no way to tell when you are done.",
      solution:
        "You describe a goal in plain text. Plai works out the intent, builds a staged path, checks that every link still plays, and tracks your progress through to a shareable certificate.",
      stack: [
        { label: "Interface", value: "React, Next.js, Tailwind CSS" },
        { label: "Backend", value: "Node, Express, Prisma, PostgreSQL" },
        { label: "AI", value: "Llama 3.1, YouTube Data API" },
      ],
      results: [
        "Public launch page live",
        "Staged paths with progress tracking and certificates",
        "Free and paid plans",
      ],
    },
  },
  {
    slug: "hecate-landing-page",
    title: "Hecate",
    headline: "A high-performance product page for an intelligent chatbot.",
    description:
      "Landing page for the Hecate AI chatbot platform. Modular components and careful CSS layout so complex product features read clearly at any width.",
    tags: ["React", "Tailwind v4", "TypeScript"],
    links: [
      { label: "Source code", href: `${GITHUB}/hecate-landing-page` },
      { label: "Chatbot source", href: `${GITHUB}/hecate-chatbot` },
    ],
    palette: ["#0E1230", "#3B2F8F", "#8E6BD8", "#E3C6F5"],
    screenshot: "/projects/hecate-landing-page.webp",
    art: { focus: [0.5, 0.3], zoom: 1, exposure: 1 },
    updatedAt: "2026-11-25",
    caseStudy: {
      problem:
        "Hecate is an AI chatbot that businesses put in front of their customers as the first point of contact. It needed a public page that explains a technical product, catalog search with AI answers, to buyers who are not technical.",
      solution:
        "A single-page site in sections: hero, why Hecate, a product carousel, an animated quote, features and contact. Shared Framer Motion variants keep the motion consistent, and the contact form is validated with react-hook-form and zod before it is sent.",
      stack: [
        { label: "Interface", value: "React 19, TypeScript, Tailwind CSS 4" },
        { label: "Motion", value: "Framer Motion, Embla Carousel" },
        { label: "Forms", value: "react-hook-form, zod, EmailJS" },
        { label: "Tooling", value: "Vite, ESLint, GitHub Actions" },
      ],
      results: [
        "Responsive from phone to desktop",
        "Lint runs on every pull request, required by a branch ruleset",
        "The chatbot itself ships separately: Django REST, Gemini embeddings and Postgres trigram search",
      ],
    },
  },
  {
    slug: "posture-guard",
    title: "Posture Guard",
    headline: "A privacy-focused desktop app that monitors posture locally.",
    description:
      "A computer-vision desktop utility that watches your posture. Everything runs on your own machine: video never leaves it, and session memory clears when you close the app.",
    tags: ["Python", "MediaPipe", "Data analysis"],
    links: [
      { label: "Source code", href: `${GITHUB}/posture-guard` },
      { label: "Download for Windows", href: `${GITHUB}/posture-guard/releases/latest` },
    ],
    palette: ["#0F2A2A", "#1F6F68", "#7DC9A6", "#EDF2C4"],
    screenshot: "/projects/posture-guard.webp",
    art: { focus: [0.64, 0.42], zoom: 1.25, exposure: 1.7 },
    updatedAt: "2026-11-25",
    caseStudy: {
      problem:
        "Hours at a desk pull you into a slouch, and you notice only when your neck hurts. Most posture tools want an account, upload your webcam to a server, or judge you against an average body instead of yours.",
      solution:
        "A tray app that calibrates on you: three seconds of sitting straight averages 90 frames into a personal baseline. MediaPipe turns each frame into 33 body landmarks, seven checks compare them with that baseline over an 8-frame window, and a small state machine alerts only when bad posture lasts and the cooldown has passed. Frames are never written to disk.",
      stack: [
        { label: "Vision", value: "MediaPipe PoseLandmarker, OpenCV" },
        { label: "App", value: "Python, system tray, native OS notifications" },
        { label: "Delivery", value: "GitHub Actions builds a one-file Windows release on every tag" },
      ],
      results: [
        "Seven posture checks, each measured against your own baseline",
        "No frames stored and no network calls after setup",
        "Single-file Windows download, launched on Product Hunt",
      ],
    },
  },
  {
    slug: "social-media-app",
    title: "Social Media App",
    headline: "A lightweight cross-platform mobile app for real-time interaction.",
    description:
      "A mobile app for profiles and content sharing, built to explore cross-platform state management, backend integration and fluid interface animation.",
    tags: ["Flutter", "Firebase", "Animation"],
    links: [
      {
        label: "Source code",
        href: `${GITHUB}/flutter-project/tree/flutter_project_mobile_v13/flutter_application_v2`,
      },
    ],
    palette: ["#10243F", "#2F6FB0", "#74C0E8", "#F4E3C0"],
    screenshot: "/projects/social-media-app.webp",
    art: { focus: [0.27, 0.52], zoom: 1.55, exposure: 1 },
    updatedAt: "2026-11-25",
    caseStudy: {
      problem:
        "The mobile development course at UFRPE asked for a working cross-platform app. I used it to learn the hard parts of mobile: state shared across screens, a real backend, and animation that does not stutter.",
      solution:
        "A Flutter app for profiles and content sharing, backed by Firebase, with responsive layouts and animated transitions. It grew in small iterations, each on its own branch.",
      stack: [
        { label: "Interface", value: "Flutter, Dart" },
        { label: "Backend", value: "Firebase" },
        { label: "Focus", value: "State management, animation" },
      ],
      results: [
        "Delivered as the graded project for the UFRPE mobile course",
        "One codebase for Android and iOS",
      ],
    },
  },
  {
    slug: "crabby-game",
    title: "Crabby Game",
    headline: "An educational Java puzzle game that teaches block-based logic.",
    description:
      "A university project for the Human-Machine Interface course. Players guide Mr. Piggy through puzzles and pick up block-based programming along the way.",
    tags: ["Java", "Game design", "HMI"],
    links: [
      {
        label: "Source code",
        href: `${GITHUB}/projeto-IHM/tree/IHM_project_block_game_vFinal/Documents/universidade_stuff/IHM_stuff/IHM-Project/Project_IHM_full_edition_v9`,
      },
    ],
    palette: ["#3A1420", "#C5483A", "#F2A65A", "#FBE8B8"],
    screenshot: "/projects/crabby-game.webp",
    art: { focus: [0.6, 0.3], zoom: 1.35, exposure: 1 },
    updatedAt: "2026-11-25",
    caseStudy: {
      problem:
        "Beginners usually meet programming as a wall of syntax. The Human-Machine Interface course asked for an interface that teaches something and holds up against usability principles.",
      solution:
        "A Java desktop puzzle game: players snap instruction blocks together to guide Mr. Piggy through each level, so sequencing is learned by playing rather than reading. It started from Kaarin Gaming's tutorial series and was extended for the course.",
      stack: [
        { label: "Language", value: "Java" },
        { label: "Art", value: "Sprites and image editing" },
        { label: "Course", value: "Human-Machine Interface, UFRPE" },
      ],
      results: [
        "Delivered as the graded HMI course project",
        "Levels that teach sequencing without any syntax",
      ],
    },
  },
  {
    slug: "portfolio-website",
    title: "Portfolio, first edition",
    headline: "My earlier developer portfolio.",
    description:
      "The earlier version of this site, built to learn modern frontend tools: motion layouts, a structured styling system and component-driven architecture.",
    tags: ["Next.js", "Tailwind CSS", "Framer Motion"],
    links: [{ label: "Source code", href: `${GITHUB}/portfolio-website-p2/tree/web_portfolio_project_2_v1` }],
    palette: ["#151528", "#5B2A86", "#B14AED", "#F0B8E8"],
    screenshot: "/projects/portfolio-website.webp",
    art: { focus: [0.7, 0.55], zoom: 1, exposure: 1.2 },
    updatedAt: "2026-11-25",
    caseStudy: {
      problem:
        "I needed a portfolio, and I wanted building it to teach me the modern React stack properly instead of filling in a template.",
      solution:
        "A Next.js site styled with Tailwind CSS and animated with Framer Motion, built from scratch out of small reusable components with motion-driven layouts.",
      stack: [
        { label: "Framework", value: "Next.js, React" },
        { label: "Styling", value: "Tailwind CSS" },
        { label: "Motion", value: "Framer Motion" },
      ],
      results: [
        "Where I first practised component architecture in React",
        "One of the earlier portfolio builds that led to this site",
      ],
    },
  },
  {
    slug: "learning-journey",
    title: "Learning Journey",
    headline: "A central log of my technical growth and code experiments.",
    description:
      "A public log of what I am learning, across Python automation, Java and modern JavaScript frameworks. Unpolished on purpose.",
    tags: ["Python", "Java", "JavaScript", "Learning in public"],
    links: [{ label: "Source code", href: `${GITHUB}/learning-journey` }],
    palette: ["#22301A", "#5E8C3A", "#C9C15A", "#F6EBC8"],
    screenshot: "/projects/learning-journey.webp",
    art: { focus: [0.42, 0.42], zoom: 1.6, exposure: 0.7 },
    updatedAt: "2026-11-25",
    caseStudy: {
      problem:
        "Course and tutorial code ends up scattered across folders and machines. It is easy to forget what you learned, or to copy the answer instead of working it out.",
      solution:
        "One public repository organised by topic: Python design patterns with explanations, data structures and algorithms problems, interview-style challenges, and a multi-module Spring Boot project. For course exercises I write my own solution before checking the official one.",
      stack: [
        { label: "Languages", value: "Python, Java, JavaScript" },
        { label: "Topics", value: "Design patterns, data structures, Spring Boot" },
      ],
      results: [
        "A public, dated record of progress",
        "Each project folder has its own README",
      ],
    },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/** Three other projects, starting after the given one, wrapping around. */
export function relatedProjects(slug: string, count = 3): Project[] {
  const index = projects.findIndex((project) => project.slug === slug);
  return Array.from({ length: Math.min(count, projects.length - 1) }, (_, k) => projects[(index + k + 1) % projects.length]).filter(
    (project): project is Project => project !== undefined,
  );
}
