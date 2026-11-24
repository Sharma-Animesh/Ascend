// Renders PWA / store icons and Capacitor native assets from the SVG logo.
import sharp from 'sharp'
import { mkdirSync, readFileSync } from 'node:fs'

const svg = readFileSync('public/favicon.svg')
mkdirSync('public/icons', { recursive: true })
mkdirSync('assets', { recursive: true })

const BG = '#04060d'

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

// ---- Capacitor native assets (assets/ consumed by @capacitor/assets) ----
const logo = async (size) => sharp(svg, { density: 300 }).resize(size, size).png().toBuffer()

// 1024 master icon (transparent logo)
await sharp(await logo(1024)).toFile('assets/icon-only.png')
console.log('wrote assets/icon-only.png')

// Adaptive-icon foreground: logo scaled into the ~66% safe zone
const fgLogo = await sharp(svg, { density: 300 }).resize(660, 660).png().toBuffer()
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: fgLogo, top: 182, left: 182 }])
  .png()
  .toFile('assets/icon-foreground.png')
console.log('wrote assets/icon-foreground.png')

// Adaptive-icon background: solid abyss color
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: BG } })
  .png()
  .toFile('assets/icon-background.png')
console.log('wrote assets/icon-background.png')

// Splash screens: centered logo on abyss (app is always dark; both variants equal)
const splashLogo = await sharp(svg, { density: 300 }).resize(640, 640).png().toBuffer()
const splash = sharp({ create: { width: 2732, height: 2732, channels: 4, background: BG } })
  .composite([{ input: splashLogo, top: (2732 - 640) / 2, left: (2732 - 640) / 2 }])
  .png()
await splash.clone().toFile('assets/splash.png')
await splash.clone().toFile('assets/splash-dark.png')
console.log('wrote assets/splash.png + assets/splash-dark.png')
