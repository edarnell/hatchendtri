import { inflate, deflate } from 'pako'
import { Buffer } from 'buffer'
const debug = console.log.bind(console)

function unzip(z) {
    const b = Buffer.from(z), s = inflate(b, { to: 'string' }),
        j = JSON.parse(s)
    //debug({ b, s, j })
    return j
}

export { unzip }