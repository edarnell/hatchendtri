import { fz, save } from '../zip.mjs'
import fs from 'fs'

const f = process.argv[2],
    z = process.argv[3]
if (z) {
    const t = fs.readFileSync(`json/${f}.json`, 'utf8'),
        o = t && JSON.parse(t)
    if (z === 'gz' && o) {
        save(f, o)
        console.log(`gz/${f}.gz`)
    }
    else console.error('f gz - updates gz/{f}.gz from json/{f}.json')
}
else {
    if (!f) {
        console.error('f arg required - gz/{f}.gz')
        process.exit(1)
    }
    const o = fz(`gz/${f}.gz`),
        j = JSON.stringify(o, null, 2) // The '2' argument for pretty-printing
    fs.writeFileSync(`json/${f}.json`, j, 'utf8')
    console.log(`json/${f}.json`)
}
