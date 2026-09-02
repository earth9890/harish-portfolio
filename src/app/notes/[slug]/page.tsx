import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, posts, sortedPosts, fmtDate } from "@/lib/posts";
import NoteArt from "@/components/notes/NoteArt";
import ReadingProgress from "@/components/notes/ReadingProgress";

export function generateStaticParams() { return posts.map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPost(slug);
  return p ? { title: p.title, description: p.dek } : {};
}

function inline(text: string) {
  // *em* and `code`
  const parts = text.split(/(\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*")) return <em key={i} className="serif-it text-[1.05em]">{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    return part;
  });
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const idx = sortedPosts.findIndex((p) => p.slug === slug);
  const next = sortedPosts[(idx + 1) % sortedPosts.length];

  return (
    <main className="pt-28 md:pt-36">
      <ReadingProgress />
      <article className="px-5 md:px-10">
        <header className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="mono flex flex-wrap gap-4"><Link href="/notes" className="ul">← Notes</Link><span>{fmtDate(post.date)}</span><span>{post.readingTime} min read</span></p>
            <h1 className="display mt-6 text-[clamp(2.4rem,6.5vw,6.5rem)] text-[var(--bone)]">{post.title}</h1>
            <p className="serif-it mt-6 max-w-[48ch] text-2xl leading-snug text-[var(--bone-2)]">{post.dek}</p>
            <p className="mono mt-6 flex gap-3">{post.tags.map((t) => <span key={t} className="border hairline px-2 py-1">{t}</span>)}</p>
          </div>
          <div className="md:col-span-4"><div className="aspect-[4/5] overflow-hidden border border-[var(--hairline)]"><NoteArt seed={post.seed} className="h-full w-full" /></div></div>
        </header>

        <div className="prose mx-auto mt-20 max-w-[68ch]">
          {post.body.map((b, i) => {
            switch (b.type) {
              case "h2": return <h2 key={i}>{b.text}</h2>;
              case "p": return <p key={i}>{inline(b.text)}</p>;
              case "quote": return <blockquote key={i}>{b.text}</blockquote>;
              case "code": return <pre key={i}><code data-lang={b.lang}>{b.code}</code></pre>;
              case "ul": return <ul key={i}>{b.items.map((it, k) => <li key={k}>{inline(it)}</li>)}</ul>;
            }
          })}
        </div>
      </article>

      <footer className="section mt-16 border-t hairline">
        <p className="mono">Next note</p>
        <Link href={`/notes/${next.slug}`} className="group mt-4 block" data-cursor="Read">
          <span className="display block text-[clamp(2rem,6vw,6rem)] text-[var(--bone)] transition-transform duration-700 ease-[var(--ease-out)] group-hover:translate-x-4">{next.title}</span>
          <span className="serif-it mt-3 block text-2xl text-[var(--bone-2)]">{next.dek}</span>
        </Link>
      </footer>
    </main>
  );
}
