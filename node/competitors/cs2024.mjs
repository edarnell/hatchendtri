import { fz, save } from '../zip.mjs'
import fs from 'fs'
import csv from 'csv-parser'
const debug = console.log.bind(console)

const emails = fz('gz/es.gz') || {}, ei = []
Object.keys(emails).forEach(e => ei[emails[e].i] = e)
let hs, n = 0, w = 0, e = 0
const cs = {}
fs.createReadStream('competitors/HEstart.csv')
    .pipe(csv())
    .on('headers', h => hs = h)
    .on('data', r => {
        const o = {
            //Category,Ref,Brief,Start,First Name,Last Name,Club,Swim,Category,Phone,Email
            num: r['Num'].trim(), email: r['Email'].trim(), first: r['First Name'].trim(),
            last: r['Last Name'].trim(), mf: r['Gender'].trim(),
            cat: r['Category'], club: r['Club'],
            swim: r['Swim'],
            brief: r['Brief'],
            start: r['Start']
        }
        if (o.email && o.num) {
            cs[o.num] = o
            if (!emails[o.email.toLowerCase()]) {
                const { first, last } = o
                emails[o.email] = { i: emails.length, first, last }
                w++
            }
            n++
        }
        else {
            if (o.first !== 'Spare' && !(o.first === '' && o.last === '')) {
                e++
                debug({ error: o })
            }
        }
    })
    .on('end', () => {
        debug({ n, w, e })
        save('cs', cs)
    })
