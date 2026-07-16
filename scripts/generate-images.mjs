#!/usr/bin/env node
/**
 * generate-images.mjs — realistic, on-brand site imagery via the OpenAI image API.
 *
 * You run this with YOUR OWN OpenAI key. It is never committed.
 *   1.  cp .env.example .env      # then paste your key into .env
 *   2.  npm install
 *   3.  npm run images            # generate everything that's missing
 *       npm run images -- --force # regenerate everything
 *       npm run images -- --only hero,airport
 *       npm run images -- --list  # show all slots and exit
 *
 * Output: assets/images/<slot>.webp  (web-ready, small).
 * Cost: roughly $0.02–0.25 per image on gpt-image-2; the whole set is a few dollars.
 *
 * IMPORTANT — read scripts/IMAGE-NOTES before publishing:
 *   • Check EVERY car render is RIGHT-HAND-DRIVE (wheel on the right). The model
 *     defaults to US left-hand-drive; reject any wrong-side result.
 *   • Slots marked realPhoto:true should ultimately be REAL photos. AI here is a
 *     temporary placeholder only — never ship an AI-fabricated "owner".
 *   • Never keep a render with a legible number plate or an invented brand badge.
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'assets', 'images');

/* -- tiny .env loader (no dependency) ------------------------------------ */
function loadEnv() {
  const path = join(ROOT, '.env');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

/* -- shared house style: keeps the whole set looking like one real brand --
   THE CAR IS A RED TOYOTA COROLLA (his actual car, ~5 years old). Keep it that
   way in every shot — an ordinary, friendly, well-kept everyday car, not an
   executive motor. */
const STYLE =
  'House style (apply to every image): photorealistic editorial documentary photograph, ' +
  'full-frame camera, 35mm lens, soft overcast English daylight, natural realistic shadows, ' +
  'muted true-to-life colour — NOT glossy stock advertising, no lens flare, no HDR, no text, ' +
  'no watermark. United Kingdom setting, RIGHT-HAND-DRIVE (steering wheel on the RIGHT). ' +
  'The car is a clean, well-kept RED TOYOTA COROLLA, a recent model about five years old ' +
  '(2019-2021 twelfth-generation Corolla), spotless red bodywork — an ordinary, friendly, ' +
  'reliable everyday family car, NOT a luxury or executive car. Keep number plates blank or ' +
  'angled away (never legible). Friendly, local, approachable, never flashy. Distinctly ' +
  'English countryside/townscape, not Mediterranean, not American.';

/* -- the image set ------------------------------------------------------- */
const IMAGE_MANIFEST = [
  {
    slot: 'hero', size: '1536x1024', quality: 'high', realPhoto: false,
    prompt:
      'A clean red Toyota Corolla (recent model, about five years old) parked on the grass ' +
      'verge of a quiet single-track Surrey Hills country lane at soft golden hour. Tall green ' +
      'hedgerows, mature oak and beech trees, rolling farmland beyond, damp tarmac catching ' +
      'gentle light. Composition wide and calm with clean uncluttered sky in the upper-right ' +
      'third for headline text. Trustworthy, unhurried.',
  },
  {
    slot: 'about', size: '1024x1536', quality: 'high', realPhoto: true,
    prompt:
      'PREFER A REAL PHOTO of his actual red Corolla (a quick wash-and-photograph beats any ' +
      'render). AI version: the freshly cleaned red Toyota Corolla parked on a leafy Surrey ' +
      'village street with tile-hung cottages softly blurred behind, soft daylight, editorial ' +
      'documentary feel. Optionally a friendly driver in a smart-casual jacket standing easily ' +
      'beside the car, seen from a respectful distance with the face not the focus (keep any ' +
      'person generic and illustrative, not a specific named individual). Spotless red bodywork, ' +
      'welcoming and trustworthy. Vertical framing with headroom.',
  },
  {
    slot: 'vehicle-exterior', size: '1536x1024', quality: 'high', realPhoto: true,
    prompt:
      'PREFER A REAL PHOTO OF THE ACTUAL CAR. AI version: three-quarter front view of a ' +
      'spotlessly clean red Toyota Corolla (recent ~5-year-old model) parked on a gravel ' +
      'driveway or quiet Godalming residential street lined with red-brick and tile-hung Surrey ' +
      'houses. Clean red bodywork with realistic reflections, tidy wheels. Honest and friendly, ' +
      'not a showroom advert.',
  },
  {
    slot: 'vehicle-interior', size: '1536x1024', quality: 'high', realPhoto: true,
    prompt:
      'PREFER A REAL PHOTO of the actual clean cabin. AI version: rear-passenger POV of a clean, ' +
      'tidy Toyota Corolla cabin — neat cloth/part-leather rear seats, immaculate carpets, a ' +
      'bottle of water in the door pocket, a phone-charging cable neatly to hand, seatbelts ' +
      'fastened. Through the windscreen a leafy green English lane. Dashboard clearly shows the ' +
      'steering wheel on the RIGHT. Warm, comfortable, spotless.',
  },
  {
    slot: 'airport', size: '1536x1024', quality: 'high', realPhoto: false,
    prompt:
      'A smart, friendly driver in a dark jacket standing calmly in a bright modern international ' +
      'airport arrivals hall, holding a plain white name-board that is BLANK (no readable text). ' +
      'A relieved traveller with a wheeled suitcase walking toward them. Generic modern terminal ' +
      'architecture — absolutely NO real airport names, airline logos, trademarks or legible ' +
      'signage. Reassuring, calm, professional, British. If a car is visible it is the red ' +
      'Toyota Corolla.',
  },
  {
    slot: 'local-village', size: '1536x1024', quality: 'medium', realPhoto: true,
    prompt:
      'STRONGLY PREFER a real, self-shot photo of Chiddingfold village green — do NOT ask AI to ' +
      'reproduce a specific named listed building. AI placeholder for a GENERIC scene only: a ' +
      'quintessential Surrey village green with a still pond, mature trees, and generic ' +
      'timber-framed and tile-hung cottages around a triangular green, an old English country ' +
      'pub in the background. Quiet, timeless, no signage, no legible pub names, no people needed.',
  },
  {
    slot: 'local-godalming', size: '1536x1024', quality: 'medium', realPhoto: true,
    prompt:
      'STRONGLY PREFER a real photo of Godalming High Street / the Georgian "Pepperpot". AI ' +
      'placeholder (generic only): a characterful old English market-town high street with Tudor ' +
      'timber-framed and Georgian brick buildings, a small stucco Georgian market-hall on a ' +
      'triangular junction, quiet weekday calm. No legible shop names or signage.',
  },
  {
    slot: 'night-24-7', size: '1536x1024', quality: 'medium', realPhoto: false,
    prompt:
      'Reassuring blue-hour scene (not noir): the clean red Toyota Corolla waiting on a quiet ' +
      'Surrey lane or on a home driveway in the early pre-dawn dark. Warm headlights and a soft ' +
      'glow from the cabin, wet tarmac reflecting light, a calm deep-blue dawn sky beginning to ' +
      'lighten behind bare-branched trees. Conveys quiet, dependable, always-available service.',
  },
];

/* -- runner -------------------------------------------------------------- */
const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const LIST = args.includes('--list');
const onlyIdx = args.indexOf('--only');
const ONLY = onlyIdx !== -1 && args[onlyIdx + 1] ? args[onlyIdx + 1].split(',').map((s) => s.trim()) : null;

if (LIST) {
  console.log('Image slots (assets/images/<slot>.webp):\n' +
    IMAGE_MANIFEST.map((i) => `  • ${i.slot.padEnd(18)} ${i.size}  ${i.quality}${i.realPhoto ? '   ⚑ prefer a REAL photo' : ''}`).join('\n'));
  process.exit(0);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('\n✗ No OPENAI_API_KEY found. Copy .env.example to .env and add your key.\n');
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const todo = IMAGE_MANIFEST.filter((img) => {
  if (ONLY && !ONLY.includes(img.slot)) return false;
  if (!FORCE && existsSync(join(OUT_DIR, `${img.slot}.webp`))) {
    console.log(`• skip ${img.slot} (exists — use --force to redo)`);
    return false;
  }
  return true;
});

if (!todo.length) {
  console.log('\nNothing to generate. Use --force to regenerate, or --only <slot>.\n');
  process.exit(0);
}

console.log(`\nGenerating ${todo.length} image(s) with gpt-image-2…\n`);
let ok = 0;
for (const img of todo) {
  process.stdout.write(`  … ${img.slot} ${img.realPhoto ? '(placeholder — swap for a real photo) ' : ''}`);
  try {
    const res = await openai.images.generate({
      model: 'gpt-image-2',
      prompt: `${img.prompt}\n\n${STYLE}`,
      size: img.size,
      quality: img.quality,
      output_format: 'webp',
      n: 1,
    });
    writeFileSync(join(OUT_DIR, `${img.slot}.webp`), Buffer.from(res.data[0].b64_json, 'base64'));
    console.log('✓');
    ok++;
  } catch (err) {
    console.log('✗');
    console.error(`    ${err?.message || err}`);
  }
}
console.log(`\nDone. ${ok}/${todo.length} generated into assets/images/.\n`);
console.log('CHECK EACH IMAGE:  right-hand-drive · no legible plate · no fake badges.');
console.log('Then swap every ⚑ slot for a real photo as soon as you can (driver, car, local scenes).\n');
