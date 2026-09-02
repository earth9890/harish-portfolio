"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    document.body.classList.add("has-cursor");
    const d = dot.current!, r = ring.current!, l = label.current!;
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { x: pos.x, y: pos.y };
    let hovering = false;

    const move = (e: PointerEvent) => {
      pos.x = e.clientX; pos.y = e.clientY;
      const t = (e.target as HTMLElement)?.closest?.("[data-cursor]") as HTMLElement | null;
      const text = t?.dataset.cursor ?? "";
      const want = !!t;
      if (want !== hovering) {
        hovering = want;
        gsap.to(r, { scale: want ? 2.6 : 1, borderColor: want ? "rgba(255,74,28,0.9)" : "rgba(236,228,211,0.6)", duration: 0.5, ease: "expo.out" });
        gsap.to(d, { scale: want ? 0 : 1, duration: 0.3, ease: "expo.out" });
      }
      l.textContent = text;
      l.style.opacity = text ? "1" : "0";
    };
    const down = () => gsap.to(r, { scale: hovering ? 2.2 : 0.7, duration: 0.2 });
    const up = () => gsap.to(r, { scale: hovering ? 2.6 : 1, duration: 0.4, ease: "expo.out" });

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      d.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%,-50%)`;
      r.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%,-50%) scale(var(--s,1))`;
      l.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y + 34}px, 0) translate(-50%,0)`;
    };
    gsap.ticker.add(loop);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      gsap.ticker.remove(loop);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.body.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div ref={dot} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90] h-1.5 w-1.5 rounded-full bg-[var(--vermilion)]" />
      <div ref={ring} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90] h-8 w-8 rounded-full border border-[rgba(236,228,211,0.6)] mix-blend-difference" />
      <div ref={label} aria-hidden className="mono pointer-events-none fixed left-0 top-0 z-[90] text-[var(--bone)] opacity-0 transition-opacity" style={{ fontSize: 10 }} />
    </>
  );
}
