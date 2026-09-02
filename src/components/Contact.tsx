"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, SplitText } from "@/lib/gsap";
import { person } from "@/lib/data";
import Magnetic from "./Magnetic";

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const split = new SplitText(".contact-title", { type: "chars" });
      gsap.from(split.chars, { yPercent: 110, opacity: 0, stagger: 0.02, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 65%" } });
      gsap.to(".contact-bg", { yPercent: -20, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true } });
    }, root);
    return () => ctx.revert();
  }, []);

  const copy = async () => {
    try { await navigator.clipboard.writeText(person.email); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { window.location.href = `mailto:${person.email}`; }
  };

  return (
    <section ref={root} id="contact" className="relative overflow-hidden border-t hairline">
      <div className="contact-bg pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_120%,rgba(255,74,28,0.22),transparent_70%)]" aria-hidden />
      <div className="section relative">
        <p className="mono">07 / Contact</p>
        <h2 className="contact-title display mt-6 text-[clamp(3rem,13vw,16rem)] text-[var(--bone)]" style={{ overflow: "hidden" }}>
          Let&apos;s build<br />something <span className="serif-it font-normal tracking-normal text-[var(--vermilion)]">unreasonable</span>
        </h2>
        <div className="mt-14 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <Magnetic strength={0.2}>
            <button onClick={copy} data-cursor={copied ? "Copied" : "Copy"} className="group relative flex items-center gap-4 border hairline px-7 py-5 text-left transition-colors hover:border-[var(--vermilion)]">
              <span className="text-lg text-[var(--bone)] md:text-2xl">{person.email}</span>
              <span className="mono text-[var(--vermilion)]">{copied ? "copied" : "copy"}</span>
              <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[var(--vermilion)] transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-x-100" />
            </button>
          </Magnetic>
          <ul className="flex gap-8">
            {person.links.map((l) => (
              <li key={l.label}>
                <Magnetic strength={0.3}>
                  <a href={l.href} target="_blank" rel="noreferrer" data-cursor="↗" className="mono block py-2 text-[var(--bone)] hover:text-[var(--vermilion)]">{l.label}</a>
                </Magnetic>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="marquee border-t hairline py-4" aria-hidden>
        <div className="marquee__track" style={{ "--dur": "36s" } as React.CSSProperties}>
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="display flex gap-12 text-[clamp(1.6rem,3.6vw,3.4rem)] text-[var(--bone-3)]">
              <span>React</span><span className="u-vermilion">·</span><span>Next.js</span><span className="u-vermilion">·</span><span>WebGL</span><span className="u-vermilion">·</span><span>Agents</span><span className="u-vermilion">·</span><span>Render perf</span><span className="u-vermilion">·</span><span>Pune</span><span className="u-vermilion">·</span>
            </span>
          ))}
        </div>
      </div>
      <footer className="mono flex flex-wrap items-center justify-between gap-3 px-5 py-6 md:px-10">
        <span>© {new Date().getFullYear()} {person.name}</span>
        <span>{person.coords}</span>
        <span>Built with Next.js · three.js · GSAP · no templates</span>
      </footer>
    </section>
  );
}
