"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { projects, type Project } from "@/lib/data";
import { readPalette } from "@/lib/theme";

export type RingApi = { snapTo: (i: number) => void; step: (dir: 1 | -1) => void };

function makeTexture(p: Project, light: boolean) {
  const c = document.createElement("canvas");
  c.width = 768; c.height = 1024;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, c.height);
  if (light) { grad.addColorStop(0, `hsl(${p.hue} 45% 88%)`); grad.addColorStop(1, "#f1ebdf"); }
  else { grad.addColorStop(0, `hsl(${p.hue} 60% 14%)`); grad.addColorStop(1, "#0a0908"); }
  g.fillStyle = grad; g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = light ? `hsla(${p.hue} 60% 30% / 0.35)` : `hsla(${p.hue} 70% 62% / 0.35)`; g.lineWidth = 1.5;
  for (let i = 0; i < 26; i++) {
    g.beginPath();
    const r = 40 + i * 34;
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.05) {
      const w = Math.sin(a * 3 + i * 0.4) * 12 + Math.cos(a * 5 - i) * 6;
      const x = c.width * 0.62 + Math.cos(a) * (r + w), y = c.height * 0.36 + Math.sin(a) * (r + w) * 0.9;
      if (a === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
  }
  const fg = light ? "#141210" : "#ece4d3";
  g.fillStyle = light ? "rgba(20,18,16,0.6)" : "rgba(236,228,211,0.55)";
  g.font = "500 28px 'IBM Plex Mono', monospace";
  g.fillText(p.index, 56, 96);
  g.fillText(p.year, c.width - 56 - g.measureText(p.year).width, 96);
  g.fillStyle = fg;
  g.font = "700 116px 'Bricolage Grotesque', sans-serif";
  const words = p.title.split(" ");
  words.forEach((w, i) => g.fillText(w, 52, c.height - 190 + i * 110 - (words.length - 1) * 110));
  g.fillStyle = "#ff4a1c"; g.fillRect(56, c.height - 120, 120, 4);
  g.fillStyle = light ? "rgba(20,18,16,0.75)" : "rgba(236,228,211,0.7)";
  g.font = "400 26px 'IBM Plex Mono', monospace";
  g.fillText(p.kicker.toUpperCase(), 56, c.height - 70);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const cardVert = /* glsl */ `
uniform float uVel;
uniform float uHover;
varying vec2 vUv;
void main(){
  vUv = uv;
  vec3 p = position;
  p.x += sin(uv.y * 3.14159) * uVel * 0.35;
  p.z += sin(uv.x * 3.14159) * uHover * 0.12;
  p *= 1.0 + uHover * 0.04;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const cardFrag = /* glsl */ `
uniform sampler2D uMap;
uniform float uHover;
uniform float uVel;
uniform float uFront;
varying vec2 vUv;
void main(){
  vec2 uv = vUv;
  if(!gl_FrontFacing) uv.x = 1.0 - uv.x;
  float ab = abs(uVel) * 0.02;
  vec3 col;
  col.r = texture2D(uMap, uv + vec2(ab, 0.0)).r;
  col.g = texture2D(uMap, uv).g;
  col.b = texture2D(uMap, uv - vec2(ab, 0.0)).b;
  col += uHover * 0.06;
  float edge = smoothstep(0.0, 0.02, uv.x) * smoothstep(0.0, 0.02, 1.0-uv.x) * smoothstep(0.0, 0.015, uv.y) * smoothstep(0.0, 0.015, 1.0-uv.y);
  float back = gl_FrontFacing ? 1.0 : 0.18;
  float dim = mix(0.55, 1.0, uFront);
  gl_FragColor = vec4(col * dim * (gl_FrontFacing ? 1.0 : 0.6), edge * back);
}`;

function Ring({ onActive, dragging, apiRef, onSelect, onFirstDrag }: { onActive: (i: number) => void; dragging: React.RefObject<boolean>; apiRef: React.RefObject<RingApi | null>; onSelect: (i: number) => void; onFirstDrag: () => void }) {
  const group = useRef<THREE.Group>(null);
  const { gl, viewport } = useThree();
  const rot = useRef({ cur: 0, target: 0, vel: 0, idle: 0 });
  const hovered = useRef(-1);
  const hoverAmt = useRef<number[]>(projects.map(() => 0));
  const mats = useRef<THREE.ShaderMaterial[]>([]);
  const [light, setLight] = useState(false);
  const textures = useMemo(() => projects.map((p) => makeTexture(p, light)), [light]);
  const radius = Math.max(2.6, Math.min(4.2, viewport.width * 0.42));
  const step = (Math.PI * 2) / projects.length;
  const lastActive = useRef(-1);
  const pressed = useRef({ x: 0, t: 0, moved: 0 });

  useEffect(() => {
    const sync = () => setLight(readPalette().isLight);
    sync();
    window.addEventListener("hs-theme", sync);
    return () => window.removeEventListener("hs-theme", sync);
  }, []);

  useEffect(() => {
    // the front card sits at angle 0 => rotation.y = -i*step
    apiRef.current = {
      snapTo: (i) => { const r = rot.current; const want = -i * step; const k = Math.round((r.target - want) / (Math.PI * 2)); r.target = want + k * Math.PI * 2; r.vel = 0; },
      step: (dir) => { rot.current.target += -dir * step; rot.current.vel = 0; },
    };
  }, [apiRef, step]);

  useEffect(() => {
    const el = gl.domElement;
    let down = false, lastX = 0;
    const pd = (e: PointerEvent) => { down = true; lastX = e.clientX; dragging.current = true; pressed.current = { x: e.clientX, t: performance.now(), moved: 0 }; };
    const pm = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - lastX; lastX = e.clientX;
      pressed.current.moved += Math.abs(dx);
      if (pressed.current.moved > 12) onFirstDrag();
      rot.current.target += dx * 0.0065;
      rot.current.vel = dx * 0.0065;
    };
    const pu = () => {
      if (!down) return;
      down = false; dragging.current = false;
      // snap to nearest card after inertia settles
      const r = rot.current;
      const projected = r.target + r.vel * 12;
      r.target = Math.round(projected / step) * step;
      r.vel = 0;
    };
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); onFirstDrag(); rot.current.target -= e.deltaX * 0.002; }
    };
    el.addEventListener("pointerdown", pd); window.addEventListener("pointermove", pm); window.addEventListener("pointerup", pu);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => { el.removeEventListener("pointerdown", pd); window.removeEventListener("pointermove", pm); window.removeEventListener("pointerup", pu); el.removeEventListener("wheel", wheel); };
  }, [gl, dragging, step, onFirstDrag]);

  useFrame((_, dt) => {
    const r = rot.current;
    if (!dragging.current) {
      r.idle += dt;
      // gentle sway when nobody touches it, snapped position otherwise
    }
    r.cur += (r.target - r.cur) * Math.min(1, dt * 7);
    if (group.current) {
      group.current.rotation.y = r.cur + (dragging.current ? 0 : Math.sin(r.idle * 0.6) * 0.03);
      group.current.position.y = Math.sin(r.idle * 0.8) * 0.04;
    }
    let best = -1, bestZ = -Infinity;
    projects.forEach((_, i) => {
      const a = group.current!.rotation.y + i * step;
      const z = Math.cos(a);
      if (z > bestZ) { bestZ = z; best = i; }
    });
    projects.forEach((_, i) => {
      const target = hovered.current === i ? 1 : 0;
      hoverAmt.current[i] += (target - hoverAmt.current[i]) * 0.1;
      const m = mats.current[i];
      if (m) {
        m.uniforms.uVel.value += ((r.target - r.cur) * 4 - m.uniforms.uVel.value) * 0.2;
        m.uniforms.uHover.value = hoverAmt.current[i];
        m.uniforms.uFront.value += ((i === best ? 1 : 0) - m.uniforms.uFront.value) * 0.08;
      }
    });
    if (best >= 0 && best !== lastActive.current) { lastActive.current = best; onActive(best); }
  });

  return (
    <group ref={group}>
      {projects.map((p, i) => {
        const a = i * step;
        return (
          <mesh
            key={p.id}
            position={[Math.sin(a) * radius, 0, Math.cos(a) * radius]}
            rotation={[0, a, 0]}
            onPointerOver={() => { hovered.current = i; }}
            onPointerOut={() => { if (hovered.current === i) hovered.current = -1; }}
            onClick={() => {
              const p = pressed.current;
              if (p.moved < 8 && performance.now() - p.t < 400) {
                if (i === lastActive.current) onSelect(i); else apiRef.current?.snapTo(i);
              }
            }}
          >
            <planeGeometry args={[1.5, 2, 24, 24]} />
            <shaderMaterial
              ref={(m) => { if (m) mats.current[i] = m; }}
              vertexShader={cardVert}
              fragmentShader={cardFrag}
              transparent
              side={THREE.DoubleSide}
              uniforms={{ uMap: { value: textures[i] }, uHover: { value: 0 }, uVel: { value: 0 }, uFront: { value: 0 } }}
              key={light ? "l" : "d"}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function WorkRing({ onActive, apiRef, onSelect, onFirstDrag }: { onActive: (i: number) => void; apiRef: React.RefObject<RingApi | null>; onSelect: (i: number) => void; onFirstDrag: () => void }) {
  const dragging = useRef(false);
  const [grabbing, setGrabbing] = useState(false);
  return (
    <div
      className={`h-full w-full ${grabbing ? "cursor-grabbing" : "cursor-grab"}`}
      data-cursor={grabbing ? "◀ ▶" : "Drag"}
      onPointerDown={() => setGrabbing(true)}
      onPointerUp={() => setGrabbing(false)}
      onPointerLeave={() => setGrabbing(false)}
    >
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.15, 8.2], fov: 40 }} gl={{ antialias: true, alpha: true }}>
        <Ring onActive={onActive} dragging={dragging} apiRef={apiRef} onSelect={onSelect} onFirstDrag={onFirstDrag} />
      </Canvas>
    </div>
  );
}
