#!/usr/bin/env node
/**
 * Nén ảnh đã tải từ Facebook → WebP, chiều rộng tối đa ~1200px.
 *
 * Usage:
 *   npm install
 *   node compress.mjs [thư-mục-vào] [thư-mục-ra]
 *
 * Mặc định:
 *   vào:  ./input
 *   ra:   ./output
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INPUT = path.resolve(process.argv[2] || path.join(__dirname, "input"));
const OUTPUT = path.resolve(process.argv[3] || path.join(__dirname, "output"));
const MAX_WIDTH = Number(process.env.MAX_WIDTH || 1200);
const WEBP_QUALITY = Number(process.env.WEBP_QUALITY || 82);

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".tif", ".tiff", ".avif"]);

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function listImages(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(`Không tìm thấy thư mục input: ${dir}`);
      console.error("Tạo thư mục và bỏ ảnh vào, ví dụ: mkdir -p input && cp ~/Downloads/fb-photos/* input/");
      process.exit(1);
    }
    throw err;
  }
  return entries
    .filter((e) => e.isFile() && IMAGE_EXT.has(path.extname(e.name).toLowerCase()))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

async function compressOne(name) {
  const src = path.join(INPUT, name);
  const base = path.basename(name, path.extname(name));
  const dest = path.join(OUTPUT, `${base}.webp`);

  const pipeline = sharp(src, { failOn: "none" }).rotate(); // honor EXIF orientation
  const meta = await pipeline.metadata();
  const width = meta.width || MAX_WIDTH;

  let img = sharp(src, { failOn: "none" }).rotate();
  if (width > MAX_WIDTH) {
    img = img.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  await img.webp({ quality: WEBP_QUALITY, effort: 4 }).toFile(dest);

  const [inStat, outStat] = await Promise.all([fs.stat(src), fs.stat(dest)]);
  const pct = ((1 - outStat.size / inStat.size) * 100).toFixed(1);
  console.log(
    `✓ ${name} → ${path.basename(dest)}  (${formatBytes(inStat.size)} → ${formatBytes(outStat.size)}, ${pct}%)`
  );
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  console.log(`Input : ${INPUT}`);
  console.log(`Output: ${OUTPUT}`);
  console.log(`Max width: ${MAX_WIDTH}px · WebP quality: ${WEBP_QUALITY}`);

  await ensureDir(OUTPUT);
  const files = await listImages(INPUT);
  if (!files.length) {
    console.error("Không có ảnh nào trong thư mục input.");
    process.exit(1);
  }

  let ok = 0;
  let fail = 0;
  for (const name of files) {
    try {
      await compressOne(name);
      ok += 1;
    } catch (err) {
      fail += 1;
      console.error(`✗ ${name}: ${err.message || err}`);
    }
  }

  console.log(`\nXong: ${ok} ok · ${fail} lỗi`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
