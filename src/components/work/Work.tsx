"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "@/lib/gsap";
import { projects } from "@/lib/data";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { RingApi } from "./WorkRing";
import ProjectSheet from "./ProjectSheet";

const WorkRing = dynamic(() => import("./WorkRing"), { ssr: false });

export default function Work() {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [hinted, setHinted] = useState(false);
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const api = useRef<RingApi | null>(null);
  const reduced = useReducedMotion();

  const onActive = useCallback((i: number) => setActive(i), []);
  const onFirstDrag = useCallback(() => setHinted(true), []);
  const onSelect = useCallback((i: number) => setOpen(i), []);

  useEffect(() => {
    if (!panel.current) return;
    gsap.fromTo(panel.current.querySelectorAll(".wp-anim"), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: "expo.out", overwrite: true });
  }, [active]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".work-head", { yPercent: 40, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 70%" } });
    }, root);
    return () => ctx.revert();
  }, []);

  const p = projects[active];

  return (
    <section ref={root} id="work" className="relative overflow-hidden border-t hairline">
      <div className="section pb-0">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="mono">02 / Selected work</p>
            <h2 className="work-head display mt-4 text-[clamp(2.8rem,8vw,9rem)] text-[var(--bone)]">Things<br /><span className="serif-it font-normal tracking-normal text-[var(--bone-2)]">I shipped</span></h2>
          </div>
          <p className="mono hidden text-right leading-relaxed md:block">Six projects on a ring.<br />Drag it. Click the front card.</p>
        </div>
      </div>

      <div className="relative h-[70svh] min-h-[520px]">
        {reduced ? (
          <ul className="grid gap-6 px-5 py-10 md:grid-cols-3 md:px-10">
            {projects.map((pr, i) => (
              <li key={pr.id} className="border hairline p-6">
                <p className="mono">{pr.index} · {pr.year}</p>
                <h3 className="display mt-3 text-3xl">{pr.title}</h3>
                <p className="mt-2 text-[var(--bone-2)]">{pr.blurb}</p>
                <button onClick={() => setOpen(i)} className="btn mt-5">Details</button>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <WorkRing onActive={onActive} apiRef={api} onSelect={onSelect} onFirstDrag={onFirstDrag} />
            {/* drag affordance */}
            <div className={`pointer-events-none absolute inset-x-0 bottom-8 flex justify-center transition-opacity duration-700 ${hinted ? "opacity-0" : "opacity-100"}`} aria-hidden>
              <div className="flex items-center gap-4 border border-[var(--hairline-strong)] bg-[color-mix(in_srgb,var(--ink)_75%,transparent)] px-5 py-3 backdrop-blur-md">
                <span className="drag-hint__arrow mono text-[var(--vermilion)]">◀</span>
                <span className="mono text-[var(--bone)]">Drag to spin · click front card</span>
                <span className="drag-hint__arrow mono text-[var(--vermilion)]" style={{ animationDirection: "alternate-reverse" }}>▶</span>
              </div>
            </div>
            {/* prev / next */}
            <div className="absolute inset-y-0 left-3 flex items-center md:left-8">
              <button onClick={() => api.current?.step(-1)} className="btn h-12 w-12 justify-center !p-0" aria-label="Previous project" data-cursor="Prev">←</button>
            </div>
            <div className="absolute inset-y-0 right-3 flex items-center md:right-8">
              <button onClick={() => api.current?.step(1)} className="btn h-12 w-12 justify-center !p-0" aria-label="Next project" data-cursor="Next">→</button>
            </div>
          </>
        )}
      </div>

      {!reduced && (
        <div ref={panel} className="grid gap-8 px-5 pb-24 md:grid-cols-12 md:px-10" aria-live="polite">
          <div className="md:col-span-4">
            <p className="wp-anim mono">{p.index} — {p.year}</p>
            <h3 className="wp-anim display mt-3 text-[clamp(2.4rem,5vw,5rem)] text-[var(--bone)]">{p.title}</h3>
            <p className="wp-anim serif-it mt-2 text-2xl text-[var(--bone-2)]">{p.kicker}</p>
            <button onClick={() => setOpen(active)} className="wp-anim btn mt-6" data-cursor="Open">Open case study <span aria-hidden>↗</span></button>
          </div>
          <div className="md:col-span-5">
            <p className="wp-anim text-lg leading-relaxed text-[var(--bone-2)]">{p.blurb}</p>
            <ul className="wp-anim mt-6 flex flex-wrap gap-2">
              {p.stack.map((s) => <li key={s} className="mono border hairline px-3 py-1.5 text-[var(--bone)]">{s}</li>)}
            </ul>
          </div>
          <div className="md:col-span-3 md:text-right">
            <p className="wp-anim display text-[clamp(3rem,6vw,6rem)] text-[var(--vermilion)]">{p.metric.value}</p>
            <p className="wp-anim mono mt-1">{p.metric.label}</p>
            <div className="wp-anim mt-8 flex gap-1.5 md:justify-end">
              {projects.map((pr, i) => (
                <button key={pr.id} onClick={() => api.current?.snapTo(i)} aria-label={`Go to ${pr.title}`} data-cursor={pr.title} className="group py-2">
                  <span className={`block h-px w-7 transition-[background,transform] duration-500 group-hover:scale-y-[3] ${i === active ? "bg-[var(--vermilion)]" : "bg-[var(--hairline-strong)]"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <ProjectSheet index={open} onClose={() => setOpen(null)} onNav={(i) => { setOpen(i); api.current?.snapTo(i); }} />
    </section>
  );
}
