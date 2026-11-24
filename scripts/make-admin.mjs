// Promote an existing account (sign up in the app first) to admin.
// Usage: SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/make-admin.mjs you@example.com
const token = process.env.SUPABASE_ACCESS_TOKEN
const ref = process.env.SUPABASE_PROJECT_REF || 'wlvwdmsumubjqvgqatdj'
const email = process.argv[2]
if (!token || !email) {
  console.error('Usage: SUPABASE_ACCESS_TOKEN=... node scripts/make-admin.mjs <email>')
  process.exit(1)
}

const query = `
  update public.profiles p set role = 'admin'
  from auth.users u
  where u.id = p.id and lower(u.email) = lower(${JSON.stringify(email).replace(/"/g, "'")})
  returning p.id;
`
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }),
})
const text = await res.text()
if (!res.ok) {
  console.error(`FAILED (${res.status}):`, text)
  process.exit(1)
}
const rows = JSON.parse(text)
console.log(rows.length ? `Promoted ${email} to admin.` : `No account found for ${email} — sign up in the app first.`)
