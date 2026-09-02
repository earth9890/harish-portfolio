"use client";
import { useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const TRAIL = 24;

const vert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }
`;

const frag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uRes;
uniform vec4 uTrail[${TRAIL}];
uniform float uReveal;
uniform float uScroll;
uniform float uLight;

vec3 INK_D = vec3(0.039, 0.035, 0.031);
vec3 BONE_D = vec3(0.925, 0.894, 0.827);
vec3 PAPER = vec3(0.945, 0.922, 0.875);
vec3 INKLINE = vec3(0.078, 0.070, 0.063);
vec3 VERM = vec3(1.0, 0.29, 0.11);
vec3 BRASS = vec3(0.784, 0.643, 0.353);

mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 m = rot(0.5);
  for(int i=0;i<5;i++){ v += a*noise(p); p = m*p*2.02 + 0.3; a *= 0.5; }
  return v;
}

void main(){
  vec2 asp = vec2(uRes.x/uRes.y, 1.0);
  vec2 p = (vUv - 0.5) * asp;
  float t = uTime * 0.05;

  // pointer trail displacement + heat
  vec2 disp = vec2(0.0);
  float heat = 0.0;
  for(int i=0;i<${TRAIL};i++){
    vec4 tp = uTrail[i];
    if(tp.w <= 0.0) continue;
    vec2 d = p - (tp.xy - 0.5) * asp;
    float r2 = dot(d,d);
    float life = tp.w * clamp(1.0 - tp.z, 0.0, 1.4);
    float f = exp(-r2 * 28.0) * life;
    disp += normalize(d + 1e-4) * f * 0.22;
    heat += f;
  }
  heat = min(heat, 1.1);
  p += disp;
  p.y += uScroll * 0.35;

  vec2 q = vec2(fbm(p*1.6 + t), fbm(p*1.6 + vec2(5.2,1.3) - t));
  vec2 r = vec2(fbm(p*1.6 + 3.5*q + vec2(1.7,9.2) + 0.15*t), fbm(p*1.6 + 3.5*q + vec2(8.3,2.8) + 0.126*t));
  float f = fbm(p*1.6 + 3.0*r);

  // topographic contour lines
  float bands = f * 14.0 + heat * 6.0;
  float w = fwidth(bands) * 1.5 + 0.045;
  float line = 1.0 - smoothstep(0.0, w, abs(fract(bands) - 0.5) - 0.03);
  float fine = 1.0 - smoothstep(0.0, w * 1.2, abs(fract(bands * 3.0) - 0.5) - 0.012);

  vec3 INK = mix(INK_D, PAPER, uLight);
  vec3 BONE = mix(BONE_D, INKLINE, uLight);

  vec3 col = INK;
  // dark: lift the field a little where fbm is high; light: darken slightly (paper shadow)
  col = mix(col, mix(vec3(0.13, 0.118, 0.10), PAPER * 0.9, uLight), smoothstep(0.3, 0.85, f) * mix(0.7, 0.85, uLight));
  float lineAmt = line * (0.2 + 0.4 * smoothstep(0.3, 0.8, f));
  col = mix(col, BONE, lineAmt * mix(0.7, 0.75, uLight));
  col = mix(col, BRASS, fine * 0.12 * smoothstep(0.25, 0.7, f) * (1.0 - line));
  col = mix(col, VERM, clamp(heat * (0.22 + line * 0.9), 0.0, 1.0) * 0.85);

  // vignette + edge fade so type stays legible
  float vig = smoothstep(1.35, 0.35, length((vUv-0.5)*vec2(1.2,1.0)));
  vig *= smoothstep(1.0, 0.72, vUv.y); // quiet the nav band
  col = mix(INK, col, vig);

  // reveal wipe
  float rev = smoothstep(uReveal - 0.25, uReveal, vUv.y + fbm(vUv*3.0)*0.15);
  col = mix(INK, col, 1.0 - rev);

  gl_FragColor = vec4(col, 1.0);
}
`;

function Field({ reveal }: { reveal: React.RefObject<number> }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { size, gl } = useThree();
  const head = useRef(0);
  const last = useRef(new THREE.Vector2(-1, -1));

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uTrail: { value: Array.from({ length: TRAIL }, () => new THREE.Vector4(0, 0, 1, 0)) },
    uReveal: { value: 0 },
    uScroll: { value: 0 },
    uLight: { value: 0 },
  }), []);
  const lightTarget = useRef(0);

  useEffect(() => {
    const sync = () => { lightTarget.current = document.documentElement.dataset.theme === "light" ? 1 : 0; };
    sync();
    if (mat.current) mat.current.uniforms.uLight.value = lightTarget.current;
    window.addEventListener("hs-theme", sync);
    return () => window.removeEventListener("hs-theme", sync);
  }, []);

  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const m = mat.current;
      if (!m) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = 1 - (e.clientY - r.top) / r.height;
      const d = last.current.distanceTo(new THREE.Vector2(x, y));
      if (d < 0.004) return;
      last.current.set(x, y);
      const trail = m.uniforms.uTrail.value as THREE.Vector4[];
      trail[head.current % TRAIL].set(x, y, 0, Math.min(1, 0.5 + d * 14));
      head.current++;
    };
    const onDown = (e: PointerEvent) => {
      const m = mat.current;
      if (!m) return;
      const r = el.getBoundingClientRect();
      if (e.clientY > r.bottom || e.clientY < r.top) return;
      const x = (e.clientX - r.left) / r.width;
      const y = 1 - (e.clientY - r.top) / r.height;
      const trail = m.uniforms.uTrail.value as THREE.Vector4[];
      // an ink drop: several strong points around the click
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        trail[head.current % TRAIL].set(x + Math.cos(a) * 0.035, y + Math.sin(a) * 0.05, -0.25, 0.8);
        head.current++;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerdown", onDown); };
  }, [gl]);

  useFrame((_, dt) => {
    const m = mat.current;
    if (!m) return;
    const u = m.uniforms;
    u.uTime.value += dt;
    (u.uRes.value as THREE.Vector2).set(size.width, size.height);
    u.uReveal.value = reveal.current ?? 1.4;
    u.uScroll.value = (window.scrollY || 0) / Math.max(1, window.innerHeight);
    u.uLight.value += (lightTarget.current - u.uLight.value) * Math.min(1, dt * 4);
    for (const v of u.uTrail.value as THREE.Vector4[]) {
      if (v.w <= 0) continue;
      const age = Math.min(1, v.z + dt * 0.55);
      v.setZ(age);
      if (age >= 1) v.setW(0);
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} depthWrite={false} />
    </mesh>
  );
}

export default function InkField({ reveal }: { reveal: React.RefObject<number> }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: "high-performance", alpha: false }}
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1 }}
      style={{ position: "absolute", inset: 0 }}
      frameloop="always"
    >
      <Field reveal={reveal} />
    </Canvas>
  );
}
