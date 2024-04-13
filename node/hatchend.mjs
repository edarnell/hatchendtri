// npm install @aws-sdk/client-ses
process.title = "Hatchendtri Server"
const debug = console.log.bind(console)
import express from 'express'
import jwt from 'jsonwebtoken'
import { send, send_list } from './mail.mjs'
import { load, saveF, log, d, version } from './files.mjs'
import { testF } from './testing.mjs'

load()
const app = express()
app.use(express.json())

function resp(j, r, a, rj, status) {
    if (status) {
        log.error('resp->' + j.req, a ? a.i : '', status, rj)
        r.status(status).json(rj)
    }
    else {
        log.info('resp->', j.req, a ? a.i : '', JSON.stringify(rj).length + ' bytes')
        r.json(rj)
    }
    _resp = true
}

function filesReq(j, r, a) {
    if (j.files) {
        const { files } = j, zips = {}, error = []
        //log.info('req->', req, files)
        let ok = true
        files.forEach(fn => {
            if (d.fns[fn]) zips[fn] = d.fns[fn]
            else error.push(fn)
        })
        if (!error.length) {
            log.info(Object.entries(zips).map(([n, z]) => `${n}:${z.data.length}`))
            resp(j, r, a, { zips })
        }
        else resp(j, r, a, { error }, 400)
    } else resp(j, r, a, { message: 'no files' }, 400)
}

function datesReq(j, r, a) {
    if (j.files) {
        const { files } = j, date = {}, e = []
        log.info({ files })
        files.forEach(fn => {
            if (d.fns[fn]) date[fn] = d.fns[fn].date
            else e.push(fn)
        })
        if (!e.length) resp(j, r, a, { date })
        else resp(j, r, a, { e }, 400)
    } else resp(j, r, a, { e: 'no files' }, 400)
}

function loginReq(j, r, a) {
    if (j.email) {
        const email = j.email, u = d._es[email], i = u && u.i, un = u && u.fi && u.fi.unsub,
            msg = i && !un ? `You will be automatically logged in by the following {results}, {competitor} or {volunteer} links.`
                : (un ? 'Your email is currently unsubscribed but you can re-{subscribe}.\r\n'
                    : 'Your email is not registered with hatchendtri.com but you can {register}.\r\n') +
                'You may safetly ignore this email if someone else has mistakenly entered your email address.',
            m = { subject: 'Login', message: msg, to_email: email, ...i ? { to: u.first } : { to: 'Competitor/Volunteer' } }
        send(m)
            .then(s => resp(j, r, u, { sent: s }))
            .catch(e => resp(j, r, u, { loginReq_send: e }, 400))
    } else resp(j, r, a, { message: 'no email' }, 400)
}

function sendReq(j, r, a) {
    const { v, name, email, subject, message } = j, i = a && a.i,
        u = a && d._es[a.email], un = u && u.fi && u.fi.unsub,
        m = { v, subject, message, ...i ? { i } : { name, email } }
    if (subject && message && (i || email)) send(m)
        .then(s => resp(j, r, a, { sent: s }))
        .catch(e => resp(j, r, a, { e: 'send failed' }, 400))
    else resp(j, r, a, { e: 'no message or user' }, 400)
}

function saveU(j, r, a) {
    const u2 = j.u, u = d._es[u2.email]
    if (!a.aed) resp(j, r, a, { e: 'Unauthorized' }, 401)
    if (!u && u2.email) {
        const u2 = new_user(d)
        saveF('es')
        resp(j, r, a, { u: u2 })
    }
    else if (u.i !== u2.i) {
        if (u2.first !== u.first || u2.last !== u.last) {
            log.error({ saveU: { u, u2 } })
            resp(j, r, a, { e: 'u.i mismatch' }, 400)
        }
        else {
            const old = d.ei[u2.i], x = d._es[old], unsub = u.fi.unsub
            u.fi = { ...u.fi, ...x.fi }
            if (!unsub && u.fi.unsub) delete u.fi.unsub
            if (!x.fi.unsub) x.fi.unsub = new Date()
            x._i = u.i
            saveF('es')
            resp(j, r, a, { u, x })
        }
    }
    else resp(j, r, a, { u: saveF('es', u2) })
}

function saveVol(j, r, a) {
    if (j.v) {
        let v
        if (j.roles) v = saveF('vs', j.v, j.roles)
        else v = saveF('vs', j.v)
        resp(j, r, a, { v })
        const roles = d.vr[v.id], m = {
            i: a.i,
            subject: `volunteer update - ${v.first} ${v.last}`,
            message: `{vol.${v.id}} ${v.first} ${v.last}\n`
                + `${roles ? (!(roles.adult || roles.junior || roles.none) ? 'availability: ? - unset\n'
                    : (roles.none ? 'not available\n'
                        : (`adult: ${roles.adult ? roles.arole ? `${roles.asection},${roles.arole}` : 'yes' : 'no'}\n`
                            + `junior: ${roles.junior ? roles.jrole ? `${roles.jsection},${roles.jrole}` : 'yes' : 'no'}\n`
                        ))) + `notes: ${roles.notes || ''}\n`
                    : 'unset\n'}`
        }
        send(m)
    } else resp(j, r, a, { e: 'no vol' }, 400)
}

function saveComp(j, r, a) {
    if (j.comp) {
        const cn = j.comp,
            co = cs[cn.id],
            c = cs[cn.id] = co ? { ...co, ...cn } : cn
        //save('_cs', cs)
        //log.info('req->', req, { c, co, cn })
        send({
            from_email: email, uEmail: email, subject: `comp ${c.id} ${c.first} ${c.last}`,
            message: `{competitor}\n ${JSON.stringify(json.comp)}`
        })
        resp(j, r, a, { comp: c })
    } else resp(j, r, a, { message: 'no comp' }, 400)
}

function saveReq(j, r, a) {
    if (j.v) saveVol(j, r, a)
    else if (j.comp) saveComp(j, r, a)
    else if (j.u) saveU(j, r, a)
    else resp(j, r, a, { e: 'no data' }, 400)
}

function unsubReq(j, r, a) {
    log.info({ j, a })
    if (a && j.u) resp(j, r, a, { u: a }) // get unsub user details
    else if (a) {
        const reason = j.reason || '', { first, last } = a,
            un = { i: a.i, first, last, reason, date: new Date().toISOString() }
        saveF('unsub', un)
        resp(j, r, a, { unsub: true })
        const m = {
            to_email: d.ei[a.i],
            subject: 'Unsubscribe',
            message: 'You have been unsubscribed from Hatch End Triathlon emails, please conatct us if you did not request this.\r\n' +
                'You should treat any future emails which claim to be from Hatch End Triathlon with suspicion.'
        }
        send(m)
        const am = {
            i: a.i,
            subject: 'Unsub',
            message: `${first} ${last} ${a.i} unsubscribed\n Reason: ${reason}\n`
        }
        send(am)
    } else {
        debug({ unsub: { j, a } })
        resp(j, r, a, { e: 'data error' }, 400)
    }
}

function subReq(j, r, a) {
    const u = a && d.es[a.i], un = u && u.fi && u.fi.unsub
    if (un) {
        saveF('unsub', u, 'sub')
        userReq(j, r, a)
        const m = {
            to_email: d.ei[a.i],
            subject: 'Subscribe',
            message: 'You have been re-subscribed to Hatch End Triathlon emails, please conatct us if you did not request this.\r\n'
                + `You will be automatically logged in by the following {results}, {competitor} or {volunteer} links.\r\n`
        }
        send(m)
        const { first, last } = u
        const am = {
            i: a.i,
            subject: 'Sub',
            message: `${first} ${last} ${a.i} re-subscribed\n`
        }
        send(am)

    } else resp(j, r, a, { e: 'data error' }, 400)
}

function userReq(j, r, a) {
    const email = d.ei[a.aed && j.i] || a.email, u = d._es[email]
    if (u) {
        const { first, last, i, admin, fi } = u, aed = a.aed && !j.i,
            n = d.ns[email],
            vs = d.ev[i]
        resp(j, r, a, { u: { first, last, i, fi, aed, admin, ns: n, vs, ...(j.i && { email }) } })
    }
    else resp(j, r, a, { e: j }, 400)
}

function registerReq(j, r, a) {
    const { first, last, email } = j, u = d._es[email]
    if (u) loginReq(j, r, a)
    else if (first && last && email) {
        const m = {
            to: first,
            to_email: email,
            subject: 'Registered',
            message: 'You have been registered with Hatch End Triathlon, please conatct us if you did not request this.\r\n'
                + 'You will be automatically logged in by the following {results}, {competitor} or {volunteer} links.'
        }
        send(m).then(s => {
            const reg = saveF('es', { first, last, email })
            const am = {
                i: reg.i,
                subject: 'Reg',
                message: `${first} ${last} ${reg.i} registered\n`
            }
            send(am)
            resp(j, r, reg, { reg })
        }).catch(e => {
            resp(j, r, a, { e: 'send failed' }, 400)
        })
    }
    else resp(j, r, a, { e: j }, 400)
}

function volReq(j, r, a) {
    if (j.v && a) {
        const v = d._vs[j.v], u = d._es[a.email]
        if (a.email === v.email.toLowerCase()) v.i = u.i
        if (v && (u.admin || u.i === v.i)) {
            resp(j, r, a, { v })
        } else resp(j, r, a, { e: 'Unauthorized' }, 401)
    } else resp(j, r, a, { e: 'no vol' }, 400)
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
    const { subject, message, to, live, time } = j
    if (subject && message && to && to.length && a.aed) {
        const blk = saveF('blk', { subject, message, to, time, live })
        log.info({ bulksend: { to: to.length, subject, time } })
        if (time) delaySend(blk)
        else send_list(blk)
        resp(j, r, a, { bulksend: to.length, blk })
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
    const { y, n } = (j.get || j.pub), np = d.ns[a.email],
        u = np && np[y] && np[y].includes(n)
    if (j.get) {
        const pp = d.ps[y][n] || (a.admin && d.photos[y][n]), // public photos for number n
            op = u && d.photos[y][n]
        resp(j, r, a, { pp, op })
    }
    else if (j.pub) {
        const ph = j.pub.pn
        if (d.ps[y]) {
            if (d.ps[y][n]) {
                const i = d.ps[y][n].indexOf(ph)
                if (i === -1) d.ps[y][n].push(ph)
                else d.ps[y][n].splice(i, 1)
            }
            else d.ps[y][n] = [ph]
        }
        else d.ps[y] = { [n]: [ph] }
        const pn = saveF('ps', y, n), pp = d.ps[y][n]
        log.info({ pp })
        resp(j, r, a, { pp, pn })
    } else resp(j, r, a, { e: 'no photo' }, 400)
}

app.post(d.config.url, auth(async (j, r, a) => {
    const reqF = {
        anon: { filesReq, datesReq, loginReq, sendReq, unsubReq, registerReq, testReq },
        auth: { userReq, volReq, compReq, subReq, saveReq, photoReq, bulksendReq }
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
    const u = email && d._es[email],
        { first, last, aed, admin, i } = u || {}
    return i ? { i, aed, admin, first, last, email } : null
}

function authH(cI) {
    const token = cI.token,
        auth = token ? jwt.verify(token, d.config.key) : null,
        u = auth ? ue(auth.email.toLowerCase()) : null
    return u
}

var _resp
function auth(rH) {
    return async (m, r) => {
        _resp = false
        const j = m.body, h = m.headers
        let a
        if (h.ci) { // cI=>ci
            const cI = JSON.parse(h.ci)
            try {
                a = j.req ? authH(cI) : null
                if (j.req) {
                    if (version !== cI.v) {
                        log.info('req->', j.req)
                        log.info({ version, cI })
                        resp(j, r, a, { reload: `${version}!=${cI.v}` }, 503)
                    }
                    else await rH(j, r, a)
                }
                else if (j.MessageId && j.TopicArn) sns(j, r)
                else {
                    log.info('req->', j.req)
                    resp(j, r, a, { e: 'No Request' }, 400)
                }
            } catch (e) {
                log.error({ j, a, e, _resp })
                if (!_resp) resp(j, r, a, { e: 'Server catch' }, 500)
            }
        }
        else {
            log.error({ h })
            resp(j, r, a, { e: 'Unauthorized' }, 401)
        }
    }
}

app.listen(d.config.port, () => {
    log.info(`listening on ${d.config.url} port ${d.config.port}`)
})

function start() {
    log.info('start')
    app.listen(d.config.port, () => {
        log.info(`listening on ${d.config.url} port ${d.config.port}`)
    })
}

function testReq(j, r, a) {
    if (d.config.live !== false) resp(j, r, a, { e: 'live' }, 401)
    else {
        const v = testF(j)
        debug(v)
        resp(j, r, a, v)
    }
}

export { log }
export default start
