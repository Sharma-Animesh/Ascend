// Applies a SQL file to the Supabase project via the Management API.
// Usage: SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/db-apply.mjs <file.sql>
import { readFileSync } from 'node:fs'

const token = process.env.SUPABASE_ACCESS_TOKEN
const ref = process.env.SUPABASE_PROJECT_REF || 'wlvwdmsumubjqvgqatdj'
const file = process.argv[2]
if (!token || !file) {
  console.error('Usage: SUPABASE_ACCESS_TOKEN=... node scripts/db-apply.mjs <file.sql>')
  process.exit(1)
}

const query = readFileSync(file, 'utf8')
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query }),
})
const text = await res.text()
if (!res.ok) {
  console.error(`FAILED (${res.status}):`, text)
  process.exit(1)
}
console.log('OK:', text.slice(0, 500))
