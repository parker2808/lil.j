import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const photosDir = path.join(root, "public", "photos");
const musicDir = path.join(root, "public", "music");

fs.mkdirSync(photosDir, { recursive: true });
fs.mkdirSync(musicDir, { recursive: true });

function svg(stops, inner) {
  const gradient = stops
    .map((color, index) => {
      const offset = stops.length === 1 ? 0 : index / (stops.length - 1);
      return `<stop offset="${offset}" stop-color="${color}"/>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">${gradient}</linearGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#bg)"/>
  ${inner}
</svg>
`;
}

const photos = [
  [
    "01.svg",
    ["#f2c58a", "#e07a55", "#6a3548"],
    `<circle cx="590" cy="210" r="78" fill="#ffe6b5"/>
     <rect x="150" y="210" width="390" height="470" fill="#2c1d24" opacity="0.28"/>
     <rect x="190" y="260" width="140" height="170" fill="#f8e7cf" opacity="0.7"/>
     <rect x="360" y="260" width="140" height="170" fill="#f8e7cf" opacity="0.4"/>
     <rect x="300" y="700" width="16" height="150" fill="#3e4a34"/>
     <ellipse cx="308" cy="690" rx="54" ry="20" fill="#6d8f62"/>`,
  ],
  [
    "02.svg",
    ["#f0b48a", "#7e6ea4", "#1d3558"],
    `<circle cx="560" cy="280" r="70" fill="#ffd7a8" opacity="0.9"/>
     <path d="M0 620 C180 560 280 700 460 640 C600 596 700 680 800 640 L800 1000 L0 1000 Z" fill="#1a3c55" opacity="0.55"/>
     <path d="M0 760 C200 700 320 820 520 760 C660 720 720 800 800 760 L800 1000 L0 1000 Z" fill="#123044"/>`,
  ],
  [
    "03.svg",
    ["#2a1630", "#6b2948", "#e07a4a"],
    `<circle cx="220" cy="300" r="46" fill="#ffb35a"/>
     <rect x="206" y="340" width="28" height="70" fill="#f2d2a2"/>
     <circle cx="400" cy="240" r="38" fill="#ffcf70"/>
     <rect x="388" y="272" width="24" height="80" fill="#f2d2a2"/>
     <circle cx="560" cy="330" r="42" fill="#ff9d4a"/>
     <rect x="548" y="366" width="24" height="64" fill="#f2d2a2"/>
     <rect x="0" y="760" width="800" height="240" fill="#140c14" opacity="0.45"/>`,
  ],
  [
    "04.svg",
    ["#8ea4b8", "#5d6e86", "#2c3548"],
    `<rect x="90" y="180" width="180" height="520" fill="#1d2433" opacity="0.35"/>
     <rect x="320" y="120" width="220" height="620" fill="#1d2433" opacity="0.45"/>
     <rect x="560" y="240" width="150" height="460" fill="#1d2433" opacity="0.3"/>
     <g stroke="#e7eef5" stroke-width="3" opacity="0.55">
       <path d="M80 0 L40 1000"/><path d="M200 0 L150 1000"/>
       <path d="M340 0 L280 1000"/><path d="M500 0 L430 1000"/>
       <path d="M660 0 L580 1000"/><path d="M760 0 L700 1000"/>
     </g>`,
  ],
  [
    "05.svg",
    ["#d7b08a", "#8c5a3c", "#3a241c"],
    `<ellipse cx="400" cy="760" rx="250" ry="36" fill="#2a1a14" opacity="0.35"/>
     <rect x="300" y="390" width="200" height="150" rx="16" fill="#f4efe6"/>
     <ellipse cx="400" cy="390" rx="100" ry="28" fill="#f7f3ec"/>
     <ellipse cx="400" cy="390" rx="70" ry="16" fill="#6b3e2e"/>
     <rect x="470" y="430" width="16" height="90" rx="8" fill="#c48a62"/>`,
  ],
  [
    "06.svg",
    ["#f7c1c8", "#e07a92", "#6d3b55"],
    `<circle cx="250" cy="420" r="70" fill="#fff1f3" opacity="0.85"/>
     <circle cx="400" cy="360" r="90" fill="#ffd0d8"/>
     <circle cx="540" cy="450" r="76" fill="#f4a3b5"/>
     <circle cx="330" cy="530" r="60" fill="#ffe4ea" opacity="0.8"/>
     <rect x="372" y="560" width="18" height="220" fill="#3f6b45"/>`,
  ],
  [
    "07.svg",
    ["#1c2430", "#3d5c4a", "#d7c4a1"],
    `<rect x="80" y="80" width="640" height="840" rx="24" fill="#10161c" opacity="0.35"/>
     <g stroke="#d7e2d4" stroke-width="8" opacity="0.35">
       <path d="M0 300 H800"/><path d="M0 460 H800"/><path d="M0 620 H800"/>
     </g>
     <circle cx="620" cy="220" r="36" fill="#f4e2bc" opacity="0.8"/>`,
  ],
  [
    "08.svg",
    ["#14182a", "#243056", "#6d7394"],
    `<circle cx="470" cy="340" r="110" fill="#f4edd8"/>
     <circle cx="520" cy="320" r="90" fill="#1a2140"/>
     <circle cx="160" cy="180" r="2" fill="#fff"/><circle cx="240" cy="260" r="1.5" fill="#fff"/>
     <circle cx="120" cy="420" r="2" fill="#fff"/><circle cx="680" cy="200" r="1.6" fill="#fff"/>
     <rect x="0" y="780" width="800" height="220" fill="#0c1018"/>`,
  ],
];

for (const [name, stops, inner] of photos) {
  fs.writeFileSync(path.join(photosDir, name), svg(stops, inner));
}

const stars = [];
let seed = 42;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
for (let i = 0; i < 70; i += 1) {
  const x = (rand() * 400).toFixed(1);
  const y = (rand() * 800).toFixed(1);
  const r = (rand() * 1.3 + 0.3).toFixed(2);
  const opacity = (0.25 + rand() * 0.7).toFixed(2);
  stars.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${opacity}"/>`);
}
fs.writeFileSync(
  path.join(root, "public", "stars.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 800" width="400" height="800">
    <rect width="400" height="800" fill="#09070f"/>
    ${stars.join("")}
  </svg>`,
);

fs.writeFileSync(
  path.join(root, "public", "favicon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <rect width="32" height="32" rx="8" fill="#09070f"/>
    <path d="M16 4l2.2 7.4L26 13.2l-6.4 2.2L16 28l-2.6-8.6L6 13.2l7.2-1.8z" fill="#e6c48a"/>
  </svg>`,
);

const rate = 22050;
const seconds = 8;
const total = rate * seconds;
const samples = new Float32Array(total);
const notes = [392, 440, 523.25, 493.88, 440, 392, 349.23, 392];
const step = 1;
for (let i = 0; i < total; i += 1) {
  const t = i / rate;
  let sample = 0;
  for (const freq of [130.81, 164.81, 196, 261.63]) {
    sample += Math.sin(2 * Math.PI * freq * t) * 0.045;
    sample += Math.sin(2 * Math.PI * freq * 1.004 * t) * 0.02;
  }
  const index = Math.floor(t / step) % notes.length;
  const local = t % step;
  const envelope = Math.sin(Math.min(1, local / step) * Math.PI) * Math.exp(-local * 1.4);
  sample += Math.sin(2 * Math.PI * notes[index] * t) * 0.08 * envelope;
  samples[i] = sample;
}
const fade = Math.floor(rate * 1.2);
const looped = samples.subarray(0, total - fade);
for (let i = 0; i < fade; i += 1) {
  const mix = i / fade;
  looped[i] = samples[i] * mix + samples[total - fade + i] * (1 - mix);
}
let peak = 0;
for (const value of looped) peak = Math.max(peak, Math.abs(value));
const gain = peak > 0 ? 0.55 / peak : 1;
const pcm = Buffer.alloc(looped.length * 2);
for (let i = 0; i < looped.length; i += 1) {
  const clamped = Math.max(-1, Math.min(1, looped[i] * gain));
  pcm.writeInt16LE(clamped * 32767, i * 2);
}
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(1, 22);
header.writeUInt32LE(rate, 24);
header.writeUInt32LE(rate * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);
fs.writeFileSync(path.join(musicDir, "nen.wav"), Buffer.concat([header, pcm]));

console.log(`Đã tạo ${photos.length} ảnh, stars.svg, favicon.svg, nen.wav (${pcm.length + 44} byte).`);
