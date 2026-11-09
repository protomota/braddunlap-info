"use client";

/* ============================================================
   CareerScene: the Three.js piece behind the hero.

   The employment timeline (the same rows as Fig. 1) drawn as light:
   every role is a spindle of glowing fibers along a time axis that
   recedes into the distance, 2007 far away and today up close.
   Concurrent roles branch off the main line and rejoin it. The
   current role is Protomota orange.

   It draws itself in, chronologically, then holds still. After the
   intro nothing runs: a frame is drawn only while the pointer eases
   the camera, a click pulse travels, or a hovered role lights up.
   Line rendering is the same approach as the protomota.com hero
   (screen-space triangle strips with a core and a glow).

   Deliberately a client component: everything else on the page is
   server-rendered, and the canvas is decorative (aria-hidden). The
   readable timeline is Fig. 1 further down.
   ============================================================ */

import { useEffect, useRef } from "react";
import type * as T from "three";

export type SceneRole = { label: string; start: string; end: string | null };

type Line = {
  pts: number[][];
  ctr: number[][];
  orange: number;
  bright: number;
  start: number;
  dur: number;
  width: number;
  role: number;
};

const INTRO = 3.4; // seconds until the scene comes to rest
const DRAW = 2.7; // seconds the pen takes from 2007 to today
const LEN = 40; // half length of the time axis in world units
const MAX_ROLES = 12;
const RULER = -2; // role value of the baseline and year ticks: the cursor never bends them
const TAG_DROP = 16; // px between the tag and the role: room for its pointer

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
const toYear = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return y + (m - 1) / 12;
};

/* ---------- layout: roles to fibers ---------- */
function buildCareer(roles: SceneRole[], small: boolean) {
  const rand = mulberry32(20070901);
  const now = new Date();
  const yNow = now.getFullYear() + now.getMonth() / 12 + 0.12;
  const y0 = Math.min(...roles.map((r) => toYear(r.start))) - 0.25;
  const xOf = (y: number) => lerp(-LEN, LEN, (y - y0) / (yNow - y0));
  const penAt = (x: number) => 0.25 + ((x + LEN) / (2 * LEN)) * DRAW;

  // lanes: a role that overlaps an earlier one branches onto the next lane
  const laneEnd: number[] = [];
  const spans = roles.map((r) => {
    const a = toYear(r.start);
    const b = r.end ? toYear(r.end) : yNow;
    let lane = laneEnd.findIndex((e) => e <= a + 0.05);
    if (lane < 0) lane = laneEnd.length;
    laneEnd[lane] = b;
    return { a, b, lane, current: !r.end };
  });

  const LANE_Y = 3.8;
  const LANE_Z = -3.4;
  // a spindle's widest radius grows with the years in the role
  const spindleR = (s: { a: number; b: number; current: boolean }) =>
    Math.min(2.5, Math.max(1.05, 0.85 + (s.b - s.a) * 0.26)) * (s.current ? 1.15 : 1);
  const lines: Line[] = [];
  const K = small ? 9 : 13;

  spans.forEach((s, ri) => {
    const xa = xOf(s.a);
    const xb = xOf(s.b);
    const R = spindleR(s);
    const N = Math.round(Math.min(170, Math.max(44, (xb - xa) * 9)));
    for (let k = 0; k < K + (s.current ? 4 : 0); k++) {
      const th0 = (k / K) * Math.PI * 2 + (rand() - 0.5) * 0.5;
      const rad = 0.55 + rand() * 0.6;
      const twist = 0.22 + rand() * 0.08;
      const pts: number[][] = [];
      const ctr: number[][] = [];
      for (let i = 0; i < N; i++) {
        const u = i / (N - 1);
        const x = lerp(xa, xb, u);
        // pinch at both ends so roles meet at their start and end dates;
        // the current role stays open at "now"
        const env = s.current ? Math.pow(Math.sin(Math.min(u * 1.25, 1) * Math.PI * 0.5), 0.75) : Math.pow(Math.sin(u * Math.PI), 0.7);
        // a branch rises off the main line and comes back to it
        const branch = s.lane ? smooth(u / 0.2) * smooth((1 - u) / 0.2) : 0;
        const cy = branch * LANE_Y * s.lane;
        const cz = branch * LANE_Z * s.lane;
        const th = th0 + x * twist;
        const r = R * env * rad;
        pts.push([x, cy + r * Math.cos(th) * 0.85, cz + r * Math.sin(th)]);
        ctr.push([x, cy, cz]);
      }
      const orange = s.current ? 1 : 0;
      lines.push({
        pts,
        ctr,
        orange,
        bright: s.current ? 0.85 + rand() * 0.25 : 0.32 + rand() * 0.5,
        start: penAt(xa) + rand() * 0.08,
        dur: Math.max(0.25, ((xb - xa) / (2 * LEN)) * DRAW),
        width: s.current ? 1.6 : 1.05 + rand() * 0.3,
        role: ri,
      });
    }
  });

  // the spine: a few thin fibers through the whole career
  for (let k = 0; k < 3; k++) {
    const pts: number[][] = [];
    const ctr: number[][] = [];
    const th0 = (k / 3) * Math.PI * 2;
    const N = 320;
    for (let i = 0; i < N; i++) {
      const x = lerp(-LEN, LEN, i / (N - 1));
      const th = th0 + x * 0.5;
      pts.push([x, Math.cos(th) * 0.22, Math.sin(th) * 0.22]);
      ctr.push([x, 0, 0]);
    }
    lines.push({ pts, ctr, orange: 0, bright: 0.28, start: 0.2, dur: DRAW, width: 0.8, role: -1 });
  }

  // a ruler under it: baseline and year ticks
  const BASE = -3.4;
  lines.push({
    pts: [[-LEN, BASE, 0], [LEN, BASE, 0]],
    ctr: [[-LEN, BASE, 0], [LEN, BASE, 0]],
    orange: 0,
    bright: 0.16,
    start: 0.2,
    dur: DRAW,
    width: 0.8,
    role: RULER,
  });
  const ticks: { x: number; label: string; at: number; now?: boolean }[] = [];
  const firstTick = Math.ceil(y0 + 0.4);
  for (let y = firstTick; y < yNow - 1.4; y += 3) ticks.push({ x: xOf(y), label: String(y), at: penAt(xOf(y)) });
  ticks.push({ x: LEN, label: "Now", at: penAt(LEN), now: true });
  ticks.forEach((t) => {
    lines.push({
      pts: [[t.x, BASE - 0.55, 0], [t.x, BASE + 0.55, 0]],
      ctr: [[t.x, BASE, 0], [t.x, BASE, 0]],
      orange: t.now ? 1 : 0,
      bright: t.now ? 0.9 : 0.35,
      start: t.at,
      dur: 0.2,
      width: 1,
      role: RULER,
    });
  });

  const roleInfo = spans.map((s, i) => ({
    label: roles[i].label,
    years: `${Math.floor(s.a)} – ${s.current ? "now" : Math.floor(s.b)}`,
    x: (xOf(s.a) + xOf(s.b)) / 2,
    y: s.lane ? LANE_Y * s.lane : 0,
    z: s.lane ? LANE_Z * s.lane : 0,
    // just over the spindle's top edge, where the tag's pointer lands
    top: spindleR(s) * 0.98 + 0.25,
    x0: xOf(s.a),
    x1: xOf(s.b),
    current: s.current,
  }));

  return { lines, ticks, roleInfo, baseY: BASE };
}

/* ---------- shaders ---------- */
const VERT = /* glsl */ `
  uniform float uTime;
  uniform vec2 uRes;
  uniform float uPx;
  uniform float uOpen;
  uniform vec4 uPulse[3];
  uniform vec3 uRayO;
  uniform vec3 uRayD;
  uniform float uHover;
  uniform float uHi[${MAX_ROLES}];
  uniform float uFar;
  uniform float uNear;

  attribute vec3 aPrev;
  attribute vec3 aNext;
  attribute vec3 aCtr;
  attribute vec3 aPrevCtr;
  attribute vec3 aNextCtr;
  attribute float aSide;
  attribute float aAlong;
  attribute vec4 aLine;   // orange, brightness, reveal start, reveal duration
  attribute float aWidth;
  attribute float aRole;

  varying float vAcross;
  varying float vCore;
  varying float vGlow;
  varying float vAlong;
  varying float vProg;
  varying float vHead;
  varying float vBright;
  varying float vOrange;

  vec3 warp(vec3 q, vec3 c){
    // fibers open out from their spindle's axis during the intro
    vec3 p = c + (q - c) * uOpen;
    // the ruler (baseline and year ticks) stays rigid
    if (aRole < -1.5) return p;
    // the cursor parts the fibers around it
    vec3 v = p - uRayO;
    vec3 off = v - uRayD * dot(v, uRayD);
    float dist = length(off);
    float f = exp(-dist * dist / 10.0) * uHover;
    p += off / (dist + 1e-3) * f * 1.8;
    return p;
  }

  vec2 dir2(vec2 d, vec2 fallback){
    float l = length(d);
    return l > 1e-5 ? d / l : fallback;
  }

  void main(){
    vec3 p = warp(position, aCtr);
    mat4 vp = projectionMatrix * viewMatrix;
    vec4 cp = vp * vec4(p, 1.0);
    vec4 ca = vp * vec4(warp(aPrev, aPrevCtr), 1.0);
    vec4 cb = vp * vec4(warp(aNext, aNextCtr), 1.0);

    vec2 hr = 0.5 * uRes;
    vec2 sp = cp.xy / max(cp.w, 1e-3) * hr;
    vec2 sa = ca.w > 1e-3 ? ca.xy / ca.w * hr : sp;
    vec2 sb = cb.w > 1e-3 ? cb.xy / cb.w * hr : sp;
    vec2 d2 = dir2(sb - sp, vec2(1.0, 0.0));
    vec2 d1 = dir2(sp - sa, d2);
    vec2 n1 = vec2(-d1.y, d1.x);
    vec2 n2 = vec2(-d2.y, d2.x);
    vec2 m = dir2(n1 + n2, n1);
    float miter = 1.0 / max(dot(m, n1), 0.5);

    float persp = clamp(34.0 / max(cp.w, 1e-3), 0.45, 1.7);
    float hi = aRole >= 0.0 ? uHi[int(aRole + 0.5)] : 0.0;
    float core = 0.5 * aWidth * persp * uPx * (1.0 + hi * 0.3);
    float glow = 4.2 * persp * uPx * (1.0 + hi * 0.25);
    float halfW = core + glow * 2.2 + 1.0;
    if (cp.w > 1e-3) cp.xy += m * (miter * halfW * aSide) / hr * cp.w;
    gl_Position = cp;

    vAcross = aSide * halfW;
    vCore = core;
    vGlow = glow;
    vAlong = aAlong;
    float pr = clamp((uTime - aLine.z) / max(aLine.w, 1e-3), 0.0, 1.0);
    vProg = 1.0 - pow(1.0 - pr, 2.0);
    vHead = 1.0 - smoothstep(0.8, 1.0, pr);

    // fade with distance, so 2007 sits far back in the haze
    float depth = mix(0.28, 1.0, smoothstep(uFar, uNear, cp.w));
    float wave = 0.0;
    for (int i = 0; i < 3; i++) {
      float age = uTime - uPulse[i].w;
      if (age > 0.0 && age < 2.4) {
        float x = (length(p - uPulse[i].xyz) - age * 30.0) / 3.0;
        wave += exp(-x * x) * (1.0 - age / 2.4);
      }
    }
    vOrange = max(aLine.x, min(1.0, wave * 1.4 + hi * 0.75));
    vBright = aLine.y * depth * (1.0 + wave * 2.6 + hi * 0.8);
  }
`;

const FRAG = /* glsl */ `
  uniform vec4 uQuietA;
  uniform vec4 uQuietB;
  uniform vec3 uQuietSoft;
  varying float vAcross;
  varying float vCore;
  varying float vGlow;
  varying float vAlong;
  varying float vProg;
  varying float vHead;
  varying float vBright;
  varying float vOrange;

  const vec3 WHITE = vec3(1.0, 0.955, 0.91);
  const vec3 ORANGE = vec3(0.961, 0.502, 0.145);

  float inside(vec4 r, float soft){
    vec2 p = gl_FragCoord.xy;
    vec2 a = smoothstep(r.xy - soft, r.xy + soft, p);
    vec2 b = 1.0 - smoothstep(r.zw - soft, r.zw + soft, p);
    return a.x * a.y * b.x * b.y;
  }

  void main(){
    float e = vProg - vAlong;
    if (e < 0.0) discard;
    float head = vHead * exp(-e * e * 900.0);
    float d = abs(vAcross);
    float w = max(vCore, 0.5);
    float core = clamp(w + 0.5 - d, 0.0, 1.0) * (vCore / w);
    float glow = exp(-d * d / max(vGlow * vGlow, 1e-3));
    vec3 base = mix(WHITE, ORANGE, vOrange);
    vec3 hot = mix(base, vec3(1.0), 0.6);
    vec3 col = (hot * core * (0.8 + head * 3.0) + base * glow * 0.24 * (1.0 + head * 1.5)) * vBright;
    col *= 1.0 - max(inside(uQuietA, uQuietSoft.x), inside(uQuietB, uQuietSoft.y)) * uQuietSoft.z;
    float lum = max(col.r, max(col.g, col.b));
    gl_FragColor = vec4(col, min(lum, 1.0));
  }
`;

function buildGeometry(THREE: typeof T, lines: Line[]) {
  let points = 0;
  let tris = 0;
  for (const l of lines) {
    points += l.pts.length;
    tris += (l.pts.length - 1) * 2;
  }
  const V = points * 2;
  const pos = new Float32Array(V * 3);
  const prev = new Float32Array(V * 3);
  const next = new Float32Array(V * 3);
  const ctr = new Float32Array(V * 3);
  const prevCtr = new Float32Array(V * 3);
  const nextCtr = new Float32Array(V * 3);
  const side = new Float32Array(V);
  const along = new Float32Array(V);
  const info = new Float32Array(V * 4);
  const width = new Float32Array(V);
  const role = new Float32Array(V);
  const index = V > 65535 ? new Uint32Array(tris * 3) : new Uint16Array(tris * 3);
  const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const extend = (a: number[], b: number[]) => [2 * a[0] - b[0], 2 * a[1] - b[1], 2 * a[2] - b[2]];

  let v = 0;
  let ii = 0;
  for (const l of lines) {
    const P = l.pts;
    const C = l.ctr;
    const n = P.length;
    const cum = new Float32Array(n);
    for (let i = 1; i < n; i++) cum[i] = cum[i - 1] + dist(P[i], P[i - 1]);
    const total = cum[n - 1] || 1;
    const base = v;
    for (let i = 0; i < n; i++) {
      const a = i === 0 ? extend(P[0], P[1]) : P[i - 1];
      const b = i === n - 1 ? extend(P[n - 1], P[n - 2]) : P[i + 1];
      const ca = i === 0 ? extend(C[0], C[1]) : C[i - 1];
      const cb = i === n - 1 ? extend(C[n - 1], C[n - 2]) : C[i + 1];
      for (let s = -1; s <= 1; s += 2) {
        pos.set(P[i], v * 3);
        prev.set(a, v * 3);
        next.set(b, v * 3);
        ctr.set(C[i], v * 3);
        prevCtr.set(ca, v * 3);
        nextCtr.set(cb, v * 3);
        side[v] = s;
        along[v] = cum[i] / total;
        info.set([l.orange, l.bright, l.start, l.dur], v * 4);
        width[v] = l.width;
        role[v] = l.role;
        v++;
      }
    }
    for (let i = 0; i < n - 1; i++) {
      const k = base + i * 2;
      index.set([k, k + 1, k + 2, k + 1, k + 3, k + 2], ii);
      ii += 6;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aPrev", new THREE.BufferAttribute(prev, 3));
  geo.setAttribute("aNext", new THREE.BufferAttribute(next, 3));
  geo.setAttribute("aCtr", new THREE.BufferAttribute(ctr, 3));
  geo.setAttribute("aPrevCtr", new THREE.BufferAttribute(prevCtr, 3));
  geo.setAttribute("aNextCtr", new THREE.BufferAttribute(nextCtr, 3));
  geo.setAttribute("aSide", new THREE.BufferAttribute(side, 1));
  geo.setAttribute("aAlong", new THREE.BufferAttribute(along, 1));
  geo.setAttribute("aLine", new THREE.BufferAttribute(info, 4));
  geo.setAttribute("aWidth", new THREE.BufferAttribute(width, 1));
  geo.setAttribute("aRole", new THREE.BufferAttribute(role, 1));
  geo.setIndex(new THREE.BufferAttribute(index, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  return geo;
}

function webgl2Available() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

export default function CareerScene({ roles, quiet }: { roles: SceneRole[]; quiet: string[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const hero = host?.closest("section");
    const labelsEl = labelsRef.current;
    const tagMaybe = tagRef.current;
    if (!host || !hero || !labelsEl || !tagMaybe) return undefined;
    const tag: HTMLDivElement = tagMaybe;
    const fail = () => host.classList.add("is-static");
    if (!webgl2Available()) {
      fail();
      return undefined;
    }
    let disposed = false;
    let cleanup = () => {};

    import("three")
      .then((THREE) => {
        if (disposed) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const small = window.innerWidth < 700;

        let renderer: T.WebGLRenderer;
        try {
          renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        } catch {
          fail();
          return;
        }
        let dpr = Math.min(window.devicePixelRatio || 1, 2);
        renderer.setPixelRatio(dpr);
        renderer.setClearColor(0x000000, 0);
        const canvas = renderer.domElement;
        host.prepend(canvas);

        const { lines, ticks, roleInfo, baseY } = buildCareer(roles, small);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 800);
        const uniforms = {
          uTime: { value: 0 },
          uRes: { value: new THREE.Vector2(1, 1) },
          uPx: { value: dpr },
          uOpen: { value: 0.2 },
          uFar: { value: 120 },
          uNear: { value: 40 },
          uQuietA: { value: new THREE.Vector4(0, 0, 0, 0) },
          uQuietB: { value: new THREE.Vector4(0, 0, 0, 0) },
          uQuietSoft: { value: new THREE.Vector3(1, 1, 0.6) },
          uPulse: { value: [0, 1, 2].map(() => new THREE.Vector4(0, 0, 0, -100)) },
          uRayO: { value: new THREE.Vector3(0, 0, 1000) },
          uRayD: { value: new THREE.Vector3(0, 0, -1) },
          uHover: { value: 0 },
          uHi: { value: new Array(MAX_ROLES).fill(0) as number[] },
        };
        const material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: VERT,
          fragmentShader: FRAG,
          transparent: true,
          side: THREE.DoubleSide,
          depthTest: false,
          depthWrite: false,
          blending: THREE.CustomBlending,
          blendEquation: THREE.AddEquation,
          blendSrc: THREE.OneFactor,
          blendDst: THREE.OneFactor,
          blendSrcAlpha: THREE.OneFactor,
          blendDstAlpha: THREE.OneFactor,
        });
        const geometry = buildGeometry(THREE, lines);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        scene.add(mesh);

        // ---- HTML labels: year ticks and the hovered role ----
        const tickEls = ticks.map((t) => {
          const el = document.createElement("span");
          el.className = t.now ? "scene-tick is-now" : "scene-tick";
          el.textContent = t.label;
          labelsEl.appendChild(el);
          return el;
        });
        const tagTitle = tag.querySelector("strong") as HTMLElement;
        const tagYears = tag.querySelector("span") as HTMLElement;

        // ---- camera: looks along the axis from the "now" end ----
        const target = new THREE.Vector3();
        // from the right and a little below, so the line rises toward today
        // phones look further along the axis: more foreshortening, so the
        // near end stays big on a narrow screen
        const dirWide = new THREE.Vector3(1.05, -0.09, 1).normalize();
        const dirPhone = new THREE.Vector3(1.9, -0.13, 1).normalize();
        let dirBase = dirWide;
        const dir = new THREE.Vector3();
        let dist = 60;
        const view = { w: 1, h: 1, phone: false };

        const ndc = new THREE.Vector2();
        const ndcTarget = new THREE.Vector2();
        const ray = new THREE.Raycaster();
        let hover = 0;
        let hoverTarget = 0;
        let hi = -1;
        let tagW = 0;
        const hiNow = new Array(MAX_ROLES).fill(0) as number[];
        let pulseIndex = 0;
        let lastPulse = -100;
        let rect = host.getBoundingClientRect();
        let t = 0;
        let raf = 0;
        let last = 0;
        let visible = false;
        let started = false;
        const ease = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);
        const v3 = new THREE.Vector3();

        function place(k: number) {
          // orbit in a little during the intro, then follow the pointer
          dir.copy(dirBase);
          dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), lerp(0.32, 0, easeOut(k)) + ndc.x * 0.07);
          dir.y += ndc.y * 0.05;
          dir.normalize();
          camera.position.copy(target).addScaledVector(dir, dist * lerp(1.22, 1, easeOut(k)));
          camera.lookAt(target);
          camera.updateMatrixWorld();
        }

        // fit: the whole axis sits inside the band at the bottom of the hero
        function fit() {
          const aspect = view.w / view.h;
          camera.aspect = aspect;
          camera.fov = view.phone ? 50 : 42;
          dirBase = view.phone ? dirPhone : dirWide;
          // aim a little ahead of the middle, toward today
          target.set(view.phone ? 6 : 4, 0, 0);
          const ends = [new THREE.Vector3(-LEN, baseY, 0), new THREE.Vector3(LEN, baseY - 1, 0), new THREE.Vector3(LEN, 2.8, 0), new THREE.Vector3(-LEN, 4, -3)];
          // the axis is wider at the near end, so centre its span on screen
          // (horizontal view offset), then fit it: closest camera that keeps
          // both ends inside the band
          const span = (shiftX: number) => {
            // shiftY puts the axis in the lower part of the canvas
            camera.setViewOffset(view.w, view.h, shiftX, -view.h * 0.17, view.w, view.h);
            camera.updateProjectionMatrix();
            let lo = 20;
            let hiD = 260;
            for (let i = 0; i < 26; i++) {
              dist = (lo + hiD) / 2;
              place(1);
              let ok = true;
              for (const e of ends) {
                v3.copy(e).project(camera);
                if (Math.abs(v3.x) > (view.phone ? 0.88 : 0.93) || v3.y < -0.86 || v3.y > (view.phone ? 0.3 : 0.12) || v3.z > 1) ok = false;
              }
              if (ok) hiD = dist;
              else lo = dist;
            }
            dist = hiD;
            place(1);
            let a = 1;
            let b = -1;
            for (const e of ends) {
              v3.copy(e).project(camera);
              a = Math.min(a, v3.x);
              b = Math.max(b, v3.x);
            }
            return (a + b) / 2;
          };
          let shift = 0;
          for (let i = 0; i < 4; i++) shift += span(shift) * (view.w / 2);
          span(shift);
          // depth haze runs from the near end to the far end
          v3.set(LEN, 0, 0);
          uniforms.uNear.value = v3.distanceTo(camera.position) + 2;
          v3.set(-LEN, 0, 0);
          uniforms.uFar.value = v3.distanceTo(camera.position) + 6;
        }

        function project(p: T.Vector3) {
          v3.copy(p).project(camera);
          return { x: (v3.x * 0.5 + 0.5) * view.w, y: (-v3.y * 0.5 + 0.5) * view.h };
        }

        function labels() {
          // near end first; a year that would crowd the one after it is skipped
          let lastX = Infinity;
          for (let i = ticks.length - 1; i >= 0; i--) {
            const tk = ticks[i];
            const p = project(new THREE.Vector3(tk.x, baseY - 0.6, 0));
            const el = tickEls[i];
            const room = lastX - p.x > (view.phone ? 40 : 46);
            if (room) lastX = p.x;
            el.style.transform = `translate(${p.x.toFixed(1)}px, ${(p.y + 8).toFixed(1)}px) translate(-50%, 0)`;
            el.style.opacity = room ? String(clamp01((t - tk.at) / 0.35)) : "0";
          }
          if (hi >= 0) {
            // the tag stays fully on screen; its pointer drops onto the role
            const r = roleInfo[hi];
            const p = project(new THREE.Vector3(r.x, r.y + r.top, r.z));
            const half = tagW / 2;
            const edge = view.phone ? 12 : 20;
            const x = Math.max(half + edge, Math.min(view.w - half - edge, p.x));
            const nub = Math.max(14, Math.min(tagW - 14, p.x - (x - half)));
            tag.style.transform = `translate(${x.toFixed(1)}px, ${(p.y - TAG_DROP).toFixed(1)}px) translate(-50%, -100%)`;
            tag.style.setProperty("--nub", `${nub.toFixed(1)}px`);
          }
        }

        function setHi(next: number) {
          if (next === hi) return;
          hi = next;
          if (hi >= 0) {
            tagTitle.textContent = roleInfo[hi].label;
            tagYears.textContent = roleInfo[hi].years;
            tagW = tag.offsetWidth;
            tag.classList.add("is-on");
            tag.classList.toggle("is-now", roleInfo[hi].current);
          } else {
            tag.classList.remove("is-on");
          }
        }

        // nearest role to the pointer, measured on screen along each spindle.
        // A fingertip gets a much wider reach than a mouse: the strands are a
        // few pixels thick, so a tap anywhere near one should still find it.
        function pick(px: number, py: number, reach = view.phone ? 34 : 46) {
          let best = -1;
          let bestD = reach;
          roleInfo.forEach((r, i) => {
            for (let s = 0; s <= 1.0001; s += 0.1) {
              const p = project(new THREE.Vector3(lerp(r.x0, r.x1, s), s > 0.15 && s < 0.85 ? r.y : 0, s > 0.15 && s < 0.85 ? r.z : 0));
              const d = Math.hypot(p.x - px, p.y - py);
              if (d < bestD) {
                bestD = d;
                best = i;
              }
            }
          });
          return best;
        }

        function step(dt: number) {
          ndc.lerp(ndcTarget, reduced ? 1 : ease(4.5, dt));
          hover += (hoverTarget - hover) * (reduced ? 1 : ease(4, dt));
          let lit = false;
          for (let i = 0; i < roleInfo.length && i < MAX_ROLES; i++) {
            const goal = i === hi ? 1 : 0;
            hiNow[i] += (goal - hiNow[i]) * (reduced ? 1 : ease(9, dt));
            if (Math.abs(goal - hiNow[i]) > 1e-3) lit = true;
            uniforms.uHi.value[i] = hiNow[i];
          }
          uniforms.uHover.value = hover;
          uniforms.uTime.value = t;
          const k = clamp01(t / INTRO);
          uniforms.uOpen.value = lerp(0.15, 1, easeOut(k * 1.15));
          place(k);
          ray.setFromCamera(ndc, camera);
          uniforms.uRayO.value.copy(ray.ray.origin);
          uniforms.uRayD.value.copy(ray.ray.direction);
          labels();
          const easing = ndc.distanceToSquared(ndcTarget) > 1e-7 || Math.abs(hoverTarget - hover) > 1e-3;
          return k < 1 || easing || lit || t - lastPulse < 3.2;
        }

        let slow = 0;
        let sampled = 0;
        function adapt(ms: number) {
          if (dpr <= 1 || sampled >= 30) return;
          sampled += 1;
          if (ms > 40) slow += 1;
          if (sampled === 30 && slow > 15) {
            dpr = 1;
            renderer.setPixelRatio(1);
            uniforms.uPx.value = 1;
            resize();
          }
        }

        function frame(now: number) {
          raf = 0;
          if (last) adapt(now - last);
          const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
          last = now;
          t += dt;
          const busy = step(dt);
          renderer.render(scene, camera);
          if (busy && visible && !document.hidden) raf = requestAnimationFrame(frame);
          else last = 0;
        }

        function kick() {
          if (reduced || raf || !visible || document.hidden) return;
          started = true;
          raf = requestAnimationFrame(frame);
        }

        function still() {
          t = 1000;
          step(1);
          renderer.render(scene, camera);
        }

        function resize() {
          if (!host) return;
          rect = host.getBoundingClientRect();
          const w = Math.max(1, Math.round(rect.width));
          const h = Math.max(1, Math.round(rect.height));
          renderer.setSize(w, h, false);
          canvas.style.width = "100%";
          canvas.style.height = "100%";
          renderer.getDrawingBufferSize(uniforms.uRes.value);
          const kpx = uniforms.uRes.value.y / h;
          [uniforms.uQuietA, uniforms.uQuietB].forEach((u, i) => {
            const el = quiet[i] ? document.querySelector(quiet[i]) : null;
            const r = el?.getBoundingClientRect();
            if (!r || !r.height) return;
            u.value.set((r.left - rect.left) * kpx, (rect.bottom - r.bottom) * kpx, (r.right - rect.left) * kpx, (rect.bottom - r.top) * kpx);
            uniforms.uQuietSoft.value.setComponent(i, Math.min(r.height * 0.3, 50) * kpx);
          });
          view.w = w;
          view.h = h;
          view.phone = w < 700;
          if (hi >= 0) tagW = tag.offsetWidth;
          fit();
          if (reduced) still();
          else if (started && !raf) {
            step(0);
            renderer.render(scene, camera);
          }
        }

        const toNdc = (e: PointerEvent, out: T.Vector2) => {
          rect = host.getBoundingClientRect();
          out.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
          return out;
        };
        const inside = (e: PointerEvent) => e.clientY >= rect.top && e.clientY <= rect.bottom;

        function onMove(e: PointerEvent) {
          if (e.pointerType === "touch") return;
          rect = host!.getBoundingClientRect();
          if (!reduced) {
            toNdc(e, ndcTarget);
            hoverTarget = inside(e) ? 1 : 0;
          }
          setHi(t > INTRO * 0.6 && inside(e) ? pick(e.clientX - rect.left, e.clientY - rect.top) : -1);
          if (reduced) still();
          else kick();
        }
        function onLeave(e: PointerEvent) {
          if (e.pointerType === "touch") return;
          ndcTarget.set(0, 0);
          hoverTarget = 0;
          setHi(-1);
          if (reduced) still();
          else kick();
        }
        function pulse(e: PointerEvent) {
          const at = toNdc(e, new THREE.Vector2());
          ray.setFromCamera(at, camera);
          // the pulse starts where the ray passes closest to the time axis
          const o = ray.ray.origin;
          const d = ray.ray.direction;
          const k = Math.abs(d.z) > 1e-4 ? -o.z / d.z : 40;
          const hit = o.clone().addScaledVector(d, k > 0 ? k : 40);
          uniforms.uPulse.value[pulseIndex].set(hit.x, hit.y, hit.z, t);
          pulseIndex = (pulseIndex + 1) % 3;
          lastPulse = t;
          kick();
        }
        let tap: { x: number; y: number; at: number } | null = null;
        function onDown(e: PointerEvent) {
          const el = e.target as Element;
          rect = host!.getBoundingClientRect();
          if (el.closest?.("a, button, input, textarea, label, select") || !inside(e)) return;
          if (e.pointerType === "touch") tap = { x: e.clientX, y: e.clientY, at: e.timeStamp };
          else if (!reduced) pulse(e);
        }
        // a tap names the nearest role (reduced motion included, minus the pulse)
        function onUp(e: PointerEvent) {
          if (e.pointerType !== "touch" || !tap) return;
          if (Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 14 && e.timeStamp - tap.at < 700) {
            rect = host!.getBoundingClientRect();
            setHi(pick(e.clientX - rect.left, e.clientY - rect.top, 72));
            if (reduced) still();
            else pulse(e);
          }
          tap = null;
        }
        function onCancel() {
          tap = null;
        }

        const io = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible) kick();
        });
        const ro = new ResizeObserver(resize);
        const onVisibility = () => !document.hidden && kick();
        const onContextLost = (e: Event) => {
          e.preventDefault();
          cancelAnimationFrame(raf);
          raf = 0;
          fail();
        };

        resize();
        document.fonts?.ready.then(() => !disposed && resize());
        ro.observe(host);
        io.observe(host);
        canvas.addEventListener("webglcontextlost", onContextLost);
        hero.addEventListener("pointermove", onMove, { passive: true });
        hero.addEventListener("pointerleave", onLeave, { passive: true });
        hero.addEventListener("pointerdown", onDown, { passive: true });
        hero.addEventListener("pointerup", onUp, { passive: true });
        hero.addEventListener("pointercancel", onCancel, { passive: true });
        document.addEventListener("visibilitychange", onVisibility);
        if (reduced) still();
        host.classList.add("is-ready");

        cleanup = () => {
          cancelAnimationFrame(raf);
          io.disconnect();
          ro.disconnect();
          canvas.removeEventListener("webglcontextlost", onContextLost);
          hero.removeEventListener("pointermove", onMove);
          hero.removeEventListener("pointerleave", onLeave);
          hero.removeEventListener("pointerdown", onDown);
          hero.removeEventListener("pointerup", onUp);
          hero.removeEventListener("pointercancel", onCancel);
          document.removeEventListener("visibilitychange", onVisibility);
          tickEls.forEach((el) => el.remove());
          geometry.dispose();
          material.dispose();
          renderer.dispose();
          canvas.remove();
        };
      })
      .catch(fail);

    return () => {
      disposed = true;
      cleanup();
    };
  }, [roles, quiet]);

  // The tag sits in its own layer: the scene is masked (its top fades out)
  // and stacks under the hero copy, and the tag must be above both.
  return (
    <>
      <div ref={hostRef} className="scene" aria-hidden="true">
        <div ref={labelsRef} className="scene-labels" />
      </div>
      <div className="scene-over" aria-hidden="true">
        <div ref={tagRef} className="scene-tag">
          <strong />
          <span />
        </div>
      </div>
    </>
  );
}
