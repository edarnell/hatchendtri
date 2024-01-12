// npm install @aws-sdk/client-ses
const debug = console.log.bind(console)
import express from 'express'
import { f, fz, save, zip } from './zip.mjs'
import { send, send_list } from './mail.mjs'
import log4js from "log4js"
import jwt from 'jsonwebtoken'
import fs from 'fs'

const config = f('config.json', true).data
log4js.configure(config.log4js)
const log = log4js.getLogger()
log.info("Started")
let ns = fz('gz/_ns.gz') || {},
    emails = fz('gz/_emails.gz') || {},
    photos = fz('gz/_photos.gz') || {},
    ps = fz('gz/_ps.gz') || {},
    ei = [], fns = {}, vs, _vs
fns['photos'] = photoN()
fns['vs'] = f_vs()
fns['ds'] = f_('ds')
fns['cs'] = f_('cs')
fns['es'] = f_es()
fns['mailLog'] = f('gz/mailLog.gz')
fns['results'] = f('gz/results.gz')
function f_vs() {
    if (ei.length === 0) Object.keys(emails).forEach(e => ei[emails[e].i] = e)
    const f = fs.existsSync(`gz/_vs.gz`), ts = f ? fs.statSync(`gz/_vs.gz`).mtime : new Date(),
        j = f ? fz('gz/_vs.gz') : {},
        r = {}
    let n = 0, ui = 0, uf = 0, ul = 0, e = 0
    for (let i in j) {
        const o = j[i], u = o.email && emails[o.email.toLowerCase()]
        if (u) {
            r[i] = { id: o.id, i: u.i, year: o.year }
            if (o.name) {
                let [a, ...b] = o.name.trim().split(' '), last = b.pop(), first = (a + ' ' + b.join(' ')).trim()
                if (o.name === u.first + ' ' + u.last) ui++
                else if (last === u.last || !last) {
                    r[i].first = first.trim()
                    uf++
                }
                else {
                    r[i].first = first.trim()
                    r[i].last = last.trim()
                    ul++
                }
            }
            n++
        }
        else {
            if (!o.unsub && i > 0) {
                e++
                if (o.year && Object.keys(o.year).length) {
                    r[i] = o
                    //debug({ keep: o })
                }
            }
        }
    }
    log.info({ vs: { n, ui, uf, ul, e } })
    _vs = j
    vs = r
    return { date: ts, data: zip(r, false, true) }
}
function f_(fn) {
    if (ei.length === 0) Object.keys(emails).forEach(e => ei[emails[e].i] = e)
    const fe = fs.existsSync(`gz/_${fn}.gz`),
        j = fe ? fz(`gz/_${fn}.gz`) : {},
        ts = fe ? fs.statSync(`gz/_${fn}.gz`).mtime : new Date(),
        r = {}
    let h = 0, n = 0, e = 0
    for (let k in j) {
        const o = j[k], { first, last, cat, mf, club, ag, swim } = o,
            email = o.email.toLowerCase(),
            u = emails[email]
        if (email) {
            let i = u ? u.i : ei.length
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
                emails[email] = { i, first, last, fi: { [fn]: [k] } }
                ei[i] = email
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
    if (ei.length === 0) Object.keys(emails).forEach(e => ei[emails[e].i] = e)
    const ts = fs.existsSync(`gz/_emails.gz`) ? fs.statSync(`gz/_emails.gz`).mtime : new Date(),
        r = {}
    let n = 0
    Object.values(emails).forEach(e => {
        const { i, first, last, fi } = e
        r[i] = { first, last, email: i, fi }
        n++
    })
    log.info({ es: n })
    return { date: ts, data: zip(r, false, true) }
}
function photoN() {
    const ts = fs.existsSync(`gz/_ps.gz`) ? fs.statSync(`gz/_ps.gz`).mtime : new Date(),
        r = {}
    Object.keys(photos).forEach(y => {
        r[y] = {}
        Object.keys(photos[y]).forEach(n => {
            const pu = ps[y] && ps[y][n],
                p = pu ? pu.length : 0,
                t = photos[y][n].length
            r[y][n] = { p, t }
        })
    })
    return { date: ts, data: zip(r, false, true) }
}

const app = express()
/*app.use((req, res, next) => {
    req.rawBody = ''
    req.on('data', function (chunk) {
        req.rawBody += chunk
    })
    req.on('end', function () {
        console.log(`Size of request body: ${Buffer.byteLength(req.rawBody)} bytes`);
        req.body = JSON.parse(req.rawBody)
        next()
    })
})*/
app.use(express.json())

function resp(j, r, a, rj, status) {
    if (status) {
        log.error('resp->' + j.req, status)
        r.status(status).json(rj)
    }
    else {
        log.info('resp->', j.req, a ? a.i : '')
        r.json(rj)
    }
    _resp = true
}

function get_name(email, split = true) {
    let ret = Object.values(vs)
        .filter(u => u.email === email)
        .map(u => split ? u.name.split(' ')[0] : u.name)
        .join(', ')
    return ret
}

function get_cname(email) {
    return Object.values(cs)
        .filter(u => u.email === email)
        .map(u => `${u.first} ${u.last}`)
        .join(', ')
}

function get_vol(id, email) {
    debug({ get_vol: { id, email } })
    const u = emails[email]
    if (id * 1 === -1) {
        return { id, name: `${u.first} ${u.last}`, email, mobile: '' }
    }
    const v = vs[id], i = v && v.i, self = i === u.i
    if (self || email === 'ed@darnell.org.uk') {
        const { first, last, mobile, notes } = v,
            r = { id, first: first || u.first, last: last || u.last, email, mobile, notes, i }
        debug({ get_vol: { self, r } })
        return r
    }
    else return null
}

function filesReq(j, r, a) {
    if (j.files) {
        const { files } = j, zips = {}, csvs = {}, error = []
        //log.info('req->', req, files)
        let ok = true
        files.forEach(fn => {
            if (fns[fn]) zips[fn] = fns[fn]
            else error.push(fn)
        })
        if (!error.length) resp(j, r, a, { zips, csvs })
        else resp(j, r, a, { error }, 400)
    } else resp(j, r, a, { message: 'no files' }, 400)
}

function datesReq(j, r, a) {
    if (j.files) {
        const { files } = j, date = {}, error = []
        //log.info('req->', req, files)
        files.forEach(fn => {
            if (fns[fn]) date[fn] = fns[fn].date
            else error.push(fn)
        })
        if (!error.length) resp(j, r, a, { date })
        else resp(j, r, a, { error }, 400)
    } else resp(j, r, a, { message: 'no files' }, 400)
}

function loginReq(j, r, a) {
    if (j.email) {
        const email = j.email, u = emails[email]
        if (!u) send({
            to: 'Competitor/Volunteer', sub: true, email: email, subject: 'Login',
            message: 'Your email is not registered with {het} but you can {subscribe}.\n\n' +
                'You may safetly ignore this email if someone else has mistakenly entered your email address.'
        }).then(s => resp(j, r, a, { sent: s }))
        else send({
            to: u.first, email: email, unsub: true, subject: 'Login',
            message: 'You will be automatically logged in by the following {results}, {competitor} or {volunteer} links.'
        }).then(s => resp(j, r, u, { sent: s }))
    } else resp(j, r, a, { message: 'no email' }, 400)
}

function sendReq(j, r, a) {
    if (j.data) {
        const { to: id, name: from_name, email: from_e, subject, message } = j.data,
            to = id && vs[id],
            to_email = to && to.email,
            to_name = to && to.name.split(' ')[0],
            from = from_name || a.name,
            from_email = from_e || a.email
        //log.info('req->', req, id || '', from)
        saveMl(j)
        if (subject && message) send({ to: to_name, email: to_email, from_email, from, subject, message })
            .then(s => resp(j, r, a, { sent: s }))
        else resp(j, r, a, { e: 'no message' }, 400)
    } else resp(j, r, a, { e: 'no data' }, 400)
}

function saveReq(j, r, a) {
    if (j.vol) saveVol(j, r, a)
    else if (j.comp) saveComp(j, r, a)
    else resp(j, r, a, { e: 'no data' }, 400)
}

function vName(id) {
    const v = vs[id], u = emails[ei[v.i]], first = v.first || u.first, last = v.last || u.last
    return `${first} ${last}`
}

function update_v(v, details) {
    const { first, last, mobile, notes, email } = details,
        { i, id } = v, u = emails[email]
    if (v.first) v = { first, last, mobile, notes, email, i, id }
    else if (v.last) v = { last, mobile, notes, email, i, id }
    else {
        if (u.first !== first || u.last !== last) {
            u.first = first
            u.last = last
            emails[email] = u
            save('_emails', emails)
        }
        v = { mobile, notes, email, i, id }
    }
    return v
}

function new_user(v, details) {
    const { first, last, email } = details
    let i = Math.max(...Object.keys(emails).filter(x => isNaN(x) === false)) + 1
    emails[email] = { first, last, email, i, vs: [v.id] }
    ei[i] = email
    save('_emails', emails)
    return emails[email]
}

function switch_v(v, details) {
    const { first, last, mobile, notes, email } = details,
        uv = emails[ei[v.i]], u = emails[email] || new_user(v, details)
    if (uv.vs && uv.vs.includes(v.id)) {
        uv.vs.splice(uv.vs.indexOf(v.id), 1)
        emails[ei[v.i]] = uv
        save('_emails', emails)
    }
    v = { i: u.i, id: v.id }
    if (!u.vs) u.vs = [v.id]
    else u.vs.push(v.id)
    save('_emails', emails)
    v = update_v(v, details)
    return v
}

function update_vuser(v, details) {
    const email = details.email,
        uv = emails[ei[v.i]],
        ue = emails[email],
        u = (uv && ue) && uv.i === ue.i && uv
    if (!uv) v = null
    else if (u) v = update_v(v, details)
    else v = switch_v(v, details)
    return v
}

function saveVol(j, r, a) {
    let v
    const { vol, roles, year, details } = j
    if (vol === -1) {
        const u = emails[a.email], i = u && u.i,
            id = Math.max(...Object.keys(vs).filter(x => isNaN(x) === false)) + 1
        v = { i, id }
    }
    else if (vol) v = vs[vol]
    else if (details) {
        id = Math.max(...Object.keys(vs).filter(x => isNaN(x) === false)) + 1
        v = { id }
    }
    else resp(j, r, a, { e: 'no vol or details' }, 400)
    if (details) v = update_vuser(v, details)
    if (roles && year) {
        v.year = v.year || {}
        v.year[year] = v.year[year] || {}
        v.year[year] = roles
    }
    vs[v.id] = v
    const email = ei[v.i]
    _vs[v.id] = { email, ...v }
    const ts = save('_vs', _vs)
    fns['vs'] = { date: ts, data: zip(vs, false, true) }
    resp(j, r, a, { vs: fns['vs'], v })
    send({
        from_email: email, uEmail: email, subject: `vol update ${v.id}`,
        message: `{volunteer} ${v.id} ${vName(v.id)}\n` +
            (roles && (roles.adult || roles.junior || roles.none) ? `adult: ${roles && roles.adult ? roles.arole ? `${roles.asection},${roles.arole}` : 'yes' : 'no'}\n` +
                `junior: ${roles && roles.junior ? roles.jrole ? `${roles.jsection},${roles.jrole}` : 'yes' : 'no'}\n` +
                `${roles && roles.notes ? `notes: ${roles.notes}\n` : ''}`
                : `${details ? JSON.stringify(details) : ''}`)
    })

}

function saveComp(j, r, a) {
    if (j.comp) {
        const cn = j.comp,
            co = cs[cn.id],
            c = cs[cn.id] = co ? { ...co, ...cn } : cn
        save('_cs', cs)
        //log.info('req->', req, { c, co, cn })
        send({
            from_email: email, uEmail: email, subject: `comp ${c.id} ${c.first} ${c.last}`,
            message: `{competitor}\n ${JSON.stringify(json.comp)}`
        })
        resp(j, r, a, { comp: c })
    } else resp(j, r, a, { message: 'no comp' }, 400)
}

function unsubReq(j, r, a) {
    const tok = j.tok, auth = tok && jwt.verify(tok, config.key),
        ae = ue(auth.email)
    if (a && a.i !== ae.i) log.info({ unsub: { a: a.i, ae: ae.i } })
    if (ae && j.u) resp(j, r, a, { u: ae })
    else if (ae && j.i == ae.i) {
        const reason = j.reason || '',
            unsub = fs.existsSync(`gz/_unsub.gz`) ? fz('gz/_unsub.gz') : {}
        unsub[ae] = { reason, date: new Date().toISOString().slice(0, 10) }
        save('_unsub', unsub)
        send({
            from_email: ae.email, subject: 'Unsubscibe',
            message: `${ae.first} ${ae.last} ${ae.i} unsubscribed\n Reason: ${reason}\n` +
                `${a && a.i !== ae.i ? `${ae.i}(${ae.email}) !== ${a.i}(${a.email})\n` : ''}`
        })
        resp(j, r, a, { unsub: true })
    } else resp(j, r, a, { e: 'data error' }, 400)
}

function subReq(j, r, a) {
    const tok = j.tok, auth = tok && jwt.verify(tok, config.key),
        email = auth.email,
        { first, last } = j.details || {},
        ae = ue(email)
    if (ae) {
        log.info({ subReq: { ae: ae.i } })
        resp(j, r, a, { u: ae })
    } else if (first && last && email) {
        debug({ subReq: { first, last, email } })
        const i = Math.max(...Object.values(emails).map(x => x.i)) + 1
        emails[email] = { first, last, email, i }
        save('_emails', emails)
        fns['es'] = f_es()
        resp(j, r, a, { u: { first, last, i }, es: fns['es'] })
    } else resp(j, r, a, { e: 'data error' }, 400)
}

function userReq(j, r, a) {
    const email = ei[a.aed && j.i] || a.email, u = emails[email]
    if (u) {
        const { first, last, i } = u, admin = a.aed && !j.i
        resp(j, r, a, { u: { first, last, i, admin } })
    }
    else resp(j, r, a, { e: j }, 400)
}

function volReq(j, r, a) {
    if (j.vol && a) {
        const vol = get_vol(j.vol, a.email)
        if (vol) {
            //log.info('req->', req, { id: json.vol, name: vol.name })
            resp(j, r, a, { vol })
        } else resp(j, r, a, { e: 'Unauthorized' }, 401)
    } else resp(j, r, a, { e: 'no vol' }, 400)
}

function saveMl(j) {
    const ml = fz('gz/mailLog.gz'), ts = (new Date()).toISOString().replace(/[-:]/g, '').slice(0, -5) + 'Z'
    ml[ts] = j
    save('mailLog', ml)
    return f('gz/mailLog.gz')
}

function delaySend(req) {
    const t = req.time, [h, m] = t ? t.split(':') : []
    if (h && m) {
        const d = new Date(), now = new Date()
        d.setHours(h)
        d.setMinutes(m)
        if (d < now) d.setDate(d.getDate() + 1)
        const delay = d.getTime() - now.getTime();
        setTimeout(() => send_list(req), delay)
    }
    else log.error({ bulksend: { t } })
}

function bulksendReq(j, r, a) {
    const { subject, message, list, live, time } = j
    if (subject && message && list && list.length && a.aed) {
        const pre = { ...j, list: [] }, mailLog = saveMl(pre)
        log.info({ bulksend: { to: list.length, subject, time } })
        if (time) delaySend(j)
        else send_list(j)
        resp(j, r, a, { bulksend: list.length, time, mailLog })
    } else resp(j, r, a, { e: 'Unauthorized' }, 401)
}

function compReq(j, r, a) {
    if (j.cid && a.aed) {
        const c = cs[j.cid]
        if (c) {
            //log.info('req->', req, { id: c.cid, name: `${c.first} ${c.last}` })
            resp(j, r, a, {})
        } else resp(j, r, a, { e: 'no comp' }, 400)
    } else resp(j, r, a, { e: 'Unauthorized' }, 401)
}

function awsSnsReq(req, json, r) {
    if (json.cid && aed) {
        const c = cs[json.cid]
        if (c) {
            //log.info('req->', req, { id: c.cid, name: `${c.first} ${c.last}` })
            resp(req, r, { comp: c })
        } else resp(req, r, { message: 'no comp' }, 400)
    } else resp(req, r, { error: 'Unauthorized' }, 401)
}

function photoReq(j, r, a) {
    const { y, n } = (j.get || j.public), np = ns[a.email],
        u = np[y] && (np[y].includes(n + '') || np[y].includes(n * 1)), p = u && photos[y][n]
    if (j.get) {
        const pp = ps[y][n]
        log.info({ photo: { y, n } })
        resp(j, r, a, { ps: p || pp, pp })
    }
    else if (j.public) {
        const ph = j.public.pn
        if (ps[y]) {
            if (ps[y][n]) {
                const i = ps[y][n].indexOf(ph)
                if (i === -1) ps[y][n].push(ph)
                else ps[y][n].splice(i, 1)
            }
            else ps[y][n] = [ph]
        }
        else ps[y] = { [n]: [ph] }
        save('_ps', ps)
        pn = photoN()
        const pp = u && ps[y][n]
        log.info({ ps: { y, n, ph } })
        resp(j, r, a, { photos: pn, ps: p, pp })
    } else resp(j, r, a, { e: 'no photo' }, 400)
}

app.post(config.url, auth(async (j, r, a) => {
    const reqF = {
        anon: { filesReq, datesReq, loginReq, sendReq, unsubReq, subReq },
        auth: { userReq, volReq, compReq, saveReq, photoReq, bulksendReq }
    }
    log.info('req->', j.req, a ? a.i : '')
    if (reqF.anon[j.req + 'Req']) reqF.anon[j.req + 'Req'](j, r, a)
    else if (reqF.auth[j.req + 'Req']) {
        if (a) reqF.auth[j.req + 'Req'](j, r, a)
        else resp(j, r, a, { error: 'Unauthorized' }, 401)
    }
    else resp(j, r, a, { error: 'Invalid request' }, 404)
}))

function ue(email) {
    const u = email && emails[email],
        aed = email && email === 'ed@darnell.org.uk',
        i = u && u.i,
        { first, last } = u || {}
    return i ? { i, aed, first, last, email } : null
}

function authH(h) {
    const token = h && h.startsWith('Bearer ') ? h.substring(7) : null,
        auth = token ? jwt.verify(token, config.key) : null,
        u = auth ? ue(auth.email) : null
    return u
}

var _resp
function auth(rH) {
    _resp = false
    return async (m, r) => {
        const j = m.body, h = m.headers, a = j.req ? authH(h.authorization) : null
        try {
            if (j.req) {
                if (m.headers.a_hatchend !== '20230521') return resp(j.req, r, { message: 'Invalid request' }, 404)
                else await rH(j, r, a)
            }
            else if (j.MessageId && j.TopicArn) sns(j, r)
            else {
                log.info('req->', j.req)
                resp(j, r, a, { e: 'No Request' }, 400)
            }
        } catch (e) {
            log.error({ j, a, e })
            if (!_resp) resp(j, r, a, { e: 'Server catch' }, 500)
        }
    }
}

app.listen(config.port, () => {
    log.info(`listening on ${config.url} port ${config.port}`)
})

function start() {
    log.info('start')
    app.listen(config.port, () => {
        log.info(`listening on ${config.url} port ${config.port}`)
    })
}
export { log, saveMl, ei }
export default start
