import Html, { debug, nav, snakeCase, jsonToHtml } from './Html.js'
import { ajax } from './ajax.js'
import { zip } from './unzip.js'
import html from './html/AdminEmail.html'
class AdminEmail extends Html {
    constructor() {
        super()
        this.id = 'AdminEmail'
        this.data = ['emails', 'mailLog']
    }
    //             save: { tip: `save emails_`, class: 'form danger', click: this.save },
    form = () => {
        const o = this.ml_opt && [{ name: 'since', value: '' }, ...this.ml_opt]
        return {
            filter: { tip: 'filter by name or club or key', placeholder: 'name,name,...', width: '50rem' },
            send: { tip: `send to selected`, class: 'form primary', drag: () => new Send(this, 'Send') },
            since: { tip: 'last send before this', class: 'form', options: o || [] },
            jetstream: { tip: 'jetstream members' },
            photos: { tip: 'photos' },
            vs: { tip: 'volunteers' },
            unsubs: { tip: 'unsub and bounce' },
            test3: { tip: 'testing to Darnell' }
        }
    }
    ml = () => {
        const d = nav.d.data, ml = d && d.mailLog, e = d && d.emails, eml = {}
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
        const f = this.f
        if (!f) ret = r[3] === '57'
        else if (f.test3) ret = r[2].includes('Darnell')
        else {
            const last = this._ml[r[3]] ? this._ml[r[3]][0] : ''
            if (f.jetstream) ret = ret && r[5].includes('jetstream')
            if (f.photos) ret = ret && r[5].includes('photos')
            if (f.vs) ret = ret && r[5].includes('vs')
            if (f.unsubs) ret = ret && (r[5].includes('unsub') || r[5].includes('bounce'))
            else ret = ret && !r[5].includes('unsub') && !r[5].includes('bounce')
            if (f.since) ret = ret && (last < f.since)
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
        if (n === 'emails') {
            return `<div id="emails">${this._ml ? '{table.emails}' : 'no emails'}</div>`
        }
        else return html
    }
    var = (n) => {
        if (n === 'n') return '<span id="n">?</span>'
    }
    ths = (n) => {
        if (n === 'emails') return ['first', 'firsts', 'lasts', 'email', 'sent', 'files']
        else return ''
    }
    link = (n, p) => {
        if (n.charAt(0) === 'f') {
            const i = n.substring(3), d = nav.d.data, emails = d && d.emails, ks = emails && Object.keys(emails),
                k = ks[i], e = emails && emails[k],
                color = { f0: 'amber', fE: 'red', fn: 'green', fe: 'blue' }
            //e.first = p
            return { tip: () => jsonToHtml(e), class: color[n.substring(0, 2)], popup: () => new Email(this, 'Email', k) }
        }
        else if (n.charAt(0) === 's') {
            const [dt, i] = n.substring(1).split('_')
            return { tip: () => this.to(dt, i), class: 'green', drag: () => new Send(this, 'Sent', dt) }
        }
    }
    to = (dt, i) => {
        const d = nav.d.data, ml = d && d.mailLog, m = ml && ml[dt],
            emails = d && d.emails, ks = emails && Object.keys(emails), e = ks && ks[i],
            to = m.list.filter(r => r.to.email * 1 === e * 1)[0].to
        //debug({ dt, i, m, to, e })
        return `${to.name} ${m.live ? '' : '(testing)'}<br />${m.subject}`
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
        const d = nav.d.data, emails = d.emails, ml = this._ml
        let ret = this.rows = []
        debug({ trs: { n, emails, ml } })
        if (n === 'emails' && ml) {
            const rs = Object.keys(emails).map((e, i) => {
                const r = emails[e],
                    sent = ml[e] ? ml[e].map(dt => `{link.s${dt}_${i}.${dt.replace(/^(\d{2})(\d{2})(\d{2})(\d{2}).*$/, '$4/$3/$2')}}`).join(' ') : ''
                return [`{link.fe_${i}.${r.first}}`, r.firsts.join(', '), this.dedupe(r.lasts).join(', '), this.color(e, r), sent, Object.keys(r.fi).join(' ')]
            })
            ret = rs.filter(this.filter).sort((a, b) => a[2].toLowerCase().localeCompare(b[2].toLowerCase()))
            this.rows = ret.map(r => r[3])
        }
        const v = this.q('#n')
        if (v) v.innerHTML = ret.length
        return ret
    }
    trs1 = (n) => {
        const d = nav.d.data, emails = d.emails, ml = d.mailLog, rs = {}
        let ret = []
        if (n === 'emails' && emails && ml) {
            if (!this._ml) this.ml()
            ret = Object.keys(emails).map((email, i) => {
                let fn = '', efn = '', ef0 = '?'
                const e = emails[email], fi = {}, fs = [], ls = [], efs = []
                Object.keys(e).filter(f => ['unsub', 'bounce', 'first', 'sent', 'fi'].indexOf(f) === -1).forEach(f => {
                    const emf = (e[f].eName || '').split(' ')[0]
                    //if (typeof emf !== 'string') debug({ email, e, f, emf })
                    if (emf && ef0 === '?') ef0 = emf
                    if (!e[f].first) debug({ email, e, f })
                    else if (!fn && email.indexOf(e[f].first.toLowerCase()) !== -1) fn = e[f].first
                    else if (!fn && emf && email.indexOf(emf.toLowerCase()) !== -1) efn = emf
                    fs.push(e[f].first)
                    ls.push(e[f].last)
                    if (e[f].file) e[f].file.forEach(n => fi[n] = n)
                    else debug({ email, e, f })
                    if (e[f].club && e[f].club.toLowerCase().includes('jetstream')) fi['jetstream'] = 'jetstream'
                })
                const first = e.first ? `{link.fn_${i}.${e.first}}` : fn ? `{link.fn_${i}.${snakeCase(fn)}}`
                    : efn ? `{link.fe_${i}.${snakeCase(efn)}}`
                        : fs.length === 1 ? `{link.f0_${i}.${snakeCase(fs[0])}}` : `{link.fE_${i}.${snakeCase(ef0)}}`,
                    sent = e.sent ? e.sent.map(dt => `{link.s${dt}_${i}.${dt.replace(/^(\d{2})(\d{2})(\d{2})(\d{2}).*$/, '$4/$3/$2')}}`).join(' ') : '',
                    photos = this.photos(email)
                e.fi = fi
                if (photos) e.fi['photos'] = photos
                if (e.unsub) e.fi['unsub'] = e.unsub
                if (e.bounce) e.fi['bounce'] = e.bounce
                const f1 = e.first ? e.first : fn ? snakeCase(fn) : efn ? snakeCase(efn) : fs.length === 1 ? snakeCase(fs[0]) : snakeCase(ef0)
                rs[email] = { first: f1, firsts: fs.map(f => snakeCase(f)), lasts: ls.map(l => snakeCase(l)), fi }
                return [first, fs.join(', '), this.dedupe(ls).join(', '), this.color(email, e), sent, Object.keys(e.fi).join(' ')]
            })
        }
        //debug({ emails, ret })
        const sn = 2,
            r = ret.filter(this.filter).sort((a, b) => a[sn].toLowerCase().localeCompare(b[sn].toLowerCase())),
            v = this.q('#n')
        this.rows = rs
        if (v) v.innerHTML = `${r.length} (${this.rows.length})`
        debug({ rows: this.rows })
        return r
    }
    input = (e, o) => {
        this.f = this.getForm()
        this.reload('emails')
    }
    color = (email, e) => {
        if (e.fi.unsub) return `<span class="red">${email}</span>`
        else if (e.fi.bounce) return `<span class="amber">${email}</span>`
        else return email
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
        const d = nav.d.data, emails = d && d.emails
        this.u = emails && emails[param]
        debug({ Email: this })
    }
    form = () => {
        return { // section and options populated on load
            name: { placeholder: 'name', width: '50rem', value: this.u.first || '' },
            jetstream: {
                label: 'Jetstream', class: 'bold', tip: 'Jetstream member', value: this.u.fi.jetstream ? true : false
            },
            unsub: { class: 'bold red', label: 'Unsub', tip: 'unsubscribe', value: this.u.unsub ? true : false }
        }
    }
    html = () => {
        return `<div class="card fit">
                <div class="card-header">
                {link.close.×}
                    <span class="title">${this.name}</span>
                </div>
                <div class="card-body">
                {input.name}<br />
                {checkbox.jetstream} {checkbox.unsub}
                </div>`
    }
    close = () => {
        this.popup.close()
        debug({ close: this })
        this.p.reload("emails")
    }
    input = (e, o) => {
        const f = this.getForm()
        if (o.name === 'name') this.u.first = f.name
        else if (o.name === 'unsub') {
            if (f.unsub) {
                if (!this.u.unsub) this.u.unsub = []
                this.u.unsub.push(new Date().toISOString())
            }
            else if (this.u.unsub) delete this.u.unsub
        }
        else if (o.name === 'jetstream') {
            if (f.jetstream) {
                if (!this.u.fi.jetstream) this.u.fi.jetstream = 'jetstream'
            }
            else if (this.u.fi.jetstream) delete this.u.fi.jetstream
        }
        debug({ input: o, f, u: this.u })
    }
}

class Send extends Html {
    constructor(p, name, param) {
        super(p, name, param)
        const d = nav.d.data, ml = d && d.mailLog
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
            const d = nav.d.data, ml = d && d.mailLog
            this.m = ml && ml[f.load]
            this.fe('subject', this.m.subject)
            this.fe('message', this.m.message)
        }
        debug({ input: o, f })
    }
    send = (l) => {
        const fm = this.getForm(), live = l === true, rows = live ? this.p.rows : this.p.rows.slice(0, 20),
            d = nav.d.data, emails = d.emails,
            list = rows.map(email => (emails[email] && { to: { name: emails[email].first, email } })).filter(r => r),
            { subject, message, unsub, time } = fm
        if (list.length) ajax({ req: 'bulksend', subject, message, unsub, time, list, live }).then(r => {
            if (r.mailLog) nav.d.saveZip('mailLog', r.mailLog)
            this.p.ml()
            this.p.reload('emails')
            debug({ r })
        }).catch(e => this.error(e, o))
    }
}

export default AdminEmail