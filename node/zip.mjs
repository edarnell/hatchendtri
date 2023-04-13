import fs from 'fs'
import pako from 'pako'

const filename = process.argv[2]

function f(f, s) {
    const d = s ? fs.readFileSync(f).toString() : fs.readFileSync(f)
    const stat = fs.statSync(f)
    return s === undefined ? { data: Buffer.from(d).toJSON(), date: stat.mtime } : d
}

function zip(j, s) {
    return pako.deflate(s ? j : JSON.stringify(j))
}

function unzip(z, base64) {
    return JSON.parse(pako.inflate(base64 ? Buffer.from(z, 'base64') : z, { to: 'string' }))
}


if (!filename) console.log('usage: node zip.mjs filename.[json|gz]')
else {
    const f2 = filename.split('.');
    if (f2.length !== 2) console.log('usage: node zip.mjs filename.[json|gz]')
    else if (f2[1] === 'json') {
        const z = zip(f(filename, true), true)
        fs.writeFileSync(f2[0] + '.gz', z)
        console.log(`gz written to ${f2[0]}.gz`)
    }
    else if (f2[1] === 'gz' || f2[1] === 'bgz') {
        const j = unzip(f(filename, f2[1] === 'bgz'), f2[1] === 'bgz')
        fs.writeFileSync(f2[0] + '.json', JSON.stringify(j))
        console.log(`json written to ${f2[0]}.json`)
    }
    else console.log('usage: node zip.mjs filename.[json|gz]')
}

export { f, zip, unzip }