const debug = console.log.bind(console)
import { f, fz, save, zip } from './zip.mjs'
import fs from 'fs'
import { log } from './hatchend.mjs'
// aims to be a single source of truth for all data

const config = f('config.json', true).data
// can refine by having one const d object with all the vars in it
const d = { config }
function load() {
    const fns = d.fns = {}
    fns['ps'] = photoN() // also sets ns and pp 
    fns['vs'] = f_vs() // also sets ei, vs, _vs, emails, vr
    fns['ds'] = f_('ds')
    fns['cs'] = f_('cs')
    fns['vr'] = fv('vr')
    fns['es'] = f_es()
    fns['ml'] = fv('ml')
    fns['results'] = f('gz/results.gz')
    d.mail = fs.readFileSync('mail.html').toString()
    return fns
}

function saveF(n, d, k) {
    if (n === 'vs') saveV(d, k)
    else if (n === 'es') return saveE(d)
    else if (n === 'ml') return saveMl(d, k)
    else if (n === 'ps') return savePs(d, k)
    else if (n === 'unsub') return saveUnsub(d, k)
}

function savePs(y, n) {
    save('_ps', d.ps)
    const pu = d.ps[y][n], p = pu ? pu.length : 0, t = d.pp[y][n].t,
        ts = fs.statSync(`gz/_ps.gz`).mtime
    d.pp[y][n] = { p, t }
    d.fns['ps'] = { date: ts, data: zip(d.pp, false, true) }
    debug({ savePs: y, n, p })
    return p
}

function saveUnsub(u, k) {
    if (k === 'sub') {
        delete d.unsub[u.i]
        delete d.emails[d.ei[u.i]].fi.unsub
    }
    else d.unsub[u.i] = u
    save('_unsub', d.unsub)
    d.fns['es'] = f_es()
}

function saveMl(m, r) {
    const ts = r ? m : new Date().toISOString()
    if (r) {
        if (r.MessageId) d.ml[ts].sent = r.MessageId
        else d.ml[ts].error = r
    }
    else d.ml[ts] = m
    save('_ml', d.ml)
    d.fns['ml'] = f('gz/_ml.gz')
    return ts
}

function saveV(v, r, ys) {
    if (r) {
        if (ys && ys.length) ys.forEach(v => d.vr[v.id] = v.r)
        d.vr[v.id] = r
        save('vr', d.vr)
        d.fns['vr'] = { date: fs.statSync(`gz/vr.gz`).mtime, data: zip(d.vr, false, true) }
    }
    else {
        d.vs[v.id] = v
        save('_vs', d.vs)
        d.fns['vs'] = f_vs() // could be more efficient
        const u = d.emails[d.ei[v.i]]
        if (u.updated) saveE(u)
    }
    return d.vs[v.id]
}

function saveE(u) {
    if (u && !u.i) {
        const i = Math.max(...Object.keys(d.ei).filter(x => isNaN(x) === false)) + 1
        u.i = i
        d.emails[u.email.toLowerCase()] = u
    }
    else if (u) {
        const o = u.i ? d.emails[d.ei[u.i]] : {}
        o.first = u.first
        o.last = u.last
        o.admin = u.admin
        if (o.updated) delete o.updated
        if (u.unsub && !o.fi.unsub) o.fi.unsub = new Date()
        else if (o.fi.unsub && !u.unsub) delete o.fi.unsub
    }
    save('_emails', d.emails)
    fns['es'] = f_es() // could be more efficient
    if (u) return d.emails[d.ei[u.i]]
}

function f_vs() {
    d.emails = fs.existsSync(`gz/_emails.gz`) ? fz('gz/_emails.gz') : {}
    if (!d.ei) {
        d.ei = {}
        Object.keys(d.emails).forEach(e => d.ei[d.emails[e].i] = e)
    }
    const f = fs.existsSync(`gz/_vs.gz`), ts = f ? fs.statSync(`gz/_vs.gz`).mtime : new Date()
    d._vs = f ? fz('gz/_vs.gz') : {}
    let n = 0, m = 0, p = 0, e = 0
    d.ev = {}, d.vs = {}
    for (let v in d._vs) {
        n++
        const o = d._vs[v], u = o.email && d.emails[o.email.toLowerCase()]
        if (u) {
            const i = u.i, { id, first, last, year, mobile } = o
            d.vs[v] = { id, first, last, mobile, i, year }
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
    const fe = fs.existsSync(`gz/_${fn}.gz`)
    d[fn] = fe ? fz(`gz/_${fn}.gz`) : {}
    log.info({ [fn]: Object.keys(d[fn]).length })
    return fe ? f(`gz/_${fn}.gz`) : { date: new Date(), data: zip({}, false, true) }
}

function f_(fn) {
    const fe = fs.existsSync(`gz/_${fn}.gz`),
        j = fe ? fz(`gz/_${fn}.gz`) : {},
        ts = fe ? fs.statSync(`gz/_${fn}.gz`).mtime : new Date(),
        r = {}
    let h = 0, n = 0, e = 0
    for (let k in j) {
        const o = j[k], { first, last, cat, mf, club, ag, swim } = o,
            email = o.email.toLowerCase(),
            u = d.emails[email]
        if (email) {
            let i = u ? u.i : d.ei.length
            if (u) {
                u.fi[fn] = u.fi[fn] || []
                if (!u.fi[fn].includes(k)) {
                    u.fi[fn].push(k)
                    h++
                }
            }
            else {
                const m = Math.max(...Object.values(emails).map(x => x.i)) + 1
                if (i !== m) {
                    log.error({ i: { i, m } })
                    i = m
                }
                d.emails[email] = { i, first, last, fi: { [fn]: [k] } }
                d.ei[i] = email
                n++
            }
            r[k] = { first, last, cat, mf, club, ag, email: i, swim, n }
        }
        else {
            log.error({ error: o })
            e++
        }
    }
    const rn = Object.keys(r).length
    log.info({ [fn]: { h, n, rn, e } })
    if (n || h) save('_emails', emails)
    return { date: ts, data: zip(r, false, true) }
}
function f_es() {
    const unsub = d.unsub = fs.existsSync(`gz/_unsub.gz`) ? fz(`gz/_unsub.gz`) : {},
        bounce = d.bounce = fs.existsSync(`gz/_bounce.gz`) ? fz(`gz/_bounce.gz`) : {},
        ets = fs.statSync(`gz/_emails.gz`).mtime,
        uts = fs.existsSync(`gz/_unsub.gz`) && fs.statSync(`gz/_unsub.gz`).mtime,
        bts = fs.existsSync(`gz/_bounce.gz`) && fs.statSync(`gz/_bounce.gz`).mtime,
        ts = new Date(Math.max(ets.getTime(), uts ? uts.getTime() : 0, bts ? bts.getTime() : 0))
    d.es = {}
    let n = 0
    Object.values(d.emails).forEach(u => {
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
    d.photos = fs.existsSync(`gz/_photos.gz`) ? fz('gz/_photos.gz') : {} // number to photos mapping
    d.ns = fs.existsSync(`gz/_ns.gz`) ? fz('gz/_ns.gz') : {} // email to number mapping - used for permissions
    const pf = fs.existsSync(`gz/_ps.gz`), ts = pf ? fs.statSync(`gz/_ps.gz`).mtime : new Date()
    d.ps = pf ? fz('gz/_ps.gz') : {}, d.pp = {}
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

export { load, saveF, d }
