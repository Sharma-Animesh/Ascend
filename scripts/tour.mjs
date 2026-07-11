// Browser tour: drives the built app and screenshots every page.
// Usage: node scripts/tour.mjs <phase1|phase2> <shotsDir>
// Env: SUPABASE_ACCESS_TOKEN required in phase1 (toggles test-user onboarded flag).
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:4173'
const EMAIL = 'hunter.test@ascend.dev'
const PASSWORD = 'AscendTest!2026'
const REF = 'gzljmdgwnmrvsjtvnoqt'
const phase = process.argv[2] ?? 'phase1'
const OUT = process.argv[3] ?? 'shots'
mkdirSync(OUT, { recursive: true })

const consoleErrors = []

async function sql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error(`sql failed: ${await res.text()}`)
}

function watch(page, tag) {
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(`[${tag}] ${m.text().slice(0, 300)}`)
  })
  page.on('pageerror', (e) => consoleErrors.push(`[${tag}] PAGEERROR ${String(e).slice(0, 300)}`))
}

async function shot(page, name, fullPage = false) {
  await page.waitForTimeout(1400)
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage })
  console.log('shot', name)
}

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'load' })
  await page.locator('input[type="email"]').first().fill(EMAIL)
  await page.locator('input[type="password"]').first().fill(PASSWORD)
  const submit = page.locator('button[type="submit"]').first()
  if (await submit.count()) await submit.click()
  else await page.locator('button', { hasText: /log|enter|sign/i }).first().click()
  await page.waitForURL(/\/(app|awakening)/, { timeout: 20000 })
  await page.waitForTimeout(1000)
}

const browser = await chromium.launch()
const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36',
  isMobile: true,
  hasTouch: true,
})
const dp = await desktop.newPage()
const mp = await mobile.newPage()
watch(dp, 'desktop')
watch(mp, 'mobile')

if (phase === 'phase1') {
  // public pages
  await dp.goto(`${BASE}/`, { waitUntil: 'load' })
  await shot(dp, '01-landing-desktop', true)
  await mp.goto(`${BASE}/`, { waitUntil: 'load' })
  await shot(mp, '02-landing-mobile', true)
  await mp.goto(`${BASE}/login`, { waitUntil: 'load' })
  await shot(mp, '03-login-mobile')
  await mp.goto(`${BASE}/register`, { waitUntil: 'load' })
  await shot(mp, '04-register-mobile')

  // awakening (force not-onboarded)
  await sql(`update public.profiles set onboarded=false where id in (select id from auth.users where email='${EMAIL}')`)
  await login(mp)
  await shot(mp, '05-awakening-intro-mobile')
  try {
    await mp.locator('button', { hasText: /begin|start|proceed|continue|initiate|accept/i }).first().click()
    await shot(mp, '06-awakening-step2-mobile')
  } catch {
    console.log('skip awakening step2:', 'no matching button')
  }

  // main app (restore onboarded)
  await sql(`update public.profiles set onboarded=true where id in (select id from auth.users where email='${EMAIL}')`)
  await mp.goto(`${BASE}/app`, { waitUntil: 'load' })
  await mp.waitForTimeout(3500) // quest generation
  await shot(mp, '07-dashboard-mobile', true)

  await login(dp)
  await dp.goto(`${BASE}/app`, { waitUntil: 'load' })
  await dp.waitForTimeout(2500)
  await shot(dp, '08-dashboard-desktop', true)

  try {
    await mp.locator('a[href*="/app/quests/"]').first().click()
    await mp.waitForURL(/\/app\/quests\//, { timeout: 10000 })
    await shot(mp, '09-quest-player-mobile', true)
  } catch {
    console.log('skip quest player: no quest card link found')
  }

  const pages = [
    ['stats', true],
    ['progress', true],
    ['exercises', true],
    ['nutrition', true],
    ['goals', false],
    ['profile', true],
  ]
  let i = 10
  for (const [p, full] of pages) {
    await mp.goto(`${BASE}/app/${p}`, { waitUntil: 'load' })
    await shot(mp, `${String(i).padStart(2, '0')}-${p}-mobile`, full)
    i++
  }
  await dp.goto(`${BASE}/app/stats`, { waitUntil: 'load' })
  await shot(dp, `${i++}-stats-desktop`, true)
  try {
    await mp.goto(`${BASE}/app/exercises`, { waitUntil: 'load' })
    await mp.waitForTimeout(1500)
    await mp.locator('a[href*="/app/exercises/"]').first().click()
    await mp.waitForURL(/\/app\/exercises\/.+/, { timeout: 10000 })
    await shot(mp, `${i++}-exercise-detail-mobile`, true)
  } catch {
    console.log('skip exercise detail: no card link')
  }
} else {
  // phase2: admin pages (test user must already be admin)
  await login(dp)
  const adminPages = ['admin', 'admin/exercises', 'admin/users', 'admin/announcements']
  let i = 20
  for (const p of adminPages) {
    await dp.goto(`${BASE}/app/${p}`, { waitUntil: 'load' })
    await shot(dp, `${i++}-${p.replace('/', '-')}-desktop`, true)
  }
  await login(mp)
  await mp.goto(`${BASE}/app/admin/exercises`, { waitUntil: 'load' })
  await shot(mp, `${i++}-admin-exercises-mobile`, true)
}

await browser.close()
console.log(`\nconsole errors: ${consoleErrors.length}`)
for (const e of consoleErrors.slice(0, 20)) console.log(' ', e)
