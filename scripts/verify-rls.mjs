// End-to-end contract check: signs in as the test user and exercises every
// table the app touches, plus negative tests for the security rules.
// Usage: node scripts/verify-rls.mjs <email> <password>
const URL = 'https://gzljmdgwnmrvsjtvnoqt.supabase.co'
const ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6bGptZGd3bm1ydnNqdHZub3F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NDQwNTgsImV4cCI6MjA5OTMyMDA1OH0.NYTjXL91An6MeMCfoZ0-prTj-Ku22IWEpZWunmV53Pc'

const [email, password] = process.argv.slice(2)
let pass = 0
let fail = 0
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`)
  ok ? pass++ : fail++
}

// sign in
const tokenRes = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { apikey: ANON, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
const token = await tokenRes.json()
check('sign in with password', !!token.access_token, token.error_description || '')
if (!token.access_token) process.exit(1)
const uid = token.user.id
const H = { apikey: ANON, Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' }
const rest = (path, init = {}) => fetch(`${URL}/rest/v1/${path}`, { ...init, headers: { ...H, ...(init.headers || {}) } })
const json = async (r) => (r.status === 204 ? null : r.json())

// trigger-provisioned rows
const prof = await json(await rest(`profiles?id=eq.${uid}&select=*`))
check('profile auto-provisioned by trigger', prof?.length === 1 && prof[0].role === 'user', `display_name=${prof?.[0]?.display_name}`)
const char = await json(await rest(`character_profiles?user_id=eq.${uid}&select=*`))
check('character auto-provisioned (level 1, rank E)', char?.length === 1 && char[0].level === 1 && char[0].rank === 'E')

// SECURITY: self-promotion to admin must be impossible
const promo = await rest(`profiles?id=eq.${uid}`, { method: 'PATCH', body: JSON.stringify({ role: 'admin' }) })
const promoBody = await promo.text()
check('cannot set own role=admin (column lock)', promo.status >= 400, `status ${promo.status}`)
if (promo.status < 400) console.log('   !!', promoBody.slice(0, 200))

// SECURITY: admin RPC refuses non-admins
const rpc = await rest('rpc/admin_set_role', { method: 'POST', body: JSON.stringify({ target_user: uid, new_role: 'admin' }) })
check('admin_set_role rejected for non-admin', rpc.status >= 400, `status ${rpc.status}`)

// allowed profile update (onboarding flow)
const upd = await rest(`profiles?id=eq.${uid}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ onboarded: true, display_name: 'Test Hunter' }) })
check('profile update (onboarded/display_name)', upd.ok)

// assessment insert (Awakening)
const ass = await rest('assessments', {
  method: 'POST',
  headers: { Prefer: 'return=representation' },
  body: JSON.stringify({ user_id: uid, age: 28, sex: 'male', height_cm: 176, weight_kg: 74, activity_level: 'moderate', experience: 'new', goal: 'build_muscle', equipment: ['none', 'dumbbells'], days_per_week: 4, session_length_min: 45, diet_pref: 'nonveg', health_flags: {}, bmi: 23.9, bodyfat_est_low: 15, bodyfat_est_high: 21 }),
})
check('assessment insert', ass.status === 201)

// character update (class/archetype/stats)
const cupd = await rest(`character_profiles?user_id=eq.${uid}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ class: 'ranger', archetype: 'blade', stats: { STR: 8, AGI: 7, VIT: 8, END: 7, FLX: 5, BRE: 5, TEC: 5 } }) })
check('character update (class/archetype/stats)', cupd.ok)

// exercises readable
const exs = await json(await rest('exercises?select=id,name,category&limit=60'))
check('exercise library readable (48 seeded)', exs?.length === 48, `${exs?.length} rows`)

// quest insert + complete
const q = await json(await rest('quests', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ user_id: uid, type: 'daily', title: 'Verification Quest', objectives: [{ id: '1', label: 'Test', done: false }], xp_reward: 50, stat_rewards: { STR: 1 } }) }))
check('quest insert', q?.length === 1)
if (q?.length) {
  const qc = await rest(`quests?id=eq.${q[0].id}`, { method: 'PATCH', body: JSON.stringify({ status: 'completed', completed_at: new Date().toISOString() }) })
  check('quest complete', qc.ok)
}

// workout log + xp award simulation
const wl = await rest('workout_logs', { method: 'POST', body: JSON.stringify({ user_id: uid, exercise_name: 'Verification Quest', xp_earned: 50, sets: [] }) })
check('workout_log insert', wl.status === 201)
const xp = await rest(`character_profiles?user_id=eq.${uid}`, { method: 'PATCH', body: JSON.stringify({ xp: 50, streak: 1, last_activity_date: new Date().toISOString().slice(0, 10) }) })
check('xp/streak update', xp.ok)

// food log, goal, measurement
check('food_log insert', (await rest('food_logs', { method: 'POST', body: JSON.stringify({ user_id: uid, name: 'Test meal', meal: 'lunch', calories: 550, protein_g: 40, carbs_g: 60, fat_g: 15 }) })).status === 201)
check('goal insert', (await rest('goals', { method: 'POST', body: JSON.stringify({ user_id: uid, title: 'First pull-up', target_value: 1, unit: 'rep' }) })).status === 201)
check('measurement insert', (await rest('measurements', { method: 'POST', body: JSON.stringify({ user_id: uid, weight_kg: 74 }) })).status === 201)

// announcements: only active visible
check('announcements readable', (await rest('announcements?select=id')).ok)

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
