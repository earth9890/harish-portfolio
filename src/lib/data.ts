export const person = {
  name: "Harish Sugandhi",
  role: "Frontend & Full-Stack Engineer",
  location: "Pune, India",
  coords: "18.5204° N, 73.8567° E",
  email: "harishsugandhi.working@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/earth9890" },
    { label: "LinkedIn", href: "https://linkedin.com/in/harish-sugandhi-hds" },
    { label: "Linktree", href: "https://linktr.ee/harishsugandhi" },
  ],
};

export type Project = {
  id: string;
  index: string;
  title: string;
  kicker: string;
  year: string;
  stack: string[];
  blurb: string;
  metric: { value: string; label: string };
  hue: number;
};

export const projects: Project[] = [
  {
    id: "era",
    index: "01",
    title: "Era",
    kicker: "Conversational website builder",
    year: "2025",
    stack: ["React", "LLM tool-calling", "Streaming", "Agent workflows"],
    blurb:
      "An assistant that builds and edits a live website from plain English. I built the streaming chat surface and the action layer that turns intent into multi-step tool calls, with optimistic UI so the page changes before the model finishes talking.",
    metric: { value: "500K+", label: "sites in reach" },
    hue: 14,
  },
  {
    id: "suremails",
    index: "02",
    title: "SureEmails",
    kicker: "SMTP & email observability",
    year: "2024",
    stack: ["React", "REST", "WebSocket", "Virtualized logs"],
    blurb:
      "Led the full-stack build of an email delivery and logging product. Real-time log stream, faceted filtering, status timelines, and an API surface I designed from schema to rollout.",
    metric: { value: "60fps", label: "at 50k rows" },
    hue: 38,
  },
  {
    id: "surerank",
    index: "03",
    title: "SureRank",
    kicker: "AI-assisted SEO workbench",
    year: "2024",
    stack: ["React", "LLM APIs", "schema.org", "Editor UX"],
    blurb:
      "Content analysis, meta rewriting and structured-data previews in a single editor pane. The UI has to explain what the model changed and why, without ever getting in the way of typing.",
    metric: { value: "3×", label: "faster audits" },
    hue: 170,
  },
  {
    id: "basket",
    index: "04",
    title: "Shopping Basket",
    kicker: "Full-stack commerce",
    year: "2023",
    stack: ["React", "Node", "MongoDB", "Braintree"],
    blurb:
      "End-to-end storefront with filtering, pagination, Braintree checkout and role-based admin. Atomic inventory updates so the same item can never be sold twice.",
    metric: { value: "0", label: "double-sells" },
    hue: 52,
  },
  {
    id: "stream",
    index: "05",
    title: "Pulse",
    kicker: "Real-time stream analytics",
    year: "2023",
    stack: ["Next.js", "Spring Boot", "Kafka", "PostgreSQL"],
    blurb:
      "Event-driven analytics dashboard. Kafka producer/consumer backbone, live metrics over WebSockets, indexed Postgres for history, Docker for reproducible deploys.",
    metric: { value: "1.2M", label: "events / hr" },
    hue: 200,
  },
  {
    id: "atlas",
    index: "06",
    title: "Atlas",
    kicker: "Design system & motion kit",
    year: "2025",
    stack: ["TypeScript", "Tailwind", "GSAP", "Storybook"],
    blurb:
      "Internal component and motion library used across product dashboards. Tokens, easing curves and a tiny choreography API so every product moves the same way.",
    metric: { value: "40+", label: "components" },
    hue: 320,
  },
];

export const skills: { label: string; weight: number; group: "front" | "back" | "ai" | "ops" }[] = [
  { label: "React", weight: 3, group: "front" },
  { label: "Next.js", weight: 3, group: "front" },
  { label: "TypeScript", weight: 3, group: "front" },
  { label: "WebGL", weight: 2, group: "front" },
  { label: "GSAP", weight: 2, group: "front" },
  { label: "Tailwind", weight: 2, group: "front" },
  { label: "Zustand", weight: 1, group: "front" },
  { label: "Redux", weight: 1, group: "front" },
  { label: "Render perf", weight: 2, group: "front" },
  { label: "a11y", weight: 1, group: "front" },
  { label: "Node.js", weight: 2, group: "back" },
  { label: "Spring Boot", weight: 2, group: "back" },
  { label: "GraphQL", weight: 1, group: "back" },
  { label: "WebSocket", weight: 2, group: "back" },
  { label: "PostgreSQL", weight: 2, group: "back" },
  { label: "MongoDB", weight: 1, group: "back" },
  { label: "Kafka", weight: 1, group: "back" },
  { label: "Tool calling", weight: 3, group: "ai" },
  { label: "Agents", weight: 2, group: "ai" },
  { label: "RAG", weight: 1, group: "ai" },
  { label: "Streaming", weight: 2, group: "ai" },
  { label: "Anthropic API", weight: 2, group: "ai" },
  { label: "OpenAI API", weight: 1, group: "ai" },
  { label: "Docker", weight: 1, group: "ops" },
  { label: "AWS", weight: 1, group: "ops" },
  { label: "CI/CD", weight: 1, group: "ops" },
  { label: "Claude Code", weight: 2, group: "ops" },
];

export const log = [
  {
    when: "2024 — now",
    what: "Software Developer",
    where: "Brainstorm Force",
    note: "Products on 500K+ active sites. Era, SureEmails, SureRank, real-time dashboards, AI surfaces.",
  },
  {
    when: "2021 — 2024",
    what: "B.E. Computer Engineering",
    where: "Pune Institute of Computer Technology",
    note: "CGPA 8.7. Core contributor to Pulzion, PICT ACM's flagship event.",
  },
  {
    when: "2019 — 2021",
    what: "Diploma, Computer Engineering",
    where: "Shivaji Polytechnic, Solapur",
    note: "97.89%. College rank one.",
  },
  {
    when: "2020",
    what: "Winner, Avishkar",
    where: "Blind coding",
    note: "Compiled in the head, shipped without a screen.",
  },
];
