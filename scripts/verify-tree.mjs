// Screenshots the Streak Grove in every state by mutating the test user's
// character between reloads. Also regenerates today's quests to capture the
// new Daily Challenge, and opens it in the QuestPlayer.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:4173'
const EMAIL = 'hunter.test@ascend.dev'
const PASSWORD = 'AscendTest!2026'
const REF = 'gzljmdgwnmrvsjtvnoqt'
const OUT = process.argv[2]
mkdirSync(OUT, { recursive: true })

const errors = []

async function sql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error(await res.text())
}

const setChar = (streak, daysAgo, level = 1) =>
  sql(`update public.character_profiles set streak=${streak}, longest_streak=greatest(longest_streak,${streak}), level=${level},
       last_activity_date=(current_date - interval '${daysAgo} days')::date
       where user_id=(select id from auth.users where email='${EMAIL}')`)

const clearQuests = () =>
  sql(`delete from public.quests where user_id=(select id from auth.users where email='${EMAIL}')`)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 1100 } })
page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 250)))
page.on('pageerror', (e) => errors.push('PAGEERROR ' + String(e).slice(0, 250)))

// login
await page.goto(`${BASE}/login`, { waitUntil: 'load' })
await page.locator('input[type="email"]').fill(EMAIL)
await page.locator('input[type="password"]').fill(PASSWORD)
await page.locator('button[type="submit"]').click()
await page.waitForURL(/\/app/, { timeout: 20000 })

const states = [
  ['t1-sapling-healthy', 3, 0, 1],
  ['t2-flourishing-healthy', 25, 0, 10],
  ['t3-grand-healthy', 70, 0, 20],
  ['t4-sacred-grove-160', 160, 0, 30],
  ['t5-thirsty-gold', 25, 2, 10],
  ['t6-withered', 25, 5, 10],
]

await clearQuests() // force fresh generation incl. Daily Challenge
for (const [name, streak, daysAgo, level] of states) {
  await setChar(streak, daysAgo, level)
  await page.goto(`${BASE}/app`, { waitUntil: 'load' })
  await page.waitForTimeout(3200)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('shot', name)
}

// open the Daily Challenge in the QuestPlayer
await page.goto(`${BASE}/app`, { waitUntil: 'load' })
await page.waitForTimeout(2500)
const card = page.locator('a[href*="/app/quests/"]', { hasText: /daily challenge/i }).first()
if (await card.count()) {
  await card.click()
  await page.waitForURL(/\/app\/quests\//, { timeout: 10000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${OUT}/t7-daily-challenge-player.png`, fullPage: true })
  console.log('shot t7-daily-challenge-player')
} else {
  console.log('WARN: no Daily Challenge card found')
}

// restore a sane state
await setChar(1, 0, 1)
await browser.close()
console.log(`console errors: ${errors.length}`)
errors.slice(0, 10).forEach((e) => console.log(' ', e))
