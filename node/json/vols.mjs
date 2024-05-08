import { fz } from '../zip.mjs'
import fs from 'fs'

function emails() {
    const vs = fz(`live/vs.gz`), vr = fz(`live/vr.gz`), es = {}
    for (const [id, vi] of Object.entries(vr)) {
        if (vi.adult || vi.junior) {
            const v = vs[id], e = v.email.toLowerCase()
            if (e) es[e] = e;
        }
    }
    const s = Object.values(es).sort().join('; ')
    fs.writeFileSync('emails_bcc.txt', s)
}
emails()