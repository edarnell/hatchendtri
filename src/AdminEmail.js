import Html, { debug, error, nav, snakeCase, jsonToHtml } from './Html.js'
import { ajax } from './ajax.js'
import { zip } from './unzip.js'
import html from './html/AdminEmail.html'
class AdminEmail extends Html {
    constructor() {
        super()
        this.id = 'AdminEmail'
        this.data = ['es', 'ml', 'cs', 'ds']
    }
    //             save: { tip: `save emails_`, class: 'form danger', click: this.save },
    form = () => {
        const o = this.ml_opt && [{ name: 'since', value: '' }, ...this.ml_opt]
        return {
            filter: { tip: 'filter by name or club or key', placeholder: 'name,name,...', width: '50rem' },
            send: { tip: `send to selected`, class: 'form primary', drag: () => new Send(this, 'Send') },
            new: { tip: `add email`, class: 'form primary', popup: () => new Email(this, 'Email', null) },
            since: { tip: 'last send before this', class: 'form', options: o || [] },
            jetstream: { tip: 'jetstream members' },
            photos: { tip: 'photos' },
            cs: { tip: 'competitors' },
            ds: { tip: 'deferred' },
            vs: { tip: 'volunteers' },
            unsubs: { tip: 'unsub and bounce' },
            admins: { tip: 'admins' }
        }
    }
    showEmail = (i) => {
        ajax({ req: 'user', i }).then(r => {
            const el = this.q(`[id*="tip_TT_fe_${i}_"]`), u = r.u
            if (el) el.innerHTML = u.email
        }).catch(e => error(e))
        return i
    }
    cs = () => {
        const cs = nav.d.data.cs
        if (cs) {
            const r = {}
            Object.values(cs).forEach(c => {
                if (c.email) {
                    r[c.email] = r[c.email] || []
                    r[c.email].push(c)
                }
                else error({ c })
            })
            this._cs = r
        }
        const ds = nav.d.data.ds
        if (ds) {
            const r = {}
            Object.values(ds).forEach(c => {
                if (c.email) {
                    r[c.email] = r[c.email] || []
                    r[c.email].push(c)
                }
                else error({ c })
            })
            this._ds = r
        }
    }
    names = (i) => {
        const cs = this._cs, ds = this._ds, c = (cs && cs[i]) || (ds && ds[i])
        if (c) return c.map(c => c.first).join(', ')
        else return ''
    }
    ml = () => {
        const d = nav.d.data, ml = d && d.ml, e = d && d.es, eml = {}
        if (ml && e) {
            let last = ''
            const opt = Object.keys(ml).filter(dt => ml[dt].req === 'bulksend' && ml[dt].live).reverse().map(dt => {
                const m = ml[dt], dmy = dt.replace(/^(\d{2})(\d{2})(\d{2})(\d{2}).*$/, '$4/$3/$2'), s = m.subject
                let r = { name: `${dmy} ${s}`, value: dt }
                m.list.forEach(r => {
                    if (!eml[r.to.email]) eml[r.to.email] = [dt]
                    else {
                        const l = eml[r.to.email][eml[r.to.email].length - 1]
                        if (ml[l].subject !== m.subject) eml[r.to.email].push(dt)
                    }
                })
                if (m.subject === last) r = null
                else last = m.subject
                return r
            }).filter(r => r)
            this._ml = eml
            this.ml_opt = opt
        }
    }
    filter = (r) => {
        let ret = true
        const f = this.f, d = nav.d.data, es = d && d.es
        if (!f) ret = es && es[r[0]].admin
        else {
            const last = this._ml[r[0]] ? this._ml[r[0]][0] : ''
            if (f.admins) ret = ret && es && es[r[0]].admin
                ;['jetstream', 'photos', 'cs', 'vs', 'ds'].forEach(k => {
                    if (f[k]) ret = ret && r[5].includes(k)
                })
            if (f.unsubs) ret = ret && (r[5].includes('unsub') || r[5].includes('bounce'))
            else ret = ret && !r[5].includes('unsub') && !r[5].includes('bounce')
            if (f.since) ret = ret && (last.substring(0, 8) < f.since.substring(0, 8))
            if (f.filter) {
                const xs = f.filter.split(',').map(s => s.toLowerCase().trim())
                ret = ret && xs.every(x => (r.some(c => c.toLowerCase().includes(x))))
            }
        }
        return ret
    }
    save = (e, o) => {
        debug({ AdminEmails: this, e, o })
        const emails = zip(this.rows, true)
        debug({ save: emails.length })
        ajax({ req: 'save', zips: { emails } }).then(r => {
            debug({ r })
        }).catch(e => error(e))
    }
    loaded = (r) => {
        debug({ loaded: { r, d: nav.d.data } })
        if (r) this.reload("emails")
    }
    rendered = (id) => {
        const v = this.q('#n')
        if (v && this.rows) v.innerHTML = Object.keys(this.rows).length
    }
    html = (n) => {
        if (!this._ml) this.ml()
        if (!this._cs) this.cs()
        if (n === 'emails') {
            return `<div id="emails">${this._ml ? '{table.emails}' : 'no emails'}</div>`
        }
        else return html
    }
    var = (n) => {
        if (n === 'n') return '<span id="n">?</span>'
    }
    ths = (n) => {
        if (n === 'emails') return ['eid', 'first', 'last', 'names', 'sent', 'files']
        else return ''
    }
    link = (n, p) => {
        if (n.charAt(0) === 'f') {
            const i = n.substring(3), d = nav.d.data, emails = d && d.es, color = { f0: 'amber', fE: 'red', fn: 'green', fe: 'blue' }
            //e.first = p
            return { tip: () => this.showEmail(i), class: color[n.substring(0, 2)], popup: () => new Email(this, 'Email', i) }
        }
        else if (n.charAt(0) === 's') {
            const [dt, i] = n.substring(1).split('_')
            return { tip: () => this.to(dt, i), class: 'green', drag: () => new Send(this, 'Sent', dt) }
        }
    }
    to = (dt, i) => {
        const d = nav.d.data, ml = d && d.ml, m = ml && ml[dt],
            to = m.list.filter(r => r.to.email + '' === i + '')[0].to,
            n = m.list.length - 1
        //debug({ m, to }) // ${to.name} 
        return `${to.name}${n ? ` (+${n} others)` : ''} ${m.live ? '' : '(testing)'}<br />${m.subject}`
    }
    photos = (email) => {
        const d = nav.d.data, ns = d && d.ns_, ps = d && d.photos,
            ny = ns && ns[email], p = { 2022: false, 2023: false }
        if (ny) Object.keys(ny).forEach(y => {
            if (ps[y][ny[y]]) p[y] = true
        })
        const ys = Object.keys(p).filter(y => p[y])
        return ys.length ? ys : null
    }
    trs = (n) => {
        const d = nav.d.data, es = d.es, ml = this._ml
        let ret = this.rows = []
        if (n === 'emails' && ml) {
            const rs = Object.keys(es).map(i => {
                const r = es[i],
                    sent = ml[i] ? ml[i].map(dt => `{link.s${dt}_${i}.${dt.replace(/^(\d{2})(\d{2})(\d{2})(\d{2}).*$/, '$4/$3/$2')}}`).join(' ') : ''
                return [i, `{link.fe_${i}.${r.first}}`, this.color(r.last, r), this.names(i), sent, Object.keys(r.fi || {}).join(' ')]
            })
            ret = rs.filter(this.filter).sort((a, b) => a[2].toLowerCase().localeCompare(b[2].toLowerCase()))
            this.rows = ret.map(r => r[0])
        }
        const v = this.q('#n')
        if (v) v.innerHTML = ret.length
        return ret
    }
    input = (e, o) => {
        this.f = this.getForm()
        this.reload('emails')
    }
    color = (s, e) => {
        if (e.fi && e.fi.unsub) return `<span class="red">${s}</span>`
        else if (e.fi && e.fi.bounce) return `<span class="amber">${s}</span>`
        else return s
    }
    dedupe = (a) => {
        const ret = []
        a.forEach(s => {
            if (ret.indexOf(snakeCase(s)) === -1) ret.push(snakeCase(s))
        })
        return ret
    }
}

class Email extends Html {
    constructor(p, name, param) {
        super(p, name, param)
        if (param) ajax({ req: 'user', i: param }).then(r => {
            this.u = r.u
            this.reload('name')
            this.reload('details')
        }).catch(e => error(e))
        else this.u = { first: '', last: '', email: '' }
        debug({ Email: this })
    }
    link = (n) => {
        if (n === 'name') return { tip: 'save', icon_: 'save', click: this.save }
    }
    form = () => {
        return { // section and options populated on load
            first: { placeholder: 'first name', width: '50rem', value: this.u.first || '' },
            last: { placeholder: 'last name', width: '50rem', value: this.u.last || '' },
            email: { placeholder: 'email', width: '50rem', type: 'email', value: this.u.email || '' },
            bounce: { class: 'bold red hidden', label: 'Bounce', tip: 'bounced', value: this.u.bounce ? true : false },
            admin: { class: 'bold red', label: 'Admin', tip: 'admin', value: this.u.admin ? true : false },
            unsub: { class: 'bold red', label: 'Unsub', tip: 'unsubscribe', value: this.u.fi.unsub ? true : false }
        }
    }
    html = (n) => {
        if (n === 'details') {
            return `<div id="details">
            ${this.u ? `{input.first}<br />
    {input.last}<br />
    {input.email}<br />
    {checkbox.admin} {checkbox.unsub} {checkbox.bounce}</div>`
                    : `loading...`}
            </div>`
        }
        else if (n === 'name') {
            return `<span id='name'>${this.u ? `{link.name.Email}` : 'Email'}</span>`
        }
        else return `<div class="card fit">
                <div class="card-header">
                {link.close.×}
                    <span class="title">{div.name}</span>
                </div>
                <div class="card-body">
                {div.details}
                </div>`
    }
    close = (m, e, u) => {
        if (e) {
            error({ e })
            this.popup.close('<div class="red">Error updating</div>')
        }
        else this.popup.close(m || 'not updated')
        if (u) this.p.reload('emails')
    }
    save = () => {
        const f = this.getForm(),
            u = this.u
        let c = false
        for (let key in f) {
            if (u[key] !== f[key] && (u[key] || f[key])) {
                u[key] = f[key]
                c = true
            }
        }
        if (f.unsub !== u.fi.unsub ? true : false) c = true
        if (c) ajax({ req: 'save', u }).then(r => {
            debug({ r, u, f })
            const es = nav.d.data.es
            if (r.u) es[r.u.i] = r.u
            if (r.x) es[r.x.i] = r.x
            this.close('<div class="green">updated</div>', false, true)
        }).catch(e => this.close(null, e))
        else this.close('no change')
    }
    input = (e, o) => {
        // do nothing
        const f = this.getForm()
        debug({ input: f })
    }
}

class Send extends Html {
    constructor(p, name, param) {
        super(p, name, param)
        const d = nav.d.data, ml = d && d.ml
        this.m = ml && ml[param]
        this.dt = this.m && param.replace(/^(\d{2})(\d{2})(\d{2})(\d{2}).*$/, '$4/$3/$2')
    }
    form = () => {
        const m = this.m || {}, o = [{ name: 'load', value: '' }, ...this.p.ml_opt]
        return {
            load: { tip: 'load', class: 'form', options: o, value: this.param || '' },
            unsub: { tip: 'include unsubscribe' },
            time: { tip: 'send at hh:mm', placeholder: '00:00 Fri', size: 5 },
            subject: { placeholder: 'subject', size: 40, required: true, value: m.subject || '' },
            message: { placeholder: 'message...', cols: 80, rows: 15, required: true, value: m.message || '' },
            test: { tip: `test to ${this.p.rows.length}`, class: 'form', click: () => this.send(false) },
            send: { tip: `send to ${this.p.rows.length}`, class: 'form', click: () => this.send(true) }
        }
    }
    html = () => {
        const dt = this.dt
        //debug({ param: this.param, dt, m: this.m })
        return `<div class="card fit wide">
                <div class="card-header">
                {link.close.×}
                    <span class="title">Send ${dt ? `(sent ${dt} to ${this.m.list.length})` : ''}</span>
                    {button.test} {checkbox.unsub} {button.send} {input.time} 
                </div>
                <div class="card-body">
                {select.load}<br/>
                {input.subject}<br/>
                {textarea.message}
                </div>`
    }
    close = () => {
        this.popup.close()
        debug({ close: this })
        //this.p.reload("emails")
    }
    input = (e, o) => {
        const f = this.f = this.getForm()
        if (o.name === 'load') {
            const d = nav.d.data, ml = d && d.ml
            this.m = ml && ml[f.load]
            this.fe('subject', this.m.subject)
            this.fe('message', this.m.message)
        }
        debug({ input: o, f })
    }
    send = (l) => {
        const fm = this.getForm(), live = l === true, rows = live ? this.p.rows : this.p.rows.slice(0, 20),
            d = nav.d.data, emails = d.es,
            list = rows.map(email => (emails[email] && { to: { name: emails[email].first, email } })).filter(r => r),
            { subject, message, unsub, time } = fm
        if (list.length) ajax({ req: 'bulksend', subject, message, unsub, time, list, live }).then(r => {
            this.p.reload('emails')
            debug({ r })
        }).catch(e => error(e, o))
    }
}

export default AdminEmail