import Link from "next/link";

export default function NotFound() {
  return (
    <main className="section flex min-h-[100svh] flex-col justify-end">
      <p className="mono">404 / Nothing developed here</p>
      <h1 className="display mt-4 text-[clamp(3rem,14vw,16rem)] text-[var(--bone)]">Blank<br /><span className="serif-it font-normal tracking-normal text-[var(--vermilion)]">frame</span></h1>
      <p className="serif-it mt-6 max-w-[40ch] text-2xl text-[var(--bone-2)]">The negative for this page never made it into the tray.</p>
      <div className="mt-10"><Link href="/" className="btn" data-cursor="Home">Back to the darkroom</Link></div>
    </main>
  );
}
