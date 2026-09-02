"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { projects } from "@/lib/data";

const extra: Record<string, { problem: string; approach: string; result: string; highlights: string[] }> = {
  era: { problem: "People know what they want their site to say; they do not want to learn a page builder to say it.", approach: "A streaming chat surface wired to a tool-calling agent that edits the live preview. Every action renders an intent line before it runs and a receipt after.", result: "Edits appear before the model finishes its sentence. Undo is one click and survives the session.", highlights: ["Optimistic, reversible tool transactions", "Token batching under one frame", "Receipts generated from real results, never model prose"] },
  suremails: { problem: "Support engineers were tailing server logs to find out why one email didn’t arrive.", approach: "A React dashboard with a virtualized, faceted log, live tail over WebSockets and status timelines per message. I owned the REST surface end to end.", result: "Fifty thousand rows stay at sixty frames. Filter changes are set intersections, not re-scans.", highlights: ["Row-id height cache", "Set-based facet index", "Frame-batched live tail"] },
  surerank: { problem: "SEO tooling tells you what is wrong in a language only SEOs speak.", approach: "An editor-side workbench that analyses content, proposes rewrites and previews structured data, and explains every change it suggests.", result: "Audits that took an afternoon take a coffee.", highlights: ["Explainable suggestions", "schema.org live preview", "Inline diffing of meta rewrites"] },
  basket: { problem: "A demo store that behaves like a real one, including the boring guarantees.", approach: "React storefront, Node/Express API, MongoDB with atomic decrements on checkout, Braintree for payment, JWT roles for admin.", result: "Zero double-sells across load tests that tried very hard.", highlights: ["Atomic inventory", "Role-based admin", "Order confirmation flow"] },
  stream: { problem: "Analytics that arrive a minute late are trivia.", approach: "Kafka producer/consumer backbone behind Spring Boot, live metrics streamed to a Next.js dashboard, indexed Postgres for history.", result: "Horizontally scalable, survives a dead consumer without dropping the dashboard.", highlights: ["Producer / consumer isolation", "WebSocket metric stream", "Docker-reproducible deploys"] },
  atlas: { problem: "Five dashboards, five slightly different buttons, five easing curves.", approach: "A token set, a component library and a tiny choreography API so motion is a shared vocabulary rather than a per-team opinion.", result: "New surfaces ship with the house feel on day one.", highlights: ["Design tokens as CSS variables", "Motion presets", "Storybook-driven review"] },
};

export default function ProjectSheet({ index, onClose, onNav }: { index: number | null; onClose: () => void; onNav: (i: number) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const open = index !== null;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    if (open) {
      lenis?.stop(); document.body.style.overflow = "hidden";
      gsap.fromTo(el, { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: 0.8, ease: "expo.inOut" });
      gsap.fromTo(el.querySelectorAll(".sheet-anim"), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease: "expo.out", delay: 0.4 });
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
      window.addEventListener("keydown", onKey);
      return () => { window.removeEventListener("keydown", onKey); lenis?.start(); document.body.style.overflow = ""; };
    }
  }, [open, index, onClose]);

  if (!open) return null;
  const p = projects[index];
  const x = extra[p.id];
  const next = (index + 1) % projects.length;

  return (
    <div className="fixed inset-0 z-[85]" role="dialog" aria-modal aria-label={`${p.title} case study`}>
      <button className="absolute inset-0 bg-[color-mix(in_srgb,var(--ink)_60%,transparent)] backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div ref={root} className="absolute inset-y-0 right-0 w-full max-w-3xl overflow-y-auto border-l border-[var(--hairline-strong)] bg-[var(--ink)] px-6 py-8 md:px-12 md:py-12" data-lenis-prevent style={{ clipPath: "inset(0 0 0 100%)" }}>
        <div className="sheet-anim flex items-center justify-between">
          <p className="mono">{p.index} — {p.year} · {p.kicker}</p>
          <button onClick={onClose} className="mono ul" data-cursor="Close">Close ×</button>
        </div>
        <h3 className="sheet-anim display mt-8 text-[clamp(3rem,8vw,7rem)] text-[var(--bone)]">{p.title}</h3>
        <div className="sheet-anim mt-8 grid gap-6 border-y hairline py-6 md:grid-cols-3">
          <div><p className="display text-4xl text-[var(--vermilion)]">{p.metric.value}</p><p className="mono mt-1">{p.metric.label}</p></div>
          <div className="md:col-span-2"><p className="mono">Stack</p><p className="mt-2 text-[var(--bone)]">{p.stack.join(" · ")}</p></div>
        </div>
        {[["Problem", x.problem], ["Approach", x.approach], ["Result", x.result]].map(([h, t]) => (
          <div key={h} className="sheet-anim mt-10 grid gap-3 md:grid-cols-12">
            <p className="mono md:col-span-3">{h}</p>
            <p className="text-lg leading-relaxed text-[var(--bone-2)] md:col-span-9">{t}</p>
          </div>
        ))}
        <ul className="sheet-anim mt-10 border-t hairline">
          {x.highlights.map((h) => <li key={h} className="flex items-baseline gap-4 border-b hairline py-4 text-[var(--bone)]"><span className="u-vermilion">—</span>{h}</li>)}
        </ul>
        <p className="sheet-anim mono mt-8 text-[var(--bone-3)]">Case study copy is illustrative; numbers are representative of the class of work, not audited metrics.</p>
        <button onClick={() => onNav(next)} className="sheet-anim group mt-12 block w-full text-left" data-cursor="Next">
          <span className="mono">Next</span>
          <span className="display block text-[clamp(2rem,5vw,4rem)] text-[var(--bone)] transition-transform duration-700 ease-[var(--ease-out)] group-hover:translate-x-3">{projects[next].title} →</span>
        </button>
      </div>
    </div>
  );
}
