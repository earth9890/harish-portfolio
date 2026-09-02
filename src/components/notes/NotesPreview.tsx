"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import { sortedPosts, fmtDate } from "@/lib/posts";
import NoteArt from "./NoteArt";

export default function NotesPreview() {
  const root = useRef<HTMLElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const active = useRef<number>(-1);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".notes-head", { yPercent: 40, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 70%" } });
      gsap.utils.toArray<HTMLElement>(".note-row").forEach((row, i) => {
        gsap.from(row, { opacity: 0, y: 24, duration: 0.9, delay: i * 0.05, ease: "expo.out", scrollTrigger: { trigger: row, start: "top 90%" } });
      });
    }, root);
    const pv = preview.current!;
    const pos = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    const move = (e: PointerEvent) => { pos.x = e.clientX; pos.y = e.clientY; };
    const loop = () => {
      cur.x += (pos.x - cur.x) * 0.12; cur.y += (pos.y - cur.y) * 0.12;
      pv.style.transform = `translate3d(${cur.x + 24}px, ${cur.y - 90}px, 0) rotate(${(pos.x - cur.x) * 0.04}deg)`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    gsap.ticker.add(loop);
    return () => { ctx.revert(); window.removeEventListener("pointermove", move); gsap.ticker.remove(loop); };
  }, []);

  const show = (i: number) => {
    active.current = i;
    const pv = preview.current!;
    pv.querySelectorAll<HTMLElement>(".note-art").forEach((el, k) => { el.style.opacity = k === i ? "1" : "0"; });
    gsap.to(pv, { opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" });
  };
  const hide = () => { active.current = -1; gsap.to(preview.current, { opacity: 0, scale: 0.9, duration: 0.4, ease: "expo.out" }); };

  return (
    <section ref={root} id="notes" className="section border-t hairline">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mono">05 / Notes</p>
          <h2 className="notes-head display mt-4 text-[clamp(2.8rem,8vw,9rem)] text-[var(--bone)]">Field<br /><span className="serif-it font-normal tracking-normal text-[var(--bone-2)]">notes</span></h2>
        </div>
        <Link href="/notes" className="btn" data-cursor="All">All notes <span aria-hidden>→</span></Link>
      </div>

      <ol className="mt-16 border-t hairline">
        {sortedPosts.slice(0, 3).map((p, i) => (
          <li key={p.slug} className="note-row border-b hairline">
            <Link href={`/notes/${p.slug}`} className="group grid gap-3 py-7 md:grid-cols-12 md:items-baseline" data-cursor="Read" onPointerEnter={() => show(i)} onPointerLeave={hide}>
              <span className="mono md:col-span-2 tabular-nums">{fmtDate(p.date)}</span>
              <span className="md:col-span-7">
                <span className="block text-[clamp(1.5rem,2.6vw,2.4rem)] leading-[1.05] tracking-tight text-[var(--bone)] transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-3">{p.title}</span>
                <span className="mt-2 block max-w-[60ch] text-[var(--bone-2)]">{p.dek}</span>
              </span>
              <span className="mono flex flex-wrap gap-x-3 md:col-span-3 md:justify-end md:text-right">
                <span>{p.readingTime} min</span>
                <span className="text-[var(--bone-3)]">{p.tags[0]}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <div ref={preview} className="pointer-events-none fixed left-0 top-0 z-[50] hidden h-[180px] w-[240px] overflow-hidden border border-[var(--hairline-strong)] opacity-0 md:block" style={{ transform: "translate3d(-999px,-999px,0)" }} aria-hidden>
        {sortedPosts.slice(0, 3).map((p) => <NoteArt key={p.slug} seed={p.seed} className="note-art absolute inset-0 h-full w-full transition-opacity duration-300" />)}
      </div>
    </section>
  );
}
