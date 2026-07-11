// Renders PWA / store icons from the SVG logo using sharp.
import sharp from 'sharp'
import { mkdirSync, readFileSync } from 'node:fs'

const svg = readFileSync('public/favicon.svg')
mkdirSync('public/icons', { recursive: true })

const jobs = [
  ['public/icons/icon-192.png', 192],
  ['public/icons/icon-512.png', 512],
  ['public/icons/icon-maskable-512.png', 512],
  ['public/icons/apple-touch-icon.png', 180],
]
for (const [out, size] of jobs) {
  await sharp(svg, { density: 300 }).resize(size, size).png().toFile(out)
  console.log('wrote', out)
}
