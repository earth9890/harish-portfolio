"use client";
import { useEffect, useRef } from "react";
import { gsap, SplitText } from "@/lib/gsap";

const lines = [
  "I build the parts of software people actually touch.",
  "Two years shipping React and Next.js into products that run on half a million sites, where a dropped frame is a bug report and a settings page is a promise.",
  "Lately that means AI-native surfaces: streaming responses, agents that act on a live page, and interfaces that explain what a model just did.",
];

export default function Manifesto() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const paras = gsap.utils.toArray<HTMLElement>(".mani-p");
      paras.forEach((p) => {
        const split = new SplitText(p, { type: "words" });
        gsap.fromTo(split.words, { opacity: 0.12, color: "var(--bone-3)" }, {
          opacity: 1, color: "var(--bone)", stagger: 0.06, ease: "none",
          scrollTrigger: { trigger: p, start: "top 78%", end: "bottom 45%", scrub: 0.4 },
        });
      });
      gsap.fromTo(".mani-side", { yPercent: 30 }, { yPercent: -30, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
      gsap.to(".mani-num", { textContent: 500, snap: { textContent: 1 }, ease: "power1.out", duration: 2, scrollTrigger: { trigger: ".mani-num", start: "top 85%" } });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="about" className="section grid gap-12 md:grid-cols-12">
      <div className="mani-side md:col-span-3">
        <p className="mono">01 / About</p>
        <p className="mt-10 hidden md:block">
          <span className="display block text-[clamp(3rem,6vw,7rem)] text-[var(--bone)]"><span className="mani-num">0</span>K<span className="u-vermilion">+</span></span>
          <span className="mono block mt-2">active sites running<br />interfaces I shipped</span>
        </p>
      </div>
      <div className="md:col-span-9 md:col-start-4">
        {lines.map((l, i) => (
          <p key={i} className={`mani-p text-balance ${i === 0 ? "display text-[clamp(2.2rem,5.2vw,5.6rem)] leading-[0.95]" : "mt-10 text-[clamp(1.35rem,2.4vw,2.4rem)] leading-[1.25] tracking-tight"}`}>
            {l}
          </p>
        ))}
        <div className="mt-16 grid grid-cols-2 gap-8 border-t hairline pt-8 md:grid-cols-4">
          {[["React · Next.js", "Component architecture, render perf"], ["WebGL · Canvas", "Shaders, motion systems"], ["Node · Spring", "REST, WebSocket, GraphQL"], ["LLM tooling", "Tool calling, agents, streaming"]].map(([a, b]) => (
            <div key={a}>
              <p className="text-[var(--bone)]">{a}</p>
              <p className="mono mt-2 normal-case tracking-normal">{b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
