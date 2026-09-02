"use client";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { gsap, SplitText } from "@/lib/gsap";
import { person } from "@/lib/data";
import { useReducedMotion } from "@/lib/useReducedMotion";

const InkField = dynamic(() => import("./InkField"), { ssr: false });

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);
  const reveal = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      const split = new SplitText(".hero-title", { type: "chars, words", charsClass: "hero-char" });
      gsap.set(split.chars, { yPercent: 120, rotate: 6, opacity: 0 });
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.to(reveal, { current: 1.4, duration: reduced ? 0.01 : 2.0, ease: "power2.inOut" }, 0)
        .to(split.chars, { yPercent: 0, rotate: 0, opacity: 1, duration: 1.1, stagger: { each: 0.02, from: "start" } }, 0.1)
        .from(".hero-meta", { y: 14, opacity: 0, duration: 0.9, stagger: 0.06 }, 0.5)
        .from(".hero-rule", { scaleX: 0, duration: 1.2, ease: "expo.inOut" }, 0.3);

      gsap.to(".hero-title", {
        yPercent: -18, opacity: 0.15, ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-meta-wrap", {
        yPercent: -40, opacity: 0, ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "60% top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <section ref={root} id="top" className="relative flex h-[100svh] min-h-[640px] flex-col justify-end overflow-hidden" data-cursor="">
      <div className="absolute inset-0" aria-hidden>
        {!reduced && <InkField reveal={reveal} />}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,var(--ink),transparent_60%)] opacity-90" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[28%] bg-gradient-to-b from-[var(--ink)] to-transparent opacity-80" aria-hidden />

      <div className="hero-meta-wrap relative z-10 flex items-start justify-between px-5 pt-28 md:px-10">
        <p className="hero-meta mono max-w-[16ch] leading-relaxed">{person.role}<br />{person.location}</p>
        <p className="hero-meta mono hidden max-w-[28ch] text-right leading-relaxed md:block">
          Interfaces that hold up<br />at 500K+ sites. Built end to end.
        </p>
      </div>

      <div className="relative z-10 px-5 pb-8 md:px-10 md:pb-12">
        <div className="hero-rule mb-6 h-px w-full origin-left bg-[var(--hairline)]" />
        <h1 className="hero-title display text-[clamp(3.2rem,12.6vw,15rem)] text-[var(--bone)]" style={{ overflow: "hidden" }}>
          <span className="block">Harish</span>
          <span className="block">Sugandhi<span className="u-vermilion">.</span></span>
        </h1>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <p className="hero-meta serif-it max-w-[36ch] text-xl leading-snug text-[var(--bone-2)] md:text-2xl">
            Frontend engineer who treats render performance as a design material, and AI as an interface problem.
          </p>
          <div className="hero-meta flex flex-col items-end gap-2">
            <p className="mono flex items-center gap-3">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--vermilion)]" />
              Open to hard problems
            </p>
            <p className="mono hidden text-[var(--bone-3)] md:block">Move to stir the ink · click to drop some</p>
          </div>
        </div>
      </div>
    </section>
  );
}
