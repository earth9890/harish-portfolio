"use client";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const steps = [
  { n: "01", title: "Listen", it: "to the friction", copy: "Sit with support tickets, session replays and the people on call. Most “UI problems” are a missing state nobody designed for.", tag: "Discovery" },
  { n: "02", title: "Prototype", it: "in the browser", copy: "Static mocks lie about motion and latency. I build the risky interaction first, with real data, and throw most of it away.", tag: "Exploration" },
  { n: "03", title: "Ship", it: "behind a flag", copy: "Small releases, feature flags, measurable rollouts. Production is the only environment that tells the truth about performance.", tag: "Delivery" },
  { n: "04", title: "Measure", it: "then simplify", copy: "Frame budgets, error rates, task completion. If a feature doesn’t move a number a human cares about, it gets simpler or it goes.", tag: "Iteration" },
];

export default function Process() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const t = track.current!;
      const dist = () => t.scrollWidth - window.innerWidth;
      const tween = gsap.to(t, {
        x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      gsap.utils.toArray<HTMLElement>(".step").forEach((s) => {
        if (!s.querySelector(".step-num")) return;
        gsap.fromTo(s.querySelector(".step-num"), { xPercent: 20 }, { xPercent: -10, ease: "none", scrollTrigger: { trigger: s, containerAnimation: tween, start: "left 100%", end: "left 0%", scrub: true } });
        gsap.fromTo(s.querySelector(".step-line"), { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: s, containerAnimation: tween, start: "left 90%", end: "left 40%", scrub: true } });
      });
      gsap.to(".process-progress", { scaleX: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${dist()}`, scrub: true } });
      return () => ScrollTrigger.getAll().forEach((st) => st.trigger === root.current && st.kill());
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="process" className="relative overflow-hidden border-t hairline bg-[var(--ink-2)]">
      <div className="absolute inset-x-5 top-6 z-10 flex items-center justify-between md:inset-x-10 md:top-8">
        <p className="mono">03 / Process</p>
        <p className="mono hidden md:block">Scroll to travel →</p>
      </div>
      <div className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-[var(--vermilion)] process-progress" aria-hidden />
      <div ref={track} className="flex flex-col md:h-[100svh] md:flex-row md:items-center">
        <div className="step flex shrink-0 flex-col justify-center px-5 pb-8 pt-24 md:h-full md:w-[60vw] md:px-10 md:pb-0 md:pt-0">
          <h2 className="display text-[clamp(2.8rem,9vw,10rem)] text-[var(--bone)]">How the<br /><span className="serif-it font-normal tracking-normal text-[var(--bone-2)]">work gets made</span></h2>
          <p className="mt-6 max-w-[40ch] text-lg text-[var(--bone-2)]">Four moves, repeated. Nothing clever, applied stubbornly.</p>
        </div>
        {steps.map((s) => (
          <article key={s.n} className="step relative flex shrink-0 flex-col justify-center border-t hairline px-5 py-12 md:h-full md:w-[70vw] md:border-l md:border-t-0 md:px-14 md:py-0 lg:w-[52vw]">
            <span className="step-num display pointer-events-none absolute bottom-4 right-6 z-0 text-[clamp(7rem,24vw,24rem)] leading-none text-[var(--bone)] opacity-[0.05] md:right-10" aria-hidden>{s.n}</span>
            <div className="relative z-10">
              <p className="mono">{s.n} · {s.tag}</p>
              <h3 className="display mt-6 max-w-[12ch] text-balance text-[clamp(2.4rem,6vw,6.5rem)] text-[var(--bone)]">{s.title} <span className="serif-it font-normal tracking-normal text-[var(--vermilion)]">{s.it}</span></h3>
              <span className="step-line my-8 block h-px w-full max-w-md origin-left bg-[var(--hairline-strong)]" />
              <p className="max-w-[44ch] text-lg leading-relaxed text-[var(--bone-2)] md:text-xl">{s.copy}</p>
            </div>
          </article>
        ))}
        <div className="step flex shrink-0 items-center px-5 py-12 md:h-full md:w-[40vw] md:px-14">
          <p className="serif-it text-[clamp(1.8rem,3.5vw,3.4rem)] leading-tight text-[var(--bone)]">Then we ship again,<br />a little quieter each time.</p>
        </div>
      </div>
    </section>
  );
}
