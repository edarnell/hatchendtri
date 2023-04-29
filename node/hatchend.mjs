// npm install @aws-sdk/client-ses
const debug = console.log.bind(console)
import express from 'express'
import { f, fz, save, sec } from './zip.mjs'
import { send } from './mail.mjs'
import log4js from "log4js"
import jwt from 'jsonwebtoken'
import fs from 'fs'

const config = f('config.json', true)

log4js.configure(config.log4js)
const log = log4js.getLogger()
log.info("Started")
log.info("Loaded data")

const app = express()
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
    const vs = fz('gz/vs_.gz')
    return Object.values(vs)
        .filter(u => u.email === email)
        .map(u => split ? u.name.split(' ')[0] : u.name)
        .join(', ')
}

function get_vol(id, email) {
    const vs = fz('gz/vs_.gz'),
        us = Object.values(vs)
            .filter(u => u.email === email),
        admin = us.some(u => u.admin === true),
        self = id && us.some(u => u.id === id)
    if (id && (self || admin)) return vs[id]
    else if (!id) return us
}

app.post(config.url, (m, r) => {
    const json = m.body, { req } = json
    if (m.headers.a_hatchend !== '20230521') return resp(req, r, { message: 'Invalid request' }, 404)
    const h = m.headers.authorization, token = h && h.startsWith('Bearer ') ? h.substring(7) : null,
        auth = token ? jwt.verify(token, config.key) : null,
        email = auth ? auth.email : null
    if (req) {
        if (req === 'files' && json.files) {
            const { files } = json, zips = {}
            log.info('req->', req, files)
            let ok = true
            files.forEach(fn => {
                if (auth && email === 'ed@darnell.org.uk' && ['2023C'].includes(f)) zips[fn] = f(`lists/${fn}.csv`, true)
                else if (sec(fn) && !auth) ok = false
                else zips[fn] = f(`gz/${fn}.gz`)
            })
            if (ok) resp(req, r, { zips })
            else resp(req, r, { error: 'Unauthorized' }, 401)
        }
        else if (req === 'dates' && json.files) {
            const { files } = json, date = {}
            log.info('req->', req, files)
            files.forEach(fn => {
                const { mtime } = fs.statSync(`gz/${fn}.gz`)
                date[fn] = mtime
            })
            resp(req, r, { date })
        }
        else if (req === 'login' && json.email) {
            const email = json.email, name = typeof email === 'string' && get_name(email)
            log.info('req->', req, email)
            if (!name) send({
                to: 'Competitor/Volunteer', email: email, subject: 'Login',
                message: 'Self-service capabilities will be added to <a href="{host}">hatchendtri.com</a> soon. You may safetly ignore this email if someone else has mistakenly entered your email address.'
            }).then(s => resp(req, r, { sent: s }))
            else send({
                to: name, email: email, subject: 'Login',
                message: 'You will be automatically logged in by the following <a href="{host}/competitor{token}">competitor</a>, <a href="{host}/volunteer{token}">volunteer</a> or <a href="{host}/{token}">home page</a> links.'
            })
                .then(s => resp(req, r, { sent: s }))
        }
        else if (req === 'send' && json.data) {
            const vs = fz('gz/vs_.gz'),
                { to: id, name: from_name, email: from_email, subject, message } = json.data,
                to = id && vs[id],
                to_email = to && to.email,
                to_name = to && to.name.split(' ')[0],
                from = email ? get_name(email) : from_name
            if (subject && message && (email || !to)) send({ to: to_name, email: to_email, from_email: email || from_email, from, subject, message })
                .then(s => resp(req, r, { sent: s }))
            else resp(req, r, { message: 'no data' }, 400)
        }
        else if (auth) {
            if (req === 'send_list') {
                const { emails } = json
                log.info('req->', req, emails.length)
                //if (emails) send_list(emails)
                resp(req, r, { sending: Object.keys(emails).length })
                //else resp(req, r, { message: 'no data' }, 400)
            }
            else if (req === 'save' && json.vol !== undefined && (json.roles || json.details)) {
                const { vol, roles, details } = json, vf = fz('gz/vs_.gz'), vs = vf || {},
                    v = details ? details : vs[vol], name = v.name || 0
                log.info('req->', req, name)
                if (vs['NaN']) delete vs['NaN']
                if (v.id * 1 === 0) {
                    v.id = Math.max(...Object.keys(vs).filter(x => isNaN(x) === false)) + 1
                    const bad_ids = Object.keys(vs).filter(x => isNaN(x) === true)
                    debug({ new_id: v.id, v, bad_ids })
                }
                if (roles) v.year[2023] = roles
                if (v.unsub) {
                    if (!vs[0]) vs[0] = {}
                    vs[0][v.id] = { ...v }
                    delete vs[vol]
                }
                else vs[v.id] = v
                save('vs', vs, true)
                const vu = f('gz/vs.gz')
                resp(req, r, { vs: vu })
            }
            else if (req === 'save' && json.files) {
                const { files } = json, zips = {}, fs = Object.keys(files)
                log.info('req->', req, fs)
                fs.forEach(fn => {
                    save(fn, files[fn], true)
                    zips[fn] = f(`gz/${fn}.gz`)
                })
                resp(req, r, { zips })
            }
            else if (req === 'vol') {
                const vs = fz('gz/vs_.gz'), vol = get_vol(json.vol, email)
                if (Array.isArray(vol)) {
                    log.info('req->', req, { vols: vol.map(v => ({ id: v.id, name: v.name })) })
                    resp(req, r, { vol })
                }
                else if (vol) {
                    log.info('req->', req, { id: json.vol, name: vol.name })
                    resp(req, r, { vol })
                } else resp(req, r, { error: 'Unauthorized' }, 401)
            }
            else {
                log.info('req->', req)
                resp(req, r, { message: 'Invalid request' }, 404)
            }
        } else {
            log.info('req->', req)
            resp(req, r, { error: 'Unauthorized' }, 401)
        }
    }
    else {
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

export default start
