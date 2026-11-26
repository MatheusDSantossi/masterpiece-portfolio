import type { Capability, Job, Social, ToolRow } from "./types";

export const profile = {
  name: "Matheus D. Santos",
  firstName: "Matheus",
  lastName: "D. Santos",
  role: "Full-stack developer",
  tagline: "Full-stack developer · Portfolio 2026",
  lede: "I'm Matheus. I build web apps, AI tools and SaaS products with React, TypeScript and Python, from the first sketch to the thing people use.",
  description:
    "Portfolio of Matheus D. Santos, a full-stack developer building web apps, AI tools and SaaS products with React, TypeScript and Python.",
  /** Rendered as before + <em>emphasis</em> + after. */
  aboutQuote: {
    before: "I started by fixing the hardware in my family's supermarket. Now I ship ",
    emphasis: "React, TypeScript and Python",
    after: " in production, and I still like knowing how the whole thing works.",
  },
  about: [
    "I'm a full-stack developer who loves open source and learns best by building. That has meant AI chatbots, a computer-vision desktop tool, a mobile app, a game, and the product I'm building now, Plai.",
    "I studied at the Federal Rural University of Pernambuco (UFRPE). Right now I'm going deeper into AI and SaaS.",
  ],
  university: "Federal Rural University of Pernambuco (UFRPE)",
} as const;

export const capabilities: Capability[] = [
  { title: "Full-stack engineering", body: "React and Next.js interfaces on top of APIs I design myself." },
  { title: "AI and data", body: "Chatbots, computer vision and dashboards that turn data into decisions." },
  { title: "Backend architecture", body: "Python and Java services, integrations and automation." },
  { title: "Cross-platform apps", body: "Flutter and Firebase for mobile, with motion that feels native." },
];

export const tools: ToolRow[] = [
  { label: "Languages", items: ["TypeScript", "JavaScript", "Python", "Java"] },
  { label: "Interface", items: ["React", "Next.js", "Tailwind CSS", "Framer Motion"] },
  { label: "Backend and infra", items: ["Node.js", "PostgreSQL", "Docker", "Git"] },
  { label: "Mobile", items: ["Flutter", "Firebase"] },
  { label: "Data and AI", items: ["Machine learning", "MediaPipe", "Data analysis", "Power BI"] },
];

export const jobs: Job[] = [
  {
    company: "Grupo Atan",
    role: "Fullstack Developer",
    period: "Jul 2025 to now",
    start: "2025-07",
    current: true,
    summary:
      "React and TypeScript applications, a point-of-sale system with SEFAZ integration, and Python automation. I led a navigation refactor that replaced route-based flow with a component registry, which cut page reloads.",
  },
  {
    company: "Céos Soluções Empresariais",
    role: "IT Intern, then Support Analyst",
    period: "Oct 2023 to Jun 2025",
    start: "2023-10",
    end: "2025-06",
    current: false,
    summary:
      "User support and systems on Windows Server and TOTVS RM. Part of a TOTVS Protheus rollout across finance, purchasing and inventory, and I built the company website.",
  },
  {
    company: "Tambaú Alimentos",
    role: "Young Apprentice",
    period: "Jan 2021 to Feb 2022",
    start: "2021-01",
    end: "2022-02",
    current: false,
    summary:
      "Excel VBA macros that automated repetitive work, Power BI dashboards for the team, and Senai training in 5S and Kanban.",
  },
  {
    company: "Santos Supermarket",
    role: "Multifunctional team member",
    period: "Jan 2019 to Feb 2022",
    start: "2019-01",
    end: "2022-02",
    current: false,
    summary:
      "Hardware, invoices, accounts and customers in the family business. This is where wanting to build systems started.",
  },
];

export const socials: Social[] = [
  { network: "GitHub", handle: "MatheusDSantossi", href: "https://github.com/MatheusDSantossi" },
  { network: "LinkedIn", handle: "matheussantossi", href: "https://www.linkedin.com/in/matheussantossi" },
  { network: "X", handle: "MSantos79880", href: "https://x.com/MSantos79880" },
  { network: "Dribbble", handle: "matheusdsantosr", href: "https://dribbble.com/matheusdsantosr" },
  { network: "Reddit", handle: "u/matheusdsantosr", href: "https://www.reddit.com/user/matheusdsantosr" },
];

export const currentJob = jobs.find((job) => job.current);
