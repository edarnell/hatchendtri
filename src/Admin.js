import Html, { debug, page, _s } from './Html'
import { req } from './data'
import { lists, merge } from './lists'
import { csv } from './csv'
import html from './html/Admin.html'
import { firstLast } from './roles'

const form = { // section and options populated on load
    list: { options: ['v2023', 'm2023', 'c2023', 'prev', 'bounce', 'unsub'] },
    subject: { placeholder: 'subject' },
    message: { placeholder: 'message' },
    filter: { placeholder: 'name filter', width: '50rem' },
    C: { class: 'hidden form red bold', tip: 'clear name', submit: true },
    Save: { class: 'form red', tip: 'save cs', popup: '<div class="message">saving.</div>' },
    Send: { class: 'form red', popup: '<div class="message">sending.</div>' },
    Test: { class: 'form red', popup: '<div class="message">sending test.</div>' },
}

class Admin extends Html {
    constructor() {
        super()
        if (!nav.admin(true)) nav.nav('home')
        else {
            this.data = 'vs_'
            form.Send.tip = form.Test.tip = this.tip
            form.Save.click = this.save
            form.Send.click = this.send
            form.Test.click = this.test
        }
    }
    listen = () => {
        if (nav.admin(true)) this.lists()
    }
    tip = () => `${this._rows ? this._rows.length : 0} emails`
    lists = () => {
        const files = ['MCu.csv', 'MCc.csv', '2023C.csv', '2022C.csv', '2022W.csv', '2019C.csv', '2018C.csv', '2017C.csv']
        req({ req: 'files', files }).then(r => {
            const ls = lists(r, true), vs = page.vs_, done = {}
            this.unsub = merge(done, ls['MCu.csv'])
            this.bounce = merge(done, ls['MCc.csv'])
            const v2023 = {}, n2023 = {}, m2023 = {}
            Object.values(vs).forEach(v => {
                const e = v.year && v.email && v.email.toLowerCase(), y23 = e && !done[e] && v.year[2023],
                    vy = y23 && (y23.adult || y23.junior), vn = y23 && y23.none, ym = e && !done[e] && !vy && !vn
                if (vy) v2023[e] = v2023[e] ? v2023[e].concat(v) : [v]
                else if (ym) m2023[e] = m2023[e] ? m2023[e].concat(v) : [v]
            })
            this.v2023 = v2023
            this.m2023 = m2023
            page.cs = csv(r.zips['2023C.csv']) // for save
            this.c2023 = ls['2023C.csv']
            merge(done, ls['2023C.csv'])
            this.prev = merge(done, { ...ls['2017C.csv'], ...ls['2018C.csv'], ...ls['2019C.csv'], ...ls['2022W.csv'], ...ls['2022C.csv'] })
            this._table.setAttribute('param', 'update')
        })
    }
    test = (e, o) => {
        this.send(e, o, true)
    }
    send = (e, o, testing) => {
        const f = this.getForm(form), rows = testing ? this._rows.slice(0, 20) : this._rows,
            list = rows.map(r => ({ to: { name: r[0], email: r[2] } }))
        req({ req: 'bulksend', subject: f.subject, message: f.message, list, live: !testing }).then(r => {
            o.innerHTML = `<div class="message">${rows.length} emails sent.</div>`
            setTimeout(o.close, 3000)
        }).catch(e => this.error(e, o))
    }
    save = (e, o) => {
        req({ req: 'save', files: { cs: page.cs } }).then(r => {
            o.innerHTML = `<div class="message">competitors saved.</div>`
            setTimeout(o.close, 3000)
        }).catch(e => this.error(e, o))
    }
    error = (e, o) => {
        debug({ e })
        o.innerHTML = `<div class="message error">Error</div>`
        setTimeout(o.close, 3000)
    }
    html = (o) => {
        const p = o && o.attr(), name = p && p.name
        if (!o) return html
    }
    ths = (o) => {
        const { name, param } = o.attr()
        if (name === 'users') return ['first', 'last', 'email']
    }
    mergeNames = (rs) => {
        let first = '', last = ''
        rs.forEach(r => {
            const { first: f, last: l } = r.name ? firstLast(r.name) : r,
                firstL = first.toLowerCase(), fl = f && f.trim().toLowerCase()
            if (f && !firstL.includes(fl)) first += (first ? ', ' : '') + f.trim()
            if (l && !last) last = l.trim()
        })
        return { first, last }
    }
    trs = (o) => {
        const { name, param } = o.attr(), f = this.getForm(form),
            rs = this[f.list]
        this._table = o
        this._rows = []
        if (rs) this._rows = Object.values(rs).map(r => {
            const { first, last } = this.mergeNames(r)
            return [first, last, r[0].email]
        }).filter(r => this.filter(r, f.filter)).sort((a, b) => a[1] > b[1] ? 1 : -1)
        return this._rows
    }
    filter = (r, fs) => {
        const name = r[0] + ' ' + r[1], email = r[2]
        let ret
        if (name.includes("�")) return false
        else if (!fs) ret = true
        fs.split(',').forEach(f => ret = ret || name.toLowerCase().includes(f.toLowerCase())
            || email.toLowerCase().includes(f.toLowerCase())
        )
        return ret
    }
    form = (o) => {
        const { name, param } = o.attr()
        if (form[name]) return form[name]
    }
    update = (e, o) => {
        const { name, param } = o.attr()
        this._table.setAttribute('param', 'update')
    }

}

export default Admin