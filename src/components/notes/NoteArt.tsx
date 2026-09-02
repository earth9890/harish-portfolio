/** Deterministic generative "negative" for a post — pure SVG, no assets. */
function build(seed: number) {
  let s = seed * 9301 + 49297;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const rings = 7 + Math.floor(rnd() * 5);
  const cx = 40 + rnd() * 20, cy = 35 + rnd() * 30;
  const paths: string[] = [];
  for (let i = 0; i < rings; i++) {
    const r = 6 + i * (5 + rnd() * 2);
    const k = 2 + Math.floor(rnd() * 4), amp = 1 + rnd() * 3, ph = rnd() * Math.PI * 2;
    let d = "";
    for (let a = 0; a <= Math.PI * 2 + 0.05; a += 0.12) {
      const rr = r + Math.sin(a * k + ph) * amp;
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.85;
      d += (a === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1);
    }
    paths.push(d + "Z");
  }
  const dots = Array.from({ length: 12 }, () => ({ x: rnd() * 100, y: rnd() * 100, r: 0.4 + rnd() * 0.8 }));
  return { paths, dots };
}

export default function NoteArt({ seed, className = "" }: { seed: number; className?: string }) {
  const { paths, dots } = build(seed);
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <rect width="100" height="100" fill="var(--ink-2)" />
      {paths.map((d, i) => <path key={i} d={d} fill="none" stroke={i % 3 === 0 ? "var(--brass)" : "var(--bone)"} strokeOpacity={i % 3 === 0 ? 0.55 : 0.35} strokeWidth="0.35" />)}
      {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="var(--vermilion)" opacity="0.8" />)}
      <line x1="8" y1="90" x2="30" y2="90" stroke="var(--vermilion)" strokeWidth="0.8" />
    </svg>
  );
}
