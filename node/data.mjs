import u from 'util'
import { fz } from './zip.mjs'

const d = console.log.bind(console)
const f = process.argv[2]
const k = process.argv[3]

if (!f) {
    console.error('f arg required - gz/_{f}.gz')
    process.exit(1)
}

const o = fz(`gz/_${f}.gz`)
const n = k && parseInt(k)
const r = Object.entries(o).filter(([_, v]) => (n || !k) || JSON.stringify(v).includes(k))

d(u.inspect(n === 0 ? r : r.slice(0, n || 10), { depth: null }))
if (!k) console.log('2nd arg optional - filter by string - or n(0=all default 10) for n entries')