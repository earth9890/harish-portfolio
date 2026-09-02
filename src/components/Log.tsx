"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { log } from "@/lib/data";

export default function Log() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".log-row").forEach((row) => {
        gsap.from(row, { opacity: 0, y: 24, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: row, start: "top 88%" } });
        gsap.from(row.querySelector(".log-rule"), { scaleX: 0, duration: 1.2, ease: "expo.inOut", scrollTrigger: { trigger: row, start: "top 88%" } });
      });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={root} id="log" className="section">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <p className="mono">06 / Log</p>
          <p className="serif-it mt-6 text-2xl text-[var(--bone-2)]">A short history, in reverse.</p>
        </div>
        <ol className="md:col-span-9">
          {log.map((l) => (
            <li key={l.what} className="log-row group relative grid gap-3 py-7 md:grid-cols-12 md:items-baseline" data-cursor="">
              <span className="log-rule absolute inset-x-0 top-0 h-px origin-left bg-[var(--hairline)]" />
              <span className="mono md:col-span-2 tabular-nums">{l.when}</span>
              <span className="md:col-span-4">
                <span className="block text-[clamp(1.4rem,2.2vw,2rem)] leading-tight tracking-tight text-[var(--bone)] transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-2">{l.what}</span>
                <span className="mono mt-1 block normal-case tracking-normal">{l.where}</span>
              </span>
              <span className="text-[var(--bone-2)] md:col-span-6 md:pl-8">{l.note}</span>
            </li>
          ))}
          <li className="relative h-px bg-[var(--hairline)]" aria-hidden />
        </ol>
      </div>
    </section>
  );
}
