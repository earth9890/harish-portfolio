"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { useTheme } from "@/lib/theme";
import { person } from "@/lib/data";
import Magnetic from "./Magnetic";

export const sections = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "process", label: "Process" },
  { id: "craft", label: "Craft" },
  { id: "notes", label: "Notes" },
  { id: "log", label: "Log" },
  { id: "contact", label: "Contact" },
];

export function scrollToId(id: string) {
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: string | number, o?: object) => void } }).__lenis;
  const el = document.getElementById(id);
  if (!el) return false;
  if (lenis) lenis.scrollTo(id === "top" ? 0 : `#${id}`, { duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth" });
  return true;
}

export default function Nav() {
  const [time, setTime] = useState("--:--:--");
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const menu = useRef<HTMLDivElement>(null);
  const home = pathname === "/";
  const current = home ? active : "";

  useEffect(() => {
    const tick = () => setTime(new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
    const i = setInterval(tick, 1000);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearInterval(i); window.removeEventListener("scroll", onScroll); };
  }, []);

  useEffect(() => {
    if (!home) return;
    const obs = new IntersectionObserver((es) => { es.forEach((e) => e.isIntersecting && setActive(e.target.id)); }, { rootMargin: "-45% 0px -45% 0px" });
    const t = setTimeout(() => sections.forEach((it) => { const el = document.getElementById(it.id); if (el) obs.observe(el); }), 300);
    return () => { clearTimeout(t); obs.disconnect(); };
  }, [home]);

  useEffect(() => {
    const el = menu.current;
    if (!el) return;
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    if (open) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
      gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.8, ease: "expo.inOut" });
      gsap.fromTo(el.querySelectorAll(".menu-item"), { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.05, ease: "expo.out", delay: 0.35 });
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    if (home) scrollToId(id);
    else router.push(`/#${id}`);
  };

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-[70] transition-[background-color,backdrop-filter] duration-500 ${scrolled && !open ? "backdrop-blur-md" : ""}`} style={{ background: scrolled && !open ? "color-mix(in srgb, var(--ink) 70%, transparent)" : "transparent" }}>
        <nav className="flex items-center justify-between px-5 py-4 md:px-10 md:py-5" aria-label="Primary">
          <Link href="/" onClick={home ? go("top") : undefined} className="mono text-[var(--bone)]" data-cursor="Top" aria-label="Home">
            <span className="display text-base tracking-normal">HS</span><span className="u-vermilion">.</span>
          </Link>
          <ul className="hidden items-center gap-6 lg:flex">
            {sections.map((it, i) => (
              <li key={it.id}>
                <Magnetic strength={0.2}>
                  <a href={`/#${it.id}`} onClick={go(it.id)} data-cursor="" className={`mono ul block py-1 transition-colors ${current === it.id ? "!text-[var(--vermilion)]" : "text-[var(--bone)]"}`}>
                    <span className="mr-1 text-[var(--bone-3)]">{String(i + 1).padStart(2, "0")}</span>{it.label}
                  </a>
                </Magnetic>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4 md:gap-6">
            <span className="mono hidden text-[var(--bone)] tabular-nums sm:inline">PUNE {time}</span>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("hs-palette"))}
              className="mono hidden items-center gap-2 text-[var(--bone)] md:inline-flex"
              data-cursor="Menu" aria-label="Open command palette"
            ><span className="kbd">⌘K</span></button>
            <button
              onClick={(e) => toggle({ x: e.clientX, y: e.clientY })}
              className="relative h-6 w-11 rounded-full border border-[var(--hairline-strong)] transition-colors"
              data-cursor={theme === "dark" ? "Lights on" : "Lights off"}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              aria-pressed={theme === "light"}
            >
              <span className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[var(--bone)] transition-[left,background] duration-500 ease-[var(--ease-in-out)]" style={{ left: theme === "dark" ? 3 : 23 }} />
              <span className="absolute left-[7px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--vermilion)] transition-opacity duration-300" style={{ opacity: theme === "light" ? 1 : 0 }} />
            </button>
            <button onClick={() => setOpen((v) => !v)} className="mono text-[var(--bone)] lg:hidden" data-cursor="" aria-expanded={open} aria-controls="menu">{open ? "Close" : "Menu"}</button>
          </div>
        </nav>
      </header>

      <div ref={menu} id="menu" className="fixed inset-0 z-[65] flex flex-col justify-between bg-[var(--ink)] px-5 pb-8 pt-24 md:px-10" style={{ clipPath: "inset(0 0 100% 0)", visibility: open ? "visible" : "hidden" }} aria-hidden={!open}>
        <ul>
          {sections.map((it, i) => (
            <li key={it.id} className="line-mask border-b hairline">
              <a href={`/#${it.id}`} onClick={go(it.id)} className="menu-item flex items-baseline justify-between py-3">
                <span className="display text-[clamp(2.4rem,9vw,5rem)] text-[var(--bone)]">{it.label}</span>
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
              </a>
            </li>
          ))}
          <li className="line-mask"><Link href="/notes" onClick={() => setOpen(false)} className="menu-item mono block py-4">All notes →</Link></li>
        </ul>
        <div className="menu-item flex flex-wrap items-center justify-between gap-4">
          <a href={`mailto:${person.email}`} className="text-[var(--bone)]">{person.email}</a>
          <ul className="mono flex gap-5">{person.links.map((l) => <li key={l.label}><a href={l.href} target="_blank" rel="noreferrer">{l.label}</a></li>)}</ul>
        </div>
      </div>
    </>
  );
}
