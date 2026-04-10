// Run: node scripts/generate-icons.mjs
// Requires: npm install sharp --save-dev

import sharp from 'sharp';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, '../public/spiral-notebook.png');
const outDir = path.join(__dirname, '../public');

// Padding as a fraction of output size (12% each side = 24% total shrink)
const PADDING_RATIO = 0.12;

async function makeIcon(sizePx, outName) {
  const pad = Math.round(sizePx * PADDING_RATIO);
  const innerSize = sizePx - pad * 2;

  const resized = await sharp(src)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 253, g: 246, b: 227, alpha: 1 } })
    .toBuffer();

  await sharp({
    create: {
      width: sizePx,
      height: sizePx,
      channels: 4,
      background: { r: 253, g: 246, b: 227, alpha: 1 }, // cream #FDF6E3
    },
  })
    .composite([{ input: resized, top: pad, left: pad }])
    .png()
    .toFile(path.join(outDir, outName));

  console.log(`✓ ${outName} (${sizePx}×${sizePx}, padding ${pad}px)`);
}

await makeIcon(512, 'icon-512.png');
await makeIcon(192, 'icon-192.png');
await makeIcon(180, 'apple-touch-icon.png');

// Favicon: 32px, same treatment but tighter padding
const FAV = 32;
const favPad = Math.round(FAV * 0.08);
const favInner = FAV - favPad * 2;
const favResized = await sharp(src)
  .resize(favInner, favInner, { fit: 'contain', background: { r: 253, g: 246, b: 227, alpha: 1 } })
  .toBuffer();
await sharp({
  create: { width: FAV, height: FAV, channels: 4, background: { r: 253, g: 246, b: 227, alpha: 1 } },
})
  .composite([{ input: favResized, top: favPad, left: favPad }])
  .png()
  .toFile(path.join(outDir, 'favicon.png'));
console.log(`✓ favicon.png (${FAV}×${FAV})`);
