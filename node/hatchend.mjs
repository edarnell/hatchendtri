// npm install @aws-sdk/client-ses
const debug = console.log.bind(console)
import express from 'express'
import { f, fz, save, sec, saveM, unzip } from './zip.mjs'
import { send, send_list } from './mail.mjs'
import log4js from "log4js"
import jwt from 'jsonwebtoken'
import fs from 'fs'
import { SetActiveReceiptRuleSetRequestFilterSensitiveLog } from '@aws-sdk/client-ses'

const config = f('config.json', true)
log4js.configure(config.log4js)
const log = log4js.getLogger()
log.info("Started")
const ns = fz('gz/ns_.gz')
let ps = fz('gz/ps.gz') || {}
const app = express()
app.use((req, res, next) => {
    req.rawBody = ''
    req.on('data', function (chunk) {
        req.rawBody += chunk
    })
    req.on('end', function () {
        console.log(`Size of request body: ${Buffer.byteLength(req.rawBody)} bytes`);
        req.body = JSON.parse(req.rawBody)
        next()
    })
})
//app.use(express.json())

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
    const vs = fz('gz/vs_.gz')
    let ret = Object.values(vs)
        .filter(u => u.email === email)
        .map(u => split ? u.name.split(' ')[0] : u.name)
        .join(', ')
    return ret
}

function get_cname(email) {
    const cs = fz('gz/cs_.gz')
    return Object.values(cs)
        .filter(u => u.email === email)
        .map(u => `${u.first} ${u.last}`)
        .join(', ')
}

function get_vol(id, email) {
    const vs = fz('gz/vs_.gz'),
        us = Object.values(vs)
            .filter(u => u.email === email),
        admin = us.some(u => u.admin === true),
        self = id && us.some(u => u.id === id)
    if (id && (self || admin)) return vs[id]
    else if (!id) return us.length ? us : null
}

function get_comp(id, email) {
    const cs = fz('gz/cs_.gz'),
        us = Object.values(cs).filter(u => u.email === email),
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

function filesR(req, json, r) {
    if (json.files) {
        const { files } = json, zips = {}
        //log.info('req->', req, files)
        let ok = true
        files.forEach(fn => {
            if (aed && fn.endsWith('.csv')) zips[fn] = f(`lists/${fn}`, true)
            //else if (fn === 'photos') zips[fn] = (aed ? photos : Object.keys(photos))
            else if (aed && fn === 'vs_') zips[fn] = f(`gz/${fn}.gz`)
            else if (aed && fn === 'cs_') zips[fn] = f(`gz/${fn}.gz`)
            else if (sec(fn) && !auth) ok = false
            else zips[fn] = f(`gz/${fn}.gz`)
        })
        if (ok) resp(req, r, { zips })
        else resp(req, r, { error: 'Unauthorized' }, 401)
    } else resp(req, r, { message: 'no files' }, 400)
}

function datesR(req, json, r) {
    if (json.files) {
        const { files } = json, date = {}
        //log.info('req->', req, files)
        files.forEach(fn => {
            const { mtime } = fs.statSync(`gz/${fn}.gz`)
            date[fn] = mtime
        })
        resp(req, r, { date })
    } else resp(req, r, { message: 'no files' }, 400)
}

function loginR(req, json, r) {
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

function sendR(req, json, r) {
    if (json.data) {
        const vs = fz('gz/vs_.gz'),
            { to: id, name: from_name, email: from_email, subject, message } = json.data,
            to = id && vs[id],
            to_email = to && to.email,
            to_name = to && to.name.split(' ')[0],
            from = email ? get_name(email, false) || get_cname(email) : from_name
        //log.info('req->', req, id || '', from)
        saveM(json)
        if (subject && message && (email || !to)) send({ to: to_name, email: to_email, from_email: email || from_email, from, subject, message })
            .then(s => resp(req, r, { sent: s }))
        else resp(req, r, { message: 'no data' }, 400)
    }
}

function saveR(req, json, r) {
    if (json.vol) saveVol(req, json, r)
    else if (json.comp) saveComp(req, json, r)
    else if (json.zips) saveZips(req, json, r)
    else if (json.files) saveFiles(req, json, r)
    else resp(req, r, { message: 'no data' }, 400)
}

function saveVol(req, json, r) {
    if (json.roles || json.details) {
        const { vol, roles, details } = json, vf = fz('gz/vs_.gz'), vs = vf || {},
            v = details ? details : vs[vol], name = v.name || 0
        //log.info('req->', req, name)
        if (vs['NaN']) delete vs['NaN']
        if (v.id * 1 === 0) {
            v.id = Math.max(...Object.keys(vs).filter(x => isNaN(x) === false)) + 1
            const bad_ids = Object.keys(vs).filter(x => isNaN(x) === true)
            debug({ new_id: v.id, v, bad_ids })
        }
        if (roles) v.year[2023] = roles
        send({
            from_email: email, uEmail: email, subject: `vol ${v.unsub ? 'unsub' : 'update'} ${v.name}`,
            message: `{volunteer} \n` +
                (roles ? `adult: ${roles && roles.adult ? roles.arole ? `${roles.asection},${roles.arole}` : 'yes' : 'no'}\n` +
                    `junior: ${roles && roles.junior ? roles.jrole ? `${roles.jsection},${roles.jrole}` : 'yes' : 'no'}\n`
                    : `${details ? JSON.stringify(details) : ''}`)
        })
        if (v.unsub) {
            if (!vs[0]) vs[0] = {}
            vs[0][v.id] = { ...v }
            delete vs[vol]
        }
        else vs[v.id] = v
        save('vs', vs, true)
        const vu = f('gz/vs.gz')
        resp(req, r, { vs: vu })
    } else resp(req, r, { message: 'no roles or details' }, 400)
}

function saveComp(req, json, r) {
    if (json.comp) {
        const cn = json.comp, cs = fz('gz/cs_.gz'),
            co = cs[cn.id],
            c = cs[cn.id] = co ? { ...co, ...cn } : cn
        save('cs', cs, true)
        //log.info('req->', req, { c, co, cn })
        send({
            from_email: email, uEmail: email, subject: `comp ${c.id} ${c.first} ${c.last}`,
            message: `{competitor}\n ${JSON.stringify(json.comp)}`
        })
        resp(req, r, { comp: c })
    } else resp(req, r, { message: 'no comp' }, 400)
}

function saveZips(req, json, r) {
    if (json.zips) {
        const { zips } = json, fs = Object.keys(zips),
            saved = {}
        //log.info('req->', req, fs)
        fs.forEach(fn => {
            saveRZ(zips[fn])
            saved[fn] = fn
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

function userR(req, json, r) {
    const vol = get_vol(null, email), comp = ns[email]
    //log.info('req->', req, { email, vol, comp })
    resp(req, r, { vol, comp })
}

function volR(req, json, r) {
    if (json.vol) {
        const vs = fz('gz/vs_.gz'), vol = get_vol(json.vol, email)
        if (vol) {
            //log.info('req->', req, { id: json.vol, name: vol.name })
            resp(req, r, { vol })
        } else resp(req, r, { error: 'Unauthorized' }, 401)
    } else resp(req, r, { message: 'no vol' }, 400)
}

function bulksendR(req, json, r) {
    if (!config.live && json.subject && json.message && json.list && aed) {
        const { subject, message, list, live } = json
        saveM(json)
        //log.info('req->', req, subject, { n: list.length }, { live })
        send_list(list, subject, message, live)
            .then(s => resp(req, r, { sent: s }))
            .catch(e => {
                log.info({ error: e })
                resp(req, r, { error: e }, 500)
            })
    } else resp(req, r, { error: 'Unauthorized' }, 401)
}

function compR(req, json, r) {
    if (json.cid && aed) {
        const cs = fz('gz/cs_.gz'), c = cs[json.cid]
        if (c) {
            //log.info('req->', req, { id: c.cid, name: `${c.first} ${c.last}` })
            resp(req, r, { comp: c })
        } else resp(req, r, { message: 'no comp' }, 400)
    } else resp(req, r, { error: 'Unauthorized' }, 401)
}

function photoR(req, json, r) {
    if (json.photo) {
        const p = json.photo
        //log.info('req->', req, { photo })
        if (ps[p.y]) {
            if (ps[p.y][p.n]) ps[p.y][p.n].push(p.pn)
            else ps[p.y][p.n] = [p.pn]
        }
        else ps[p.y] = { [p.n]: [p.pn] }
        save('gz/ps.gz', ps)
        ps = fz('gz/ps.gz')
        resp(req, r, { zp: f(`gz/ps.gz`) })
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
            anon: { filesR, datesR, loginR, sendR },
            auth: { userR, volR, compR, saveR, photoR, bulksendR }
        }
    if (req) {
        log.info('req->', req)
        if (reqF.anon[req]) reqF.anon[req](json, r)
        else if (reqF.auth[req]) {
            if (auth) reqF.auth[req](json, r)
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
export { log }
export default start
