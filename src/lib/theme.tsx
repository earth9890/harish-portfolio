"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "dark" | "light";
type Ctx = { theme: Theme; setTheme: (t: Theme, origin?: { x: number; y: number }) => void; toggle: (origin?: { x: number; y: number }) => void };

const ThemeCtx = createContext<Ctx>({ theme: "dark", setTheme: () => {}, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const t = (document.documentElement.dataset.theme as Theme) || "dark";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from the pre-paint inline script once
    setThemeState(t);
  }, []);

  const apply = useCallback((t: Theme) => {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("hs-theme", t); } catch {}
    setThemeState(t);
    window.dispatchEvent(new CustomEvent("hs-theme", { detail: t }));
  }, []);

  const setTheme = useCallback((t: Theme, origin?: { x: number; y: number }) => {
    if (t === theme) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !origin) { apply(t); return; }
    // circular wipe: paint an overlay in the NEW theme colour, expand it from the origin, then swap.
    const o = document.createElement("div");
    const bg = t === "light" ? "#f1ebdf" : "#0a0908";
    const r = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y));
    Object.assign(o.style, {
      position: "fixed", inset: "0", zIndex: "95", background: bg, pointerEvents: "none",
      clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`,
      transition: "clip-path 700ms cubic-bezier(0.87, 0, 0.13, 1)",
    } as CSSStyleDeclaration);
    document.body.appendChild(o);
    requestAnimationFrame(() => requestAnimationFrame(() => { o.style.clipPath = `circle(${r}px at ${origin.x}px ${origin.y}px)`; }));
    const done = () => {
      apply(t);
      o.style.transition = "opacity 350ms ease";
      o.style.opacity = "0";
      setTimeout(() => o.remove(), 380);
    };
    o.addEventListener("transitionend", done, { once: true });
    setTimeout(() => { if (o.isConnected && o.style.opacity !== "0") done(); }, 900);
  }, [theme, apply]);

  const toggle = useCallback((origin?: { x: number; y: number }) => setTheme(theme === "dark" ? "light" : "dark", origin), [theme, setTheme]);

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);

/** Read the live palette from CSS variables (for canvases). */
export function readPalette() {
  const s = getComputedStyle(document.documentElement);
  const g = (n: string) => s.getPropertyValue(n).trim();
  return { ink: g("--ink"), ink2: g("--ink-2"), bone: g("--bone"), bone2: g("--bone-2"), bone3: g("--bone-3"), vermilion: g("--vermilion"), brass: g("--brass"), teal: g("--teal"), hairline: g("--hairline"), isLight: document.documentElement.dataset.theme === "light" };
}

export const themeInitScript = `(function(){try{var t=localStorage.getItem('hs-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})();`;
