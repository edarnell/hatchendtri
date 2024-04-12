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
    const z = zip(j), ts = ts_s()
    if (fs.existsSync(`gz/${f}.gz`)) fs.renameSync(`gz/${f}.gz`, `gz/backups/${f}_${ts}.gz`)
    fs.writeFileSync(`gz/${f}.gz`, z)
    return fs.statSync(`gz/${f}.gz`).mtime
}

function ts_s() {
    return (new Date()).toISOString().replace(/[-:]/g, '').slice(0, -5) + 'Z'
}

export { f, zip, unzip, fz, save, ts_s }