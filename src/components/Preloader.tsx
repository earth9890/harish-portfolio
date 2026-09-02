"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import ScrambleText from "./ScrambleText";

export default function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const counter = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => { setGone(true); onDone(); },
    });
    tl.to(counter, {
      v: 100, duration: reduced ? 0.2 : 1.1, ease: "power3.inOut",
      onUpdate: () => { if (num.current) num.current.textContent = String(Math.round(counter.v)).padStart(3, "0"); },
    })
      .to(bar.current, { scaleX: 1, duration: reduced ? 0.2 : 1.1, ease: "power3.inOut" }, 0)
      .to(".pre-line", { yPercent: -110, duration: 0.5, ease: "expo.in", stagger: 0.03 }, "+=0.05")
      .to(root.current, { clipPath: "inset(0 0 100% 0)", duration: reduced ? 0.2 : 0.9, ease: "expo.inOut" }, "-=0.3");
    return () => { tl.kill(); };
  }, [onDone]);

  if (gone) return null;
  return (
    <div ref={root} className="fixed inset-0 z-[100] flex flex-col justify-between bg-[var(--ink)] p-6 md:p-10" style={{ clipPath: "inset(0 0 0% 0)" }} aria-hidden>
      <div className="flex items-start justify-between">
        <span className="line-mask mono"><span className="pre-line"><ScrambleText text="HARISH SUGANDHI" /></span></span>
        <span className="line-mask mono"><span className="pre-line"><ScrambleText text="PUNE · 18.52N 73.85E" delay={150} /></span></span>
      </div>
      <div className="flex items-end justify-between">
        <span className="line-mask"><span className="pre-line display text-[clamp(4rem,14vw,12rem)] tabular-nums text-[var(--bone)]" ref={num as unknown as React.RefObject<HTMLSpanElement>}>000</span></span>
        <span className="line-mask mono"><span className="pre-line serif-it normal-case tracking-normal text-2xl text-[var(--bone-2)]">calibrating the darkroom</span></span>
      </div>
      <div ref={bar} className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-[var(--vermilion)]" />
    </div>
  );
}
