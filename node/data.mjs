import u from 'util'
import { fz } from './zip.mjs'

const d = console.log.bind(console)
const f = process.argv[2]
const k = process.argv[3]

if (!f) {
    console.error('f arg required - gz/_{f}.gz')
    process.exit(1)
}
if (!k) console.log('2nd arg optional - filter by string')

const o = fz(`gz/_${f}.gz`)
const r = Object.entries(o).filter(([_, v]) => !k || JSON.stringify(v).includes(k))

d(u.inspect(r.slice(0, 10), { depth: null }))