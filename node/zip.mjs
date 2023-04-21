import fs from 'fs'
import pako from 'pako'

function f(f, s) {
    const stat = fs.statSync(f)
    if (!stat.isFile()) return null
    const d = s ? fs.readFileSync(f).toString() : fs.readFileSync(f)
    return s === undefined ? { data: Buffer.from(d).toJSON(), date: stat.mtime } :
        f.toLowerCase().endsWith('.json') ? JSON.parse(d) : d
}

function zip(j, s) {
    return pako.deflate(s ? j : JSON.stringify(j))
}

function unzip(z, base64) {
    return JSON.parse(pako.inflate(base64 ? Buffer.from(z, 'base64') : z, { to: 'string' }))
}

function fz(f) {
    if (!fs.existsSync(f)) return null
    const d = fs.readFileSync(f)
    if (d) return unzip(d)
}

function save(f, j) {
    fs.writeFileSync(f, zip(j))
}

if (import.meta.url === `file://${process.argv[1]}`) { // run from command line
    const filename = process.argv[2]
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
}

export { f, zip, unzip, fz, save }