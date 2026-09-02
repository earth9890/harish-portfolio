export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string }
  | { type: "code"; lang: string; code: string }
  | { type: "ul"; items: string[] };

export type Post = {
  slug: string;
  title: string;
  dek: string;
  date: string;
  readingTime: number;
  tags: string[];
  seed: number;
  body: Block[];
};

export const posts: Post[] = [
  {
    slug: "streaming-ui-is-a-state-machine",
    title: "Streaming UI is a state machine, not a spinner",
    dek: "What building a chat surface for a live website taught me about optimistic rendering, partial results and the lie of “loading”.",
    date: "2025-11-14",
    readingTime: 7,
    tags: ["AI UX", "React", "Streaming"],
    seed: 7,
    body: [
      { type: "p", text: "The first version of Era’s chat panel had a spinner. You typed, the spinner spun, the answer arrived. It worked, and it felt dead. Nothing about it suggested a machine was thinking about *your* website." },
      { type: "p", text: "The fix wasn’t visual. It was accepting that a streamed response is a sequence of states the UI has to honour, and that each one deserves its own layout decision." },
      { type: "h2", text: "Five states, not two" },
      { type: "ul", items: ["Composing — the user is typing; the previous answer should visibly recede.", "Dispatched — the request left; show intent, not a spinner.", "Streaming text — tokens arrive; reserve height so the page doesn’t jump.", "Acting — a tool call is running; the page itself becomes the progress indicator.", "Settled — the answer is final; only now does the copy button appear."] },
      { type: "quote", text: "The page changing before the model finishes talking is the entire product." },
      { type: "h2", text: "Optimistic actions" },
      { type: "p", text: "When the model emits a tool call like `update_hero_copy`, we apply the change to the live preview immediately with a subtle pulse, and hold a reversible transaction until the server confirms. If confirmation fails, the pulse plays backwards. Users read this as “it tried”, which is honest." },
      { type: "code", lang: "ts", code: "const tx = preview.apply(call.args);          // instant, reversible\nconst ok = await server.confirm(call.id);\nif (!ok) tx.revert({ animate: \"reverse\" });" },
      { type: "p", text: "Render performance matters more here than anywhere else in the app: a streaming panel re-renders dozens of times a second. Memoised message rows, a single subscription per stream, and a `requestAnimationFrame` batcher for token appends kept the main thread under 4ms per frame on a mid-range laptop." },
    ],
  },
  {
    slug: "fifty-thousand-log-rows-at-sixty-fps",
    title: "Fifty thousand log rows at sixty frames",
    dek: "Notes from building the SureEmails dashboard: virtualization, faceted filters and the boring choices that made it fast.",
    date: "2025-08-02",
    readingTime: 6,
    tags: ["Performance", "React", "Dashboards"],
    seed: 3,
    body: [
      { type: "p", text: "An email log is the least glamorous screen in a product and the one support teams live in. It also grows without bound. This is how we kept it responsive." },
      { type: "h2", text: "Virtualize, but keep the DOM honest" },
      { type: "p", text: "Rows are windowed with a fixed-height estimate and a small overscan. Every row is an `<li>` inside a real `<ul>`, so screen readers still hear a list. Measured heights are cached per row id, not per index, so filtering doesn’t invalidate the cache." },
      { type: "h2", text: "Filters compute once" },
      { type: "p", text: "Facets are derived with a single pass over the dataset into a `Map<string, Set<number>>`. Combining filters is set intersection on row indices, which is orders of magnitude cheaper than re-filtering objects." },
      { type: "code", lang: "ts", code: "const byStatus = index.get(\"status\")!.get(\"failed\")!;\nconst byProvider = index.get(\"provider\")!.get(\"ses\")!;\nconst rows = intersect(byStatus, byProvider); // Set<number>" },
      { type: "quote", text: "Speed in a dashboard is a form of respect for the person on call." },
      { type: "p", text: "The live tail arrives over a WebSocket. Instead of prepending on every message, we buffer for one animation frame and prepend in a batch, which alone removed most layout thrash." },
    ],
  },
  {
    slug: "shaders-are-just-design-tokens",
    title: "Shaders are just design tokens with opinions",
    dek: "How I wire GLSL uniforms to CSS variables so the WebGL layer of a site respects the same theme as the buttons.",
    date: "2026-03-21",
    readingTime: 5,
    tags: ["WebGL", "Design systems", "Theming"],
    seed: 11,
    body: [
      { type: "p", text: "Most WebGL backgrounds are an island: hard-coded colours that ignore dark mode, brand updates and reduced-motion preferences. They look impressive for a week and then rot." },
      { type: "p", text: "The hero on this site reads its palette from CSS variables. The theme toggle animates a single `uLight` uniform from 0 to 1, and every colour in the fragment shader is a `mix()` between the two palettes. The shader has no idea what dark mode is; it just interpolates." },
      { type: "code", lang: "glsl", code: "vec3 ground = mix(INK, PAPER, uLight);\nvec3 line   = mix(BONE, INK,  uLight);\ncol = ground + line * contour * 0.5 + VERM * heat;" },
      { type: "h2", text: "Rules I keep" },
      { type: "ul", items: ["Cap device pixel ratio at 1.5 for full-screen fragments.", "One `pointermove` listener per page, shared through a tiny store.", "Pause the render loop when the canvas is off screen.", "Ship a static fallback for `prefers-reduced-motion`; it is not optional."] },
      { type: "quote", text: "If the shader can’t follow the theme, it isn’t part of the design system." },
    ],
  },
  {
    slug: "tool-calling-needs-a-ui-contract",
    title: "Tool calling needs a UI contract",
    dek: "Agents that act on a page must promise the interface three things: what they are about to do, what they did, and how to undo it.",
    date: "2026-06-09",
    readingTime: 8,
    tags: ["Agents", "AI UX", "Product"],
    seed: 19,
    body: [
      { type: "p", text: "A tool schema tells the model what it can call. It says nothing about what the human should see. Working on multi-step agent flows convinced me each tool needs a second contract, written for the UI." },
      { type: "h2", text: "The three promises" },
      { type: "ul", items: ["Intent — a one-line, human-readable preview rendered before execution.", "Receipt — a diff or summary rendered after execution, tied to the exact element that changed.", "Reversal — an undo that is one click and works for at least the current session."] },
      { type: "p", text: "In practice the receipt is the hardest. It has to be generated from the actual result, not from the model’s description of what it did, or you will eventually display a confident lie." },
      { type: "quote", text: "Trust in an agent is built one honest receipt at a time." },
      { type: "p", text: "We ended up with a small registry: every tool exports `describeIntent(args)` and `describeResult(result)`. The chat surface never renders raw tool JSON. That decision removed an entire category of support tickets." },
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
export const sortedPosts = [...posts].sort((a, b) => b.date.localeCompare(a.date));
export const fmtDate = (d: string) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(d));
