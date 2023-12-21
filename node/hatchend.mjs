// npm install @aws-sdk/client-ses
const debug = console.log.bind(console)
import express from 'express'
import { f, _f, fz, save, unzip, zip } from './zip.mjs'
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
    vs = fz('gz/_vs.gz') || {},
    cs = fz('gz/_cs.gz') || {},
    photos = fz('gz/_photos.gz') || {},
    ps = fz('gz/_ps.gz') || {},
    pn = photoN(),
    ei = []
Object.keys(emails).forEach(e => ei[emails[e].i] = e)
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
    if (id * 1 === -1) {
        const u = emails[email]
        return { id, name: `${u.first} ${u.lasts ? u.lasts[0] : ''}`, email, mobile: '' }
    }
    const us = Object.values(vs).filter(u => u.email === email),
        admin = us.some(u => u.admin === true),
        self = id && us.some(u => u.id === id)
    if (id && (self || admin)) return vs[id]
    else if (!id) return us.length ? us : null
}

function get_comp(id, email) {
    const us = Object.values(cs).filter(u => u.email === email),
        admin = us.some(u => u.admin === true),
        self = id && us.some(u => u.id === id)
    if (id && (self || admin)) return cs[id]
    else if (!id) return us.length ? us : null
}

function saveRZ(rz) {
    const r = fz('gz/results.gz'),
        r23 = unzip(rz, true)
    r[2023] = r23
    save('results', r)
    console.log('saveRZ', Object.keys(r), Object.keys(r23))
}


function filesReq(j, r, a) {
    if (j.files) {
        const { files } = j, zips = {}, csvs = {}
        //log.info('req->', req, files)
        let ok = true
        files.forEach(fn => {
            if (fn.endsWith('.csv')) csvs[fn] = aed && !config.live ? f(`lists/${fn}`, true) : null
            else if (fn.charAt(0) === '_') zips[fn] = aed && !config.live ? f(`gz/${fn}.gz`) : null
            else if (fn === 'photos') zips[fn] = pn
            else zips[fn] = f(`gz/${fn}.gz`)
        })
        const e = Object.values(zips).some(value => value === null)
            || Object.values(csvs).some(value => value === null)
        if (!e) resp(j, r, a, { zips, csvs })
        else resp(j, r, a, { error: 'Unauthorized' }, 401)
    } else resp(j, r, a, { message: 'no files' }, 400)
}

function datesReq(j, r, a) {
    if (j.files) {
        const { files } = j, date = {}
        //log.info('req->', req, files)
        files.forEach(fn => {
            if (fn === 'vs' && !fs.existsSync(`gz/vs.gz`)) _f('vs') // restore from backup after copied to gz
            const { mtime } = fn === 'photos' ? { mtime: pn.date } : fs.statSync(`gz/${fn}.gz`)
            date[fn] = mtime
        })
        resp(j, r, a, { date })
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
    else if (j.zips) saveZips(j, r, a)
    else if (j.files) saveFiles(j, r, a)
    else resp(j, r, a, { e: 'no data' }, 400)
}

function saveVol(j, r, a) {
    if (a && (j.roles || j.details)) {
        const { vol, roles, year, details } = j,
            v = vs[vol] || {}, email = a.email
        if (vol * 1 === 0 || vol * 1 === -1) {
            v.id = Math.max(...Object.keys(vs).filter(x => isNaN(x) === false)) + 1
            const bad_ids = Object.keys(vs).filter(x => isNaN(x) === true),
                u = emails[email]
            debug({ new_id: v.id, u, email })
            v.name = `${u.first} ${u.lasts ? u.lasts[0] : ''}`
            v.email = email
            debug({ new_id: v.id, v, bad_ids })
        }
        if (details) Object.keys(details).forEach(k => v[k] = details[k])
        if (roles && year) (v.year = v.year || {})[year] = roles
        send({
            from_email: email, uEmail: email, subject: `vol ${v.unsub ? 'unsub' : 'update'} ${v.name}`,
            message: `{volunteer} ${v.name}\n` +
                (roles && (roles.adult || roles.junior || roles.none) ? `adult: ${roles && roles.adult ? roles.arole ? `${roles.asection},${roles.arole}` : 'yes' : 'no'}\n` +
                    `junior: ${roles && roles.junior ? roles.jrole ? `${roles.jsection},${roles.jrole}` : 'yes' : 'no'}\n` +
                    `${roles && roles.notes ? `notes: ${roles.notes}\n` : ''}`
                    : `${details ? JSON.stringify(details) : ''}`)
        })
        if (v.unsub) {
            if (!vs[0]) vs[0] = {}
            vs[0][v.id] = { ...v }
            delete vs[vol]
        }
        else vs[v.id] = v
        save('_vs', vs)
        const vu = f('gz/vs.gz')
        resp(j, r, a, { vs: vu, v })
    } else resp(j, r, a, { e: 'no roles or details' }, 400)
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

function nameReq(j, r, a) {
    const tok = j.tok, auth = tok && jwt.verify(tok, config.key),
        ae = ue(auth.email)
    if (a && a.email !== ae) log.info({ nameReq: { a: a.i, ae: ae.i } })
    if (ae) resp(j, r, ae, { name: ae.name })
    else resp(j, r, a, { e: 'unknown' }, 400)
}

function unsubReq(j, r, a) {
    const tok = j.tok, auth = tok && jwt.verify(tok, config.key),
        ae = ue(auth.email)
    if (a && a.i !== ae.i) log.info({ nameReq: { a: a.i, ae: ae.i } })
    if (ae && ae.name === j.name) {
        const reason = j.reason || '',
            unsub = fs.existsSync(`gz/_unsub.gz`) ? fz('gz/_unsub.gz') : {}
        unsub[ae] = { reason, date: new Date().toISOString().slice(0, 10) }
        save('_unsub', unsub)
        send({
            from_email: ae.email, subject: 'Unsubscibe',
            message: `${ae.name} ${ae.i} unsubscribed\n Reason: ${reason}\n` +
                `${a && a.i !== ae.i ? `${ae.i}(${ae.email}) !== ${a.i}(${a.email})\n` : ''}`
        })
        resp(j, r, a, { unsub: true })
    } else resp(j, r, a, { e: 'data error' }, 400)
}

function saveZips(j, r, a) {
    if (j.zips) {
        const { zips } = j, fs = Object.keys(zips),
            saved = {}
        //log.info('req->', req, fs)
        fs.forEach(fn => {
            if (fn === 'results') saveRZ(zips[fn])
            else save(fn, unzip(zips[fn], true))
            saved[fn] = f(`gz/${fn}.gz`)
        })
        resp(j, r, a, saved)
    } else resp(j, r, a, { e: 'no zips' }, 400)
}

function saveFiles(j, r, a) {
    if (j.files) {
        const { files } = j, zips = {}, fs = Object.keys(files)
        //log.info('req->', req, fs)
        fs.forEach(fn => {
            save(fn, files[fn], true)
            zips[fn] = f(`gz/${fn}.gz`)
        })
        resp(j, r, a, { zips })
    } else resp(j, r, a, { message: 'no files' }, 400)
}

function userReq(j, r, a) {
    const email = a && a.email, names = emails[email], vol = get_vol(null, email), comp = ns[email]
    resp(j, r, a, { email, names, vol, comp })
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
        anon: { filesReq, datesReq, loginReq, sendReq, nameReq, unsubReq },
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
        name = i && `${u.first} ${u.lasts ? u.lasts[0] : ''}`
    return i ? { i, email, name, aed } : null
}

function authH(h) {
    const token = h && h.startsWith('Bearer ') ? h.substring(7) : null,
        auth = token ? jwt.verify(token, config.key) : null,
        u = auth ? ue(auth.email) : null
    return u
}

function auth(rH) {
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
                resp(j, r, a, { message: 'No Request' }, 400)
            }
        } catch (e) {
            log.error({ j, a, e })
            resp(j, r, a, { e }, 500)
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
