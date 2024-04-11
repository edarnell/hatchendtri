import { inflate, deflate } from 'pako'
import { Buffer } from 'buffer'
const debug = console.log.bind(console)

function unzip(z) {
    const b = Buffer.from(z, 'base64'), s = inflate(b, { to: 'string' }),
        j = JSON.parse(s)
    return j
}

function zip(j, base64) {
    const s = JSON.stringify(j), b = Buffer.from(s),
        z = deflate(b)
    return base64 ? Buffer.from(z).toString('base64') : z
}

export { zip, unzip }