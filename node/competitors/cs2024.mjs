import { fz, save } from '../zip.mjs'
import fs from 'fs'
import csv from 'csv-parser'
const debug = console.log.bind(console)

const emails = fz('gz/es.gz') || {}, ei = []
Object.keys(emails).forEach(e => ei[emails[e].i] = e)
let hs, n = 0, w = 0, e = 0
const cs = {}
fs.createReadStream('lists/2024C.csv')
    .pipe(csv())
    .on('headers', h => hs = h)
    .on('data', r => {
        const o = {
            ref: r['Ref'], email: r['Email'], first: r['First Name'], last: r['Last Name'], mf: r['Gender'],
            cat: r['Category'], club: r['Club'],
            btf: r['I am a BTF member'],
            swim: r['(ADULT ENTRIES ONLY) Please select your estimated swim time for 400m'],
            btrl: r['BTFpass'],
        }
        if (o.email && o.ref) {
            cs[o.ref] = o
            if (!emails[o.email.toLowerCase()]) {
                const { first, last } = o
                emails[o.email] = { i: emails.length, first, last }
                w++
            }
            n++
        }
        else {
            debug({ error: o })
            e++
        }
    })
    .on('end', () => {
        debug({ cs })
        debug({ n, w, e })
        save('cs', cs)
    })
