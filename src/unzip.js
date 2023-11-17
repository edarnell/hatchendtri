import { inflate, deflate } from 'pako'
import { Buffer } from 'buffer'
const debug = console.log.bind(console)

function unzip(z) {
    const b = Buffer.from(z), s = inflate(b, { to: 'string' }),
        j = JSON.parse(s)
    //debug({ b, s, j })
    return j
}

function zip(j) {
    const s = JSON.stringify(j), b = Buffer.from(s),
        z = deflate(b)
    debug({ zip: s, in: s.length, out: z.length })
    return z
}

export { zip, unzip }