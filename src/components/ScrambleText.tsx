"use client";
import { useEffect, useRef } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}—=+*^?#";

export default function ScrambleText({ text, className = "", delay = 0, trigger = true }: { text: string; className?: string; delay?: number; trigger?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!trigger) return;
    const el = ref.current!;
    let frame = 0, raf = 0;
    const queue = text.split("").map((ch, i) => ({ ch, start: i * 2 + Math.random() * 6, end: i * 2 + 10 + Math.random() * 10 }));
    const step = () => {
      let out = "", done = 0;
      for (const q of queue) {
        if (frame >= q.end) { out += q.ch; done++; }
        else if (frame >= q.start) out += q.ch === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        else out += " ";
      }
      el.textContent = out;
      frame++;
      if (done < queue.length) raf = requestAnimationFrame(step);
    };
    const t = setTimeout(() => { raf = requestAnimationFrame(step); }, delay);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [text, delay, trigger]);
  return <span ref={ref} className={className} aria-label={text}>{" ".repeat(text.length)}</span>;
}
