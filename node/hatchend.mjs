// npm install @aws-sdk/client-ses
const debug = console.log.bind(console)
import express from 'express'
import log4js from "log4js"
import jwt from 'jsonwebtoken'
import { send, send_list } from './mail.mjs'
import { load, saveF, d } from './files.mjs'

log4js.configure(d.config.log4js)
const log = log4js.getLogger()
const fns = load()
log.info("Started")

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

function get_vol(id, email) {
    debug({ get_vol: { id, email } })
    const u = d.emails[email]
    if (id * 1 === -1) {
        return { id, name: `${u.first} ${u.last}`, email, mobile: '' }
    }
    const v = d.vs[id], i = v && v.i, self = i === u.i
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
        const { files } = j, zips = {}, error = []
        //log.info('req->', req, files)
        let ok = true
        files.forEach(fn => {
            if (fns[fn]) zips[fn] = fns[fn]
            else error.push(fn)
        })
        if (!error.length) resp(j, r, a, { zips })
        else resp(j, r, a, { error }, 400)
    } else resp(j, r, a, { message: 'no files' }, 400)
}

function datesReq(j, r, a) {
    if (j.files) {
        const { files } = j, date = {}, e = []
        //log.info('req->', req, files)
        files.forEach(fn => {
            if (fns[fn]) date[fn] = fns[fn].date
            else e.push(fn)
        })
        if (!e.length) resp(j, r, a, { date })
        else resp(j, r, a, { e }, 400)
    } else resp(j, r, a, { e: 'no files' }, 400)
}

function loginReq(j, r, a) {
    if (j.email) {
        const email = j.email, u = d.emails[email]
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
        saveF('mail', j)
        if (subject && message) send({ to: to_name, email: to_email, from_email, from, subject, message })
            .then(s => resp(j, r, a, { sent: s }))
        else resp(j, r, a, { e: 'no message' }, 400)
    } else resp(j, r, a, { e: 'no data' }, 400)
}

function vName(id) {
    const v = d.vs[id], u = d.emails[d.ei[v.i]], first = v.first || u.first, last = v.last || u.last
    return `${first} ${last}`
}

function update_v(v, details) {
    const { first, last, mobile, notes, email } = details,
        { i, id } = v, u = d.emails[email]
    if (v.first) v = { first, last, mobile, notes, email, i, id }
    else if (v.last) v = { last, mobile, notes, email, i, id }
    else {
        if (u.first !== first || u.last !== last) {
            u.first = first
            u.last = last
            u.pdated = true
        }
        v = { mobile, notes, email, i, id }
    }
    return v
}

function new_user(u, v) {
    const { first, last, email } = u, ts = new Date()
    let i = Math.max(...Object.keys(d.emails).filter(x => isNaN(x) === false)) + 1
    d.emails[email] = { first, last, email, i, files: { ts }, ...v && { updated: true, vs: [v.id] } }
    d.ei[i] = email
    return d.emails[email]
}

function switch_v(v, details) {
    const { first, last, mobile, notes, email } = details,
        uv = d.emails[d.ei[v.i]], u = d.emails[email] || new_user(details, v)
    if (uv.vs && uv.vs.includes(v.id)) {
        uv.vs.splice(uv.vs.indexOf(v.id), 1)
        d.emails[ei[v.i]] = uv
        d.emails[ei[v.i]].updated = true
    }
    v = { i: u.i, id: v.id }
    if (!u.vs) u.vs = [v.id]
    else u.vs.push(v.id)
    u.updated = true
    v = update_v(v, details)
    return v
}

function update_vuser(v, details) {
    const email = details.email,
        uv = d.emails[d.ei[v.i]],
        ue = d.emails[email],
        u = (uv && ue) && uv.i === ue.i && uv
    if (!uv) v = null
    else if (u) v = update_v(v, details)
    else v = switch_v(v, details)
    return v
}

function saveU(j, r, a) {
    const u2 = j.u, u = d.emails[u2.email]
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
            const old = d.ei[u2.i], x = d.emails[old], unsub = u.fi.unsub
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
    let v
    const { vol, roles, year, details } = j
    if (vol === -1) {
        const u = d.emails[a.email], i = u && u.i,
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
    saveF('vs', v)
    resp(j, r, a, { vs: d.fns['vs'], v })
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
    if (j.vol) saveVol(j, r, a)
    else if (j.comp) saveComp(j, r, a)
    else if (j.u) saveU(j, r, a)
    else resp(j, r, a, { e: 'no data' }, 400)
}

function unsubReq(j, r, a) {
    const tok = j.tok, auth = tok && jwt.verify(tok, d.config.key),
        ae = ue(auth.email)
    if (a && a.i !== ae.i) log.info({ unsub: { a: a.i, ae: ae.i } })
    if (ae && j.u) resp(j, r, a, { u: ae }) // get unsub user details
    else if (ae && j.i == ae.i) {
        const reason = j.reason || '', { first, last } = ae,
            unsub = fs.existsSync(`gz/_unsub.gz`) ? fz('gz/_unsub.gz') : {}
        unsub[ae.i] = { i: ae.i, first, last, reason, date: new Date().toISOString().slice(0, 10) }
        save('_unsub', unsub)
        send({
            from_email: ae.email, subject: 'Unsubscibe',
            message: `${first} ${last} ${ae.i} unsubscribed\n Reason: ${reason}\n` +
                `${a && a.i !== ae.i ? `${ae.i}(${ae.email}) !== ${a.i}(${a.email})\n` : ''}`
        })
        resp(j, r, a, { unsub: true })
    } else resp(j, r, a, { e: 'data error' }, 400)
}

function subReq(j, r, a) {
    const tok = j.tok, auth = tok && jwt.verify(tok, d.config.key),
        email = auth.email,
        { first, last } = j.details || {},
        ae = ue(email)
    if (ae) {
        log.info({ subReq: { ae: ae.i } })
        resp(j, r, a, { u: ae })
    } else if (first && last && email) {
        debug({ subReq: { first, last, email } })
        const i = Math.max(...Object.values(d.emails).map(x => x.i)) + 1
        d.emails[email] = { first, last, email, i }
        save('_emails', emails)
        d.fns['es'] = f_es()
        resp(j, r, a, { u: { first, last, i }, es: fns['es'] })
    } else resp(j, r, a, { e: 'data error' }, 400)
}

function userReq(j, r, a) {
    const email = d.ei[a.aed && j.i] || a.email, u = d.emails[email]
    if (u) {
        const { first, last, i, admin, fi } = u, aed = a.aed && !j.i,
            n = d.ns[email]
        resp(j, r, a, { u: { first, last, i, fi, aed, admin, ns: n, ...(j.i && { email }) } })
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
        const pre = { ...j, list: [] }, mailLog = saveF('mail', pre)
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
    const { y, n } = (j.get || j.pub), np = d.ns[a.email],
        u = np[y] && (np[y].includes(n))
    if (j.get) {
        const pp = d.ps[y][n], // public photos for number n
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
    const u = email && d.emails[email],
        aed = email && email === 'ed@darnell.org.uk',
        i = u && u.i,
        { first, last } = u || {}
    return i ? { i, aed, first, last, email } : null
}

function authH(h) {
    const token = h && h.startsWith('Bearer ') ? h.substring(7) : null,
        auth = token ? jwt.verify(token, d.config.key) : null,
        u = auth ? ue(auth.email) : null
    return u
}

var _resp
function auth(rH) {
    return async (m, r) => {
        _resp = false
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
            log.error({ j, a, e, _resp })
            if (!_resp) resp(j, r, a, { e: 'Server catch' }, 500)
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
export { log }
export default start
