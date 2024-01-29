const debug = console.log.bind(console)
import fs from 'fs'
import { f, fz, save, zip } from './zip.mjs'
import log4js from "log4js"
// aims to be a single source of truth for all data
let d = {},log
function load(reload) {
    if (d.config && !reset) return d
    const config = f('config.json', true).data
    log4js.configure(config.log4js)
    log=log4js.getLogger()
    log.info({load:reload?'reload':'initial'})
    d = { config,fns:{},log}
    d.fns['ps'] = photoN() // also sets ns and pp 
    d.fns['vs'] = f_vs() // also sets ei, vs, _vs, _es, vr
    d.fns['ds'] = f_('ds')
    d.fns['cs'] = f_('cs')
    d.fns['vr'] = fv('vr')
    d.fns['es'] = f_es()
    d.fns['ml'] = fv('ml')
    d.fns['results'] = f('gz/results.gz')
    d.mail = fs.readFileSync('mail.html').toString()
    return d
}

function saveF(n, d, k) {
    if (n === 'vs') return saveV(d, k)
    else if (n === 'es') return saveE(d)
    else if (n === 'ml') return saveMl(d, k)
    else if (n === 'ps') return savePs(d, k)
    else if (n === 'unsub') return saveUnsub(d, k)
}

function savePs(y, n) {
    save('ps', d.ps)
    const pu = d.ps[y][n], p = pu ? pu.length : 0, t = d.pp[y][n].t,
        ts = fs.statSync(`gz/ps.gz`).mtime
    d.pp[y][n] = { p, t }
    d.fns['ps'] = { date: ts, data: zip(d.pp, false, true) }
    debug({ savePs: y, n, p })
    return p
}

function saveUnsub(u, k) {
    if (k === 'sub') {
        delete d.unsub[u.i]
        delete d._es[d.ei[u.i]].fi.unsub
    }
    else d.unsub[u.i] = u
    save('unsub', d.unsub)
    d.fns['es'] = f_es()
}

function saveMl(m, r) {
    const ts = r ? m : new Date().toISOString()
    if (r) {
        if (r.MessageId) d.ml[ts].sent = r.MessageId
        else d.ml[ts].error = r
    }
    else d.ml[ts] = m
    save('ml', d.ml)
    d.fns['ml'] = f('gz/ml.gz')
    return ts
}

function newV(jv) {
    const id = Math.max(...Object.keys(d.vs)) + 1,
        email = d.ei[jv.i],
        u = d._es[email],
        { first, last } = u
    if (jv.first !== first || jv.last !== last) log.error({ first, last, jv })
    d._vs[id] = { id, first, last, email }
    save('vs', d._vs)
    d.fns['vs'] = f_vs()
    return d._vs[id]
}

function saveV(jv, jr) {
    let v
    if (jr) {
        v = jv.id ? d._vs[jv.id] : newV(jv)
        clearVr(jr)
        d.vr[v.id] = jr
        save('vr', d.vr)
        d.fns['vr'] = { date: fs.statSync(`gz/vr.gz`).mtime, data: zip(d.vr, false, true) }
    }
    else {
        d.vs[v.id] = v
        save('vs', d.vs)
        d.fns['vs'] = f_vs() // could be more efficient
        const u = d._es[d.ei[v.i]]
        if (u.updated) saveE(u)
    }
    return v && d.vs[v.id]
}

function clearVr(r) {
    const f = { a: 'adult', j: 'junior' };
    ['a', 'j'].forEach(aj => {
        if (r[f[aj]] && r[aj + 'role']) {
            Object.keys(d.vr).forEach(v => {
                const o = d.vr[v]
                if (o[f[aj]] && o[aj + 'role'] === r[aj + 'role']) {
                    delete o[aj + 'role']
                    delete o[aj + 'section']
                }
            })
        }
    })
}

function saveE(u) {
    if (u && !u.i) {
        const i = Math.max(...Object.keys(d.ei).filter(x => isNaN(x) === false)) + 1
        u.i = i
        d._es[u.email.toLowerCase()] = u
    }
    else if (u) {
        const o = u.i ? d._es[d.ei[u.i]] : {}
        o.first = u.first
        o.last = u.last
        o.admin = u.admin
        if (o.updated) delete o.updated
        if (u.unsub && !o.fi.unsub) o.fi.unsub = new Date()
        else if (o.fi.unsub && !u.unsub) delete o.fi.unsub
    }
    save('es', d._es)
    d.fns['es'] = f_es() // could be more efficient
    if (u) return d._es[d.ei[u.i]]
}

function f_vs() {
    d._es = fs.existsSync(`gz/es.gz`) ? fz('gz/es.gz') : {}
    if (!d.ei) {
        d.ei = {}
        Object.keys(d._es).forEach(e => d.ei[d._es[e].i] = e)
    }
    const f = fs.existsSync(`gz/vs.gz`), ts = f ? fs.statSync(`gz/vs.gz`).mtime : new Date()
    d._vs = f ? fz('gz/vs.gz') : {}
    let n = 0, m = 0, p = 0, e = 0
    d.ev = {}, d.vs = {}
    for (let v in d._vs) {
        n++
        const o = d._vs[v], u = o.email && d._es[o.email.toLowerCase()]
        if (u) {
            const i = u.i, { id, first, last, year, mobile } = o
            d.vs[v] = { id, first, last, i, year }
            if (!d.ev[i]) d.ev[i] = []
            if (first === u.first && last === u.last) {
                d.ev[i].unshift(v)
                m++
            }
            else {
                d.ev[i].push(v)
                p++
            }
        }
        else e++
    }
    log.info({ vs: { n, m, p, e } })
    return { date: ts, data: zip(d.vs, false, true) }
}

function fv(fn) {
    const fe = fs.existsSync(`gz/${fn}.gz`)
    d[fn] = fe ? fz(`gz/${fn}.gz`) : {}
    log.info({ [fn]: Object.keys(d[fn]).length })
    return fe ? f(`gz/${fn}.gz`) : { date: new Date(), data: zip({}, false, true) }
}

function f_(fn) {
    const fe = fs.existsSync(`gz/${fn}.gz`),
        j = fe ? fz(`gz/${fn}.gz`) : {},
        ts = fe ? fs.statSync(`gz/${fn}.gz`).mtime : new Date(),
        r = {}
    let h = 0, n = 0, e = 0
    for (let k in j) {
        if (j[k].email) {
            const o = j[k], { first, last, cat, mf, club, ag, swim } = o,
            email = o.email.toLowerCase(),
            u = d._es[email]
            let i = u ? u.i : d.ei.length
            if (u) {
                u.fi[fn] = u.fi[fn] || []
                if (!u.fi[fn].includes(k)) {
                    u.fi[fn].push(k)
                    h++
                }
            }
            else {
                const m = Math.max(...Object.values(d._es).map(x => x.i)) + 1
                if (i !== m) {
                    log.error({ i: { i, m } })
                    i = m
                }
                d._es[email] = { i, first, last, fi: { [fn]: [k] } }
                d.ei[i] = email
                n++
            }
            r[k] = { first, last, cat, mf, club, ag, email: i, swim, n }
        }
        else {
            log.error({ k,o:j[k] })
            e++
        }
    }
    const rn = Object.keys(r).length
    log.info({ [fn]: { h, n, rn, e } })
    if (n || h) save('es', d._es)
    return { date: ts, data: zip(r, false, true) }
}
function f_es() {
    const unsub = d.unsub = fs.existsSync(`gz/unsub.gz`) ? fz(`gz/unsub.gz`) : {},
        bounce = d.bounce = fs.existsSync(`gz/bounce.gz`) ? fz(`gz/bounce.gz`) : {},
        ets = fs.statSync(`gz/es.gz`).mtime,
        uts = fs.existsSync(`gz/unsub.gz`) && fs.statSync(`gz/unsub.gz`).mtime,
        bts = fs.existsSync(`gz/bounce.gz`) && fs.statSync(`gz/bounce.gz`).mtime,
        ts = new Date(Math.max(ets.getTime(), uts ? uts.getTime() : 0, bts ? bts.getTime() : 0))
    d.es = {}
    let n = 0
    Object.values(d._es).forEach(u => {
        if (!u.fi) u.fi = {}
        const { i, first, last, fi, admin } = u
        if (unsub[i]) fi.unsub = unsub[i].date
        if (bounce[i]) fi.bounce = bounce[i].mail.timestamp
        d.es[i] = { first, last, i, fi, admin }
        n++
    })
    log.info({ es: n })
    return { date: ts, data: zip(d.es, false, true) }
}
function photoN() {
    d.photos = fs.existsSync(`gz/photos.gz`) ? fz('gz/photos.gz') : {} // number to photos mapping
    d.ns = fs.existsSync(`gz/ns.gz`) ? fz('gz/ns.gz') : {} // email to number mapping - used for permissions
    const pf = fs.existsSync(`gz/ps.gz`), ts = pf ? fs.statSync(`gz/ps.gz`).mtime : new Date()
    d.ps = pf ? fz('gz/ps.gz') : {}, d.pp = {}
    Object.keys(d.photos).forEach(y => {
        d.pp[y] = {}
        Object.keys(d.photos[y]).forEach(n => {
            const pu = d.ps[y] && d.ps[y][n],
                p = pu ? pu.length : 0,
                t = d.photos[y][n].length
            d.pp[y][n] = { p, t }
        })
    })
    return { date: ts, data: zip(d.pp, false, true) }
}

export { load, saveF, d, log }
