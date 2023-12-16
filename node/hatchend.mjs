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

function resp(req, r, json, status) {
    if (status) {
        log.error('resp->' + req, status)
        r.status(status).json(json)
    }
    else {
        log.info('resp->' + req)
        r.json(json)
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
/*
function userPhotos(email) {
    const ns = ns[email], r = {}
    Object.keys(photos).forEach(y => {
        r[y] = {}
        Object.keys(photos[y]).forEach(n => {
            if (ns[y] && ns[y][n]) r[y] = { ...r[y], [n]: ps[n] }
        })
    }
    

}
*/


function filesReq(req, json, r, email, aed) {
    if (json.files) {
        const { files } = json, zips = {}, csvs = {}
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
        if (!e) resp(req, r, { zips, csvs })
        else resp(req, r, { error: 'Unauthorized' }, 401)
    } else resp(req, r, { message: 'no files' }, 400)
}

function datesReq(req, json, r) {
    if (json.files) {
        const { files } = json, date = {}
        //log.info('req->', req, files)
        files.forEach(fn => {
            if (fn === 'vs' && !fs.existsSync(`gz/vs.gz`)) _f('vs') // restore from backup after copied to gz
            const { mtime } = fn === 'photos' ? { mtime: pn.date } : fs.statSync(`gz/${fn}.gz`)
            date[fn] = mtime
        })
        resp(req, r, { date })
    } else resp(req, r, { message: 'no files' }, 400)
}

function loginReq(req, json, r) {
    if (json.email) {
        const email = json.email, name = typeof email === 'string' && get_name(email)
        //log.info('req->', req, email)
        if (!name) send({
            to: 'Competitor/Volunteer', email: email, subject: 'Login',
            message: 'Self-service capabilities will be added to <a href="{host}">hatchendtri.com</a> soon. You may safetly ignore this email if someone else has mistakenly entered your email address.'
        }).then(s => resp(req, r, { sent: s }))
        else send({
            to: name, email: email, subject: 'Login',
            message: 'You will be automatically logged in by the following <a href="{host}/competitor{token}">competitor</a>, <a href="{host}/volunteer{token}">volunteer</a> or <a href="{host}/{token}">home page</a> links.'
        })
            .then(s => resp(req, r, { sent: s }))
    } else resp(req, r, { message: 'no email' }, 400)
}

function sendReq(req, json, r, email) {
    if (json.data) {
        const { to: id, name: from_name, email: from_email, subject, message } = json.data,
            to = id && vs[id],
            to_email = to && to.email,
            to_name = to && to.name.split(' ')[0],
            from = email ? get_name(email, false) || get_cname(email) : from_name
        //log.info('req->', req, id || '', from)
        saveMl(json)
        if (subject && message && (email || !to)) send({ to: to_name, email: to_email, from_email: email || from_email, from, subject, message })
            .then(s => resp(req, r, { sent: s }))
        else resp(req, r, { message: 'no data' }, 400)
    }
}

function saveReq(req, json, r, email) {
    if (json.vol) saveVol(req, json, r, email)
    else if (json.comp) saveComp(req, json, r)
    else if (json.zips) saveZips(req, json, r)
    else if (json.files) saveFiles(req, json, r)
    else resp(req, r, { message: 'no data' }, 400)
}

function saveVol(req, json, r, email) {
    if (json.roles || json.details) {
        const { vol, roles, year, details } = json,
            v = vs[vol] || {}
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
        resp(req, r, { vs: vu, v })
    } else resp(req, r, { message: 'no roles or details' }, 400)
}

function saveComp(req, json, r) {
    if (json.comp) {
        const cn = json.comp,
            co = cs[cn.id],
            c = cs[cn.id] = co ? { ...co, ...cn } : cn
        save('_cs', cs)
        //log.info('req->', req, { c, co, cn })
        send({
            from_email: email, uEmail: email, subject: `comp ${c.id} ${c.first} ${c.last}`,
            message: `{competitor}\n ${JSON.stringify(json.comp)}`
        })
        resp(req, r, { comp: c })
    } else resp(req, r, { message: 'no comp' }, 400)
}

function nameReq(req, json, r, email) {
    const tok = json.tok, auth = tok && jwt.verify(tok, config.key),
        ae = auth && auth.email, n = ae && emails[ae],
        name = n && `${n.first} ${n.lasts ? n.lasts[0] : ''}`,
        i1 = email && emails[email] && emails[email].i, i2 = ae && emails[ae] && emails[ae].i
    if (email && email !== ae) log.info({ nameReq: { email, i1, ae, i2 } })
    if (n) resp(req, r, { name })
    else resp(req, r, { message: 'unknown' }, 400)
}

function unsubReq(req, json, r, email) {
    const tok = json.tok, auth = tok && jwt.verify(tok, config.key),
        ae = auth && auth.email, n = ae && emails[ae],
        name = n && `${n.first} ${n.lasts ? n.lasts[0] : ''}`,
        i1 = email && emails[email] && emails[email].i, i2 = n && n.i
    if (email && email !== ae) log.error({ nameReq: { email, i1, ae, i2 } })
    if (name && name == json.name) {
        const reason = json.reason || '',
            unsub = fs.existsSync(`gz/_unsub.gz`) ? fz('gz/_unsub.gz') : {}
        unsub[ae] = { reason, date: new Date().toISOString().slice(0, 10) }
        save('_unsub', unsub)
        send({
            from_email: ae, subject: 'Unsubscibe',
            message: `${name} ${ae} unsubscribed\n Reason: ${reason}\n` +
                `${email && email !== ae ? `${ae}(${i2}) !== ${email}(${i1})\n` : ''}`
        })
        resp(req, r, { unsub: true })
    } else resp(req, r, { message: 'data error' }, 400)
}

function saveZips(req, json, r) {
    if (json.zips) {
        const { zips } = json, fs = Object.keys(zips),
            saved = {}
        //log.info('req->', req, fs)
        fs.forEach(fn => {
            if (fn === 'results') saveRZ(zips[fn])
            else save(fn, unzip(zips[fn], true))
            saved[fn] = f(`gz/${fn}.gz`)
        })
        resp(req, r, saved)
    } else resp(req, r, { message: 'no zips' }, 400)
}

function saveFiles(req, json, r) {
    if (json.files) {
        const { files } = json, zips = {}, fs = Object.keys(files)
        //log.info('req->', req, fs)
        fs.forEach(fn => {
            save(fn, files[fn], true)
            zips[fn] = f(`gz/${fn}.gz`)
        })
        resp(req, r, { zips })
    } else resp(req, r, { message: 'no files' }, 400)
}

function userReq(req, json, r, email) {
    const names = emails[email], vol = get_vol(null, email), comp = ns[email]
    resp(req, r, { email, names, vol, comp })
}

function volReq(req, json, r, email) {
    if (json.vol) {
        const vol = get_vol(json.vol, email)
        if (vol) {
            //log.info('req->', req, { id: json.vol, name: vol.name })
            resp(req, r, { vol })
        } else resp(req, r, { error: 'Unauthorized' }, 401)
    } else resp(req, r, { message: 'no vol' }, 400)
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

function bulksendReq(req, json, r, email, aed) {
    const { subject, message, list, live, time } = json
    if (!config.live && subject && message && list && list.length && aed) {
        const pre = { ...json, list: [] }, mailLog = saveMl(pre)
        log.info({ bulksend: { to: list.length, subject, time } })
        if (time) delaySend(json)
        else send_list(json)
        resp(req, r, { bulksend: list.length, time, mailLog })
    } else resp(req, r, { error: 'Unauthorized' }, 401)
}

function compReq(req, json, r) {
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

function photoReq(req, json, r, email) {
    const { y, n } = (json.get || json.public), np = ns[email],
        u = np[y] && (np[y].includes(n + '') || np[y].includes(n * 1)), p = u && photos[y][n]
    if (json.get) {
        const pp = ps[y][n]
        log.info({ photo: { y, n } })
        resp(req, r, { ps: p || pp, pp })
    }
    else if (json.public) {
        const ph = json.public.pn
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
        resp(req, r, { photos: pn, ps: p, pp })
    } else resp(req, r, { message: 'no photo' }, 400)
}

app.post(config.url, (m, r) => {
    const json = m.body, { req } = json
    if (m.headers.a_hatchend !== '20230521') return resp(req, r, { message: 'Invalid request' }, 404)
    const h = m.headers.authorization, token = h && h.startsWith('Bearer ') ? h.substring(7) : null,
        auth = token ? jwt.verify(token, config.key) : null,
        email = auth ? auth.email : null,
        aed = email && email === 'ed@darnell.org.uk',
        reqF = {
            anon: { filesReq, datesReq, loginReq, sendReq, nameReq, unsubReq },
            auth: { userReq, volReq, compReq, saveReq, photoReq, bulksendReq }
        }
    if (req) {
        log.info('req->', req)
        if (reqF.anon[req + 'Req']) reqF.anon[req + 'Req'](req, json, r, email, aed)
        else if (reqF.auth[req + 'Req']) {
            if (auth) reqF.auth[req + 'Req'](req, json, r, email, aed)
            else resp(req, r, { error: 'Unauthorized' }, 401)
        }
        else resp(req, r, { message: 'Invalid request' }, 404)
    } else {
        log.info('req->', req)
        resp(req, r, { message: 'No Request' }, 400)
    }
})

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
