import u from 'util'
import { fz } from './zip.mjs'

const d = console.log.bind(console)
const f = process.argv[2]
const k = process.argv[3]

if (!f) {
    console.error('f arg required - gz/{f}.gz')
    process.exit(1)
}

const o = fz(`gz/${f}.gz`), n = k && parseInt(k),
    rs = Array.isArray(o) ? o.entries() : Object.entries(o),
    r = rs.filter(([i, v]) => !k || k === i || JSON.stringify(v).includes(k))

d(u.inspect(r.slice(-10), { depth: null }))
if (!k) console.log('2nd arg optional - filter by string - or n(0=all default 10) for n entries')