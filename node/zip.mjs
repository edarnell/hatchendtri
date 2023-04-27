import fs from 'fs'
import pako from 'pako'

function f(f, s) {
    const stat = fs.statSync(f)
    if (!stat.isFile()) return null
    const d = s ? fs.readFileSync(f).toString() : fs.readFileSync(f)
    const data = s === undefined ? Buffer.from(d).toJSON() :
        f.toLowerCase().endsWith('.json') ? JSON.parse(d) : d
    return s === undefined ? { data, date: stat.mtime } : data
}

function sec(f, auth, email) {
    // add to list as needed
    if (auth && email === 'ed@darnell.org.uk' && f === '2023C') return true
    else return ['vs'].includes(f)
}

function anon(o, d) {
    // could add cache here
    const ks = ['email', 'phone', 'mobile']
    for (let k in o) {
        if (ks.includes(k)) {
            delete o[k]
        }
        else if (typeof o[k] === 'object' && o[k] !== null) {
            anon(o[k], true)
        }
    }
    if (!d && o[0]) delete o[0] // used for unsub
    return o
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

function save(f, j, secure) {
    if (secure) {
        const ts = (new Date()).toISOString().replace(/[-:]/g, '').slice(0, -5) + 'Z'
        fs.renameSync(`gz/${f}_.gz`, `gz/backups/${f}_${ts}.gz`);
        fs.writeFileSync(`gz/${f}_.gz`, zip(j))
        fs.writeFileSync(`gz/${f}.gz`, zip(anon(j)))
    }
    else fs.writeFileSync(f, zip(j))
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

export { f, zip, unzip, fz, save, savez, sec }