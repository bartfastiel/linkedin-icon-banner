#!/usr/bin/env node
// Icon banner generator: a clear space for the profile photo, small dense icons around it,
// growing, sparser and softer with distance, lit from the left. No dependencies.
//
//   node banner.mjs --out banner.svg [--theme dark|light] [--avatar 208,364,152]
//                   [--icons bus,chip,cloud] [--seed 1] [--bg0 #hex --bg1 #hex --bg2 #hex --ink #hex --lit #hex --blue #hex --warm #hex]
//   node banner.mjs --list            # prints the available icon names
import fs from 'node:fs';
import { ICONS } from './icons.mjs';

const a = Object.fromEntries(process.argv.slice(2).reduce((r, v, i, all) => (v.startsWith('--') ? [...r, [v.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : r), []));
if (a.list) { for (const [k, [label]] of Object.entries(ICONS)) console.log(k.padEnd(14), label); process.exit(0); }

const W = 1584, H = 396;                                   // LinkedIn banner size
const [AX, AY, AR] = (a.avatar || '208,364,152').split(',').map(Number); // photo centre and radius in banner pixels
const GAP_NEAR = 4, GAP_FAR = 24, BLUR = 1.15;
const theme = {
  dark: { bg0: '#2a4766', bg1: '#1d3550', bg2: '#101f31', ink: '#c9d8e8', lit: '#fff1de', blue: '#62b6e8', warm: '#e8ae95', a0: 0.9, a1: 0.85 },
  light: { bg0: '#f7f2ea', bg1: '#ece6dc', bg2: '#d9d2c7', ink: '#1f3a5a', lit: '#1f3a5a', blue: '#2b82bf', warm: '#bf7563', a0: 0.85, a1: 0.85 },
}[a.theme === 'light' ? 'light' : 'dark'];
for (const k of ['bg0', 'bg1', 'bg2', 'ink', 'lit', 'blue', 'warm']) if (a[k]) theme[k] = a[k];

let seed = +(a.seed || 1);
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const names = (a.icons ? String(a.icons).split(',') : Object.keys(ICONS)).filter((n) => ICONS[n]);
if (!names.length) throw new Error('no valid icons; run with --list');

const FAR = 1300, CLEAR = AR + 20;
const scaleAt = (d) => Math.min(1.75, 0.46 + 1.2 * Math.pow(Math.min(1.25, d / FAR), 1.1));
const gapAt = (d) => GAP_NEAR + (GAP_FAR - GAP_NEAR) * Math.min(1, d / FAR);
const BIG = { family: 1.45, climbing: 1.45 };

const wt = Object.fromEntries(String(a.weights || '').split(',').filter(Boolean).map((p) => p.split('=')).map(([k, v]) => [k, +v])); // e.g. --weights battery=2,bolt=2
const counts = Object.fromEntries(names.map((n) => [n, 0]));
const placed = [];
for (let it = 0, fails = 0; it < 90000 && fails < 4000; it++) {
  const sc = (n) => counts[n] / (wt[n] || 1), m = Math.min(...names.map(sc)), pool = names.filter((n) => sc(n) === m), id = pool[Math.floor(rnd() * pool.length)];
  const x = rnd() * W, y = rnd() * H, d = Math.hypot(x - AX, y - AY);
  const s = scaleAt(d) * (BIG[id] || 1) * (0.9 + rnd() * 0.22), r = 24 * s;
  if (d < CLEAR + r * 0.6) { fails++; continue; }
  if (placed.every((p) => Math.hypot(p.x - x, p.y - y) > p.r + r + Math.max(gapAt(d), p.g))) {
    const q = rnd();
    placed.push({ id, x, y, s, r, g: gapAt(d), d, rot: (rnd() - 0.5) * 80, color: q < 0.78 ? theme.ink : q < 0.89 ? theme.blue : theme.warm, alpha: theme.a0 - (theme.a0 - theme.a1) * Math.min(1, d / 1450) });
    counts[id]++; fails = 0;
  } else fails++;
}

const blurOf = (d) => Math.min(BLUR, Math.round((BLUR * Math.max(0, (d - 420) / (FAR - 420))) / 0.35) * 0.35);
const filters = [...new Set(placed.map((p) => blurOf(p.d).toFixed(2)))].filter((v) => +v > 0).map((v) => `<filter id="b${v.replace('.', '_')}" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="${v}"/></filter>`).join('');
// light comes from the left: the lit side of every icon is brighter, the far side fades out
const L = Math.hypot(0.95, 0.3), sx = 0.95 / L, sy = 0.3 / L;
let grads = '', uses = '';
placed.forEach((p, i) => {
  const c = Math.cos(p.rot * Math.PI / 180), sn = Math.sin(p.rot * Math.PI / 180), vx = sx * c + sy * sn, vy = -sx * sn + sy * c;
  const lit = p.color === theme.ink ? theme.lit : p.color;
  grads += `<linearGradient id="g${i}" gradientUnits="userSpaceOnUse" x1="${(24 - vx * 24).toFixed(1)}" y1="${(24 - vy * 24).toFixed(1)}" x2="${(24 + vx * 24).toFixed(1)}" y2="${(24 + vy * 24).toFixed(1)}"><stop offset="0" stop-color="${lit}"/><stop offset="0.5" stop-color="${p.color}" stop-opacity="0.8"/><stop offset="1" stop-color="${p.color}" stop-opacity="0.26"/></linearGradient>`;
  const b = blurOf(p.d).toFixed(2);
  uses += `<use href="#i-${p.id}" stroke="url(#g${i})" opacity="${p.alpha.toFixed(2)}"${+b > 0 ? ` filter="url(#b${b.replace('.', '_')})"` : ''} transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rot.toFixed(1)}) scale(${p.s.toFixed(2)}) translate(-24 -24)"/>`;
});
const defs = names.map((n) => `<g id="i-${n}" fill="none" stroke-linecap="round" stroke-linejoin="round">${ICONS[n][1].replace(/<(ellipse|path|circle|rect) /g, '<$1 vector-effect="non-scaling-stroke" ')}</g>`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}<radialGradient id="bg" gradientUnits="userSpaceOnUse" cx="${AX}" cy="${AY}" r="1300"><stop offset="0" stop-color="${theme.bg0}"/><stop offset="0.3" stop-color="${theme.bg1}"/><stop offset="1" stop-color="${theme.bg2}"/></radialGradient>${filters}${grads}<clipPath id="c"><rect width="${W}" height="${H}"/></clipPath></defs><g clip-path="url(#c)"><rect width="${W}" height="${H}" fill="url(#bg)"/><g stroke-width="2.4">${uses}</g></g></svg>`;
fs.writeFileSync(a.out || 'banner.svg', svg);
console.error(`${placed.length} icons placed (${names.length} kinds)`);
