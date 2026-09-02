"use client";
import { useEffect, useRef } from "react";
import { skills } from "@/lib/data";
import { gsap } from "@/lib/gsap";
import { readPalette } from "@/lib/theme";

type Body = { x: number; y: number; px: number; py: number; r: number; label: string; group: string; weight: number; glow: number };

const LEGEND: Record<string, string> = { front: "var(--bone)", back: "var(--brass)", ai: "var(--vermilion)", ops: "var(--teal)" };

export default function GravityWell() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current!, el = wrap.current!;
    const ctx = cv.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, dpr = 1, raf = 0, running = false;
    const mouse = { x: -9999, y: -9999, down: false, inside: false };
    const waves: { x: number; y: number; r: number; a: number }[] = [];
    let bodies: Body[] = [];
    let pal = readPalette();
    let GROUP_COLOR: Record<string, string> = { front: pal.bone, back: pal.brass, ai: pal.vermilion, ops: pal.teal };
    const onTheme = () => { pal = readPalette(); GROUP_COLOR = { front: pal.bone, back: pal.brass, ai: pal.vermilion, ops: pal.teal }; };
    window.addEventListener("hs-theme", onTheme);

    const measure = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = el.clientWidth; H = el.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = `${W}px`; cv.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = "500 12px 'IBM Plex Mono', monospace";
      const scale = Math.min(1, W / 1100);
      bodies = skills.map((s) => {
        const tw = ctx.measureText(s.label.toUpperCase()).width;
        const r = (tw / 2 + 18 + s.weight * 6) * Math.max(0.7, scale);
        const x = r + Math.random() * (W - r * 2), y = r + Math.random() * (H - r * 2);
        return { x, y, px: x - (Math.random() - 0.5), py: y - (Math.random() - 0.5), r, label: s.label, group: s.group, weight: s.weight, glow: 0 };
      });
    };

    const stepPhysics = () => {
      const cx = W / 2, cy = H / 2;
      for (const b of bodies) {
        let vx = (b.x - b.px) * 0.985, vy = (b.y - b.py) * 0.985;
        // gentle pull to center so the cloud stays a cloud
        vx += (cx - b.x) * 0.00035; vy += (cy - b.y) * 0.00035;
        // cursor gravity
        if (mouse.inside) {
          const dx = mouse.x - b.x, dy = mouse.y - b.y, d2 = dx * dx + dy * dy, d = Math.sqrt(d2) + 1;
          const f = Math.min(0.9, 2600 / d2) * (mouse.down ? -2.4 : 1);
          vx += (dx / d) * f; vy += (dy / d) * f;
          b.glow += ((d < 160 ? 1 : 0) - b.glow) * 0.12;
        } else b.glow *= 0.9;
        b.px = b.x; b.py = b.y; b.x += vx; b.y += vy;
      }
      // separation
      for (let k = 0; k < 2; k++) for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], b = bodies[j];
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.001, min = a.r + b.r + 6;
        if (d < min) { const o = (min - d) / 2, nx = dx / d, ny = dy / d; a.x -= nx * o; a.y -= ny * o; b.x += nx * o; b.y += ny * o; }
      }
      for (const b of bodies) {
        if (b.x < b.r) { b.x = b.r; b.px = b.x + (b.x - b.px) * 0.5; }
        if (b.x > W - b.r) { b.x = W - b.r; b.px = b.x + (b.x - b.px) * 0.5; }
        if (b.y < b.r) { b.y = b.r; b.py = b.y + (b.y - b.py) * 0.5; }
        if (b.y > H - b.r) { b.y = H - b.r; b.py = b.y + (b.y - b.py) * 0.5; }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      // connective threads between near bodies
      ctx.lineWidth = 1;
      for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], b = bodies[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 180 && a.group === b.group) {
          ctx.strokeStyle = pal.isLight ? `rgba(20,18,16,${(1 - d / 180) * 0.18})` : `rgba(236,228,211,${(1 - d / 180) * 0.16})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      // shockwaves
      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i]; w.r += 9; w.a *= 0.94;
        ctx.strokeStyle = `rgba(255,74,28,${w.a})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2); ctx.stroke();
        if (w.a < 0.02) waves.splice(i, 1);
      }
      for (const b of bodies) {
        const col = GROUP_COLOR[b.group];
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.group === "ai" ? `rgba(255,74,28,${0.08 + b.glow * 0.5})` : (pal.isLight ? "rgba(241,235,223,0.92)" : "rgba(20,18,15,0.85)");
        ctx.fill();
        ctx.lineWidth = b.weight >= 3 ? 1.5 : 1;
        ctx.strokeStyle = b.glow > 0.05 ? `rgba(255,74,28,${0.4 + b.glow * 0.6})` : `${col}${b.weight >= 2 ? "66" : "33"}`;
        ctx.stroke();
        ctx.fillStyle = b.glow > 0.3 && b.group === "ai" ? (pal.isLight ? "#f1ebdf" : "#0a0908") : col;
        ctx.font = `500 ${b.weight >= 3 ? 13 : 11}px 'IBM Plex Mono', monospace`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(b.label.toUpperCase(), b.x, b.y + 0.5);
      }
      // cursor well
      if (mouse.inside) {
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 140);
        g.addColorStop(0, mouse.down ? "rgba(255,74,28,0.18)" : (pal.isLight ? "rgba(20,18,16,0.06)" : "rgba(236,228,211,0.07)")); g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g; ctx.fillRect(mouse.x - 140, mouse.y - 140, 280, 280);
      }
    };

    const loop = () => { if (!reduced) stepPhysics(); draw(); raf = requestAnimationFrame(loop); };
    const start = () => { if (!running) { running = true; raf = requestAnimationFrame(loop); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    measure();
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.05 });
    io.observe(el);
    const ro = new ResizeObserver(measure); ro.observe(el);

    const rect = () => cv.getBoundingClientRect();
    const pm = (e: PointerEvent) => { const r = rect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.inside = true; };
    const pl = () => { mouse.inside = false; mouse.down = false; };
    const pd = (e: PointerEvent) => { mouse.down = true; const r = rect(); waves.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 10, a: 0.8 }); };
    const pu = () => { mouse.down = false; };
    cv.addEventListener("pointermove", pm); cv.addEventListener("pointerleave", pl); cv.addEventListener("pointerdown", pd); window.addEventListener("pointerup", pu);
    return () => { stop(); io.disconnect(); ro.disconnect(); window.removeEventListener("hs-theme", onTheme); cv.removeEventListener("pointermove", pm); cv.removeEventListener("pointerleave", pl); cv.removeEventListener("pointerdown", pd); window.removeEventListener("pointerup", pu); };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".craft-head", { yPercent: 40, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: wrap.current, start: "top 80%" } });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="craft" className="section border-t hairline pb-0">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mono">04 / Craft</p>
          <h2 className="craft-head display mt-4 text-[clamp(2.8rem,8vw,9rem)] text-[var(--bone)]">Gravity<br /><span className="serif-it font-normal tracking-normal text-[var(--bone-2)]">well</span></h2>
        </div>
        <ul className="mono flex flex-wrap gap-5">
          {Object.entries(LEGEND).map(([k, c]) => (
            <li key={k} className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full" style={{ background: c }} />{{ front: "Frontend", back: "Backend", ai: "AI systems", ops: "Ops & tools" }[k]}</li>
          ))}
        </ul>
      </div>
      <div ref={wrap} className="relative -mx-5 h-[72svh] min-h-[520px] border-y hairline md:-mx-10" data-cursor="Pull · click to push">
        <canvas ref={canvas} className="block h-full w-full touch-none" role="img" aria-label="Interactive cloud of skills: React, Next.js, TypeScript, WebGL, Node, Spring Boot, PostgreSQL, LLM tool calling, agents, Docker, AWS and more." />
        <p className="mono pointer-events-none absolute bottom-4 left-5 md:left-10">Move to attract · hold to repel</p>
      </div>
    </section>
  );
}
