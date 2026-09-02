import type { Metadata } from "next";
import Link from "next/link";
import { sortedPosts, fmtDate } from "@/lib/posts";
import NoteArt from "@/components/notes/NoteArt";

export const metadata: Metadata = { title: "Notes", description: "Field notes on interfaces, performance and AI-native product surfaces." };

export default function NotesIndex() {
  return (
    <main className="section pt-32 md:pt-44">
      <p className="mono">Notes / {sortedPosts.length} entries</p>
      <h1 className="display mt-4 text-[clamp(3rem,10vw,11rem)] text-[var(--bone)]">Field<br /><span className="serif-it font-normal tracking-normal text-[var(--bone-2)]">notes</span></h1>
      <p className="serif-it mt-6 max-w-[44ch] text-2xl text-[var(--bone-2)]">Working notes on interfaces that have to hold up: render performance, streaming UI, and what agents owe the people watching them work.</p>

      <ul className="mt-20 grid gap-x-8 gap-y-16 md:grid-cols-2">
        {sortedPosts.map((p, i) => (
          <li key={p.slug} className={i % 3 === 0 ? "md:col-span-2" : ""}>
            <Link href={`/notes/${p.slug}`} className="group block" data-cursor="Read">
              <div className={`relative overflow-hidden border border-[var(--hairline)] ${i % 3 === 0 ? "aspect-[21/9]" : "aspect-[4/3]"}`}>
                <NoteArt seed={p.seed} className="absolute inset-0 h-full w-full transition-transform duration-[1200ms] ease-[var(--ease-out)] group-hover:scale-105" />
                <span className="mono absolute left-4 top-4 bg-[var(--ink)] px-2 py-1">{fmtDate(p.date)}</span>
                <span className="mono absolute right-4 top-4 bg-[var(--ink)] px-2 py-1">{p.readingTime} min</span>
              </div>
              <h2 className={`mt-5 leading-[1.02] tracking-tight text-[var(--bone)] ${i % 3 === 0 ? "display text-[clamp(2rem,5vw,4.6rem)]" : "text-[clamp(1.5rem,2.6vw,2.2rem)]"}`}>{p.title}</h2>
              <p className="mt-3 max-w-[64ch] text-[var(--bone-2)]">{p.dek}</p>
              <p className="mono mt-4 flex gap-3">{p.tags.map((t) => <span key={t}>#{t.replace(/\s+/g, "")}</span>)}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-24 flex items-center justify-between border-t hairline pt-8">
        <Link href="/" className="mono ul" data-cursor="Home">← Back to the darkroom</Link>
        <span className="mono">More coming. Slowly.</span>
      </div>
    </main>
  );
}
