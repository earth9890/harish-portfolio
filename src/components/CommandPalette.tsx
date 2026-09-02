"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/lib/theme";
import { person } from "@/lib/data";
import { posts } from "@/lib/posts";
import { sections, scrollToId } from "./Nav";

type Cmd = { id: string; label: string; hint: string; group: string; run: () => void };

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const cmds = useMemo<Cmd[]>(() => {
    const goSection = (id: string) => () => { if (pathname === "/") scrollToId(id); else router.push(`/#${id}`); };
    return [
      ...sections.map((s) => ({ id: `go-${s.id}`, label: s.label, hint: "Jump to section", group: "Navigate", run: goSection(s.id) })),
      { id: "notes", label: "All notes", hint: "/notes", group: "Navigate", run: () => router.push("/notes") },
      ...posts.map((p) => ({ id: `post-${p.slug}`, label: p.title, hint: `Note · ${p.readingTime} min`, group: "Notes", run: () => router.push(`/notes/${p.slug}`) })),
      { id: "theme-dark", label: "Lights off", hint: "Dark theme", group: "Theme", run: () => setTheme("dark", { x: innerWidth / 2, y: innerHeight / 2 }) },
      { id: "theme-light", label: "Lights on", hint: "Light theme", group: "Theme", run: () => setTheme("light", { x: innerWidth / 2, y: innerHeight / 2 }) },
      { id: "email", label: "Copy email", hint: person.email, group: "Contact", run: () => { navigator.clipboard?.writeText(person.email); } },
      ...person.links.map((l) => ({ id: `link-${l.label}`, label: `Open ${l.label}`, hint: l.href.replace("https://", ""), group: "Contact", run: () => window.open(l.href, "_blank", "noreferrer") })),
    ];
  }, [pathname, router, setTheme]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return cmds;
    return cmds.filter((c) => (c.label + " " + c.hint + " " + c.group).toLowerCase().includes(s));
  }, [q, cmds]);

  useEffect(() => {
    const show = () => { setQ(""); setIdx(0); setOpen(true); setTimeout(() => input.current?.focus(), 30); };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((v) => { if (v) return false; show(); return true; }); }
      else if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => show();
    window.addEventListener("keydown", onKey);
    window.addEventListener("hs-palette", onOpen);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("hs-palette", onOpen); };
  }, []);

  const run = (c: Cmd) => { setOpen(false); setTimeout(c.run, 60); };

  if (!open) return null;
  let lastGroup = "";
  return (
    <div className="fixed inset-0 z-[96] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal aria-label="Command palette">
      <button className="absolute inset-0 bg-[color-mix(in_srgb,var(--ink)_70%,transparent)] backdrop-blur-sm" onClick={() => setOpen(false)} aria-label="Close" />
      <div className="relative w-full max-w-xl border border-[var(--hairline-strong)] bg-[var(--ink)] shadow-2xl" data-lenis-prevent>
        <div className="flex items-center gap-3 border-b hairline px-4">
          <span className="u-vermilion">›</span>
          <input
            ref={input} value={q}
            onChange={(e) => { setQ(e.target.value); setIdx(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(list.length - 1, i + 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
              if (e.key === "Enter" && list[idx]) run(list[idx]);
            }}
            placeholder="Where to?"
            className="w-full bg-transparent py-4 text-lg text-[var(--bone)] outline-none placeholder:text-[var(--bone-3)]"
          />
          <span className="kbd">esc</span>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto py-2">
          {list.length === 0 && <li className="mono px-4 py-6">Nothing developed for “{q}”.</li>}
          {list.map((c, i) => {
            const showGroup = c.group !== lastGroup; lastGroup = c.group;
            return (
              <li key={c.id}>
                {showGroup && <p className="mono px-4 pb-1 pt-3 text-[var(--bone-3)]">{c.group}</p>}
                <button onMouseEnter={() => setIdx(i)} onClick={() => run(c)} className={`flex w-full items-center justify-between px-4 py-2.5 text-left ${i === idx ? "bg-[var(--ink-2)] text-[var(--bone)]" : "text-[var(--bone-2)]"}`}>
                  <span>{c.label}{c.id.startsWith("theme") && ((c.id === "theme-dark") === (theme === "dark")) && <span className="mono ml-2 text-[var(--vermilion)]">· current</span>}</span>
                  <span className="mono normal-case tracking-normal">{c.hint}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mono flex justify-between border-t hairline px-4 py-2 text-[var(--bone-3)]"><span>↑↓ move · ↵ go</span><span>⌘K toggles</span></div>
      </div>
    </div>
  );
}
