// Temp art-lab screenshotter: pauses all animations at fixed timestamps and
// captures each family section. Usage: node scripts/_artlab_ex2.mjs [ms ms ...]
import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const OUT = resolve('scripts/_shots')
mkdirSync(OUT, { recursive: true })

const times = process.argv.slice(2).map(Number)
const FAM_TIMES = times.length ? times : [450, 950, 1500]
const BREATH_TIMES = times.length ? times : [2000, 5000, 9000, 14000]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1720, height: 2400 } })
page.on('console', m => console.log('[page]', m.text()))
page.on('pageerror', e => console.log('[pageerror]', e.message))
await page.goto(pathToFileURL(resolve('scripts/_artlab_ex2.html')).href)
await page.waitForTimeout(300)

async function freeze(ms) {
  await page.evaluate(t => {
    document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = t } catch {} })
  }, ms)
}

const fams = await page.$$eval('.fam', els => els.map(e => e.id))
console.log('families:', fams.join(', '))

for (const fam of fams) {
  const isBreath = fam.includes('breath')
  for (const t of (isBreath ? BREATH_TIMES : FAM_TIMES)) {
    await freeze(t)
    await page.locator('#' + fam).screenshot({ path: `${OUT}/${fam}-t${t}.png` })
  }
}
await freeze(1100)
await page.screenshot({ path: `${OUT}/_full-t1100.png`, fullPage: true })
await browser.close()
console.log('done ->', OUT)
