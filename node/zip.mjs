import fs from 'fs'
import pako from 'pako'

function f(f, s) {
    const stat = fs.statSync(f)
    if (!stat.isFile()) return null
    const d = s ? fs.readFileSync(f).toString() : fs.readFileSync(f)
    const data = s === undefined ? Buffer.from(d).toString('base64') :
        f.toLowerCase().endsWith('.json') ? JSON.parse(d) : d
    return { data, date: stat.mtime }
}

function _f(f) {
    // restore from backup after copied to gz
    const j = fz(`gz/_${f}.gz`)
    if (j) fs.writeFileSync(`gz/${f}.gz`, zip(anon(j)))
}

function anon(j, d) {
    let o = d ? j : { ...j } // make copy of top level object to modify
    const ks = ['email', 'phone', 'mobile'],
        _emails = fz('gz/_emails.gz')
    for (let k in o) {
        if (ks.includes(k)) {
            if (k === 'email' && _emails && _emails[o[k]]) o[k] = _emails[o[k]].i
            else delete o[k]
        }
        else if (typeof o[k] === 'object' && o[k] !== null) {
            anon(o[k], true)
        }
    }
    if (!d && o[0]) delete o[0] // used for unsub
    return o
}

function zip(j, s, base64) {
    const z = pako.deflate(s ? j : JSON.stringify(j))
    return base64 ? Buffer.from(z).toString('base64') : z
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
    const _a = ['_vs', '_mailLog'], // files to make anaonomised copies of
        z = zip(j), ts = (new Date()).toISOString().replace(/[-:]/g, '').slice(0, -5) + 'Z'
    if (fs.existsSync(`gz/${f}.gz`)) fs.renameSync(`gz/${f}.gz`, `gz/backups/${f}_${ts}.gz`);
    fs.writeFileSync(`gz/${f}.gz`, z)
    if (_a.includes(f)) fs.writeFileSync(`gz/${f.substring(1)}.gz`, zip(anon(j)))
    return z
}

function savez(f, z) {
    fs.writeFileSync(f, z)
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

export { f, _f, zip, unzip, fz, save, savez }