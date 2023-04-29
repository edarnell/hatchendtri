import Html, { debug, page, _s } from './Html'
import { zip } from './unzip'
import { req } from './data'
import { csv } from './csv'
import { unsub } from './unsub'
import html from './html/Admin.html'
import { firstLast } from './roles'

const form = { // section and options populated on load
    filter: { placeholder: 'name filter', width: '50rem' },
    C: { class: 'hidden form red bold', tip: 'clear name', submit: true },
    Save: { class: 'form red', tip: 'save ids' },
    Send: { class: 'form red', tip: 'send emails', popup: '{contact.list}' },
}

class Admin extends Html {
    constructor() {
        super()
        this.data = 'vs_'
        form.Save.click = this.save
    }
    unsub = () => {
        const files = ['MCu.csv', 'MCc.csv']
        req({ req: 'files', files }).then(r => {
            this.unsub = unsub(r)
            this._table.setAttribute('param', 'update')
        })
    }
    listen = () => {
        // make 5 de-dupe groups - vol can, vol can't, vol unknown, comp 2023, comp other
        // group sizes, messages, test send
        this.unsub()
        //page.cs = csv(page['2023C'])
        //const files = ['MCu.csv', 'MCc.csv']
        //['2023C.csv', '2022C.csv', '2022W.csv', '2019C.csv', '2018C.csv', '2017C.csv']
        //req({ req: 'files', files }).then(r => debug(r))

    }
    html = (o) => {
        const p = o && o.attr(), name = p && p.name
        if (!o) return html
    }
    ths = (o) => {
        const { name, param } = o.attr()
        if (name === 'users') return ['ticks', 'name', 'email']
    }
    list = (o) => {
        return this._rows
    }
    trs = (o) => {
        const { name, param } = o.attr(), rs = page.vs_
        this._table = o
        this._rows = []
        if (rs) this._rows = Object.values(rs).filter(r => this.filter(r)).map(r => {
            const { first, last } = firstLast(r.name)
            return [r.id, first, last, r.email]
        })
        return this._rows
    }
    filter = (c) => {
        const fm = this.getForm(form), fi = fm && fm.filter, fs = fi && fi.split(",")
        let r = c.email && !this.unsub[c.email.toLowerCase()]
        if (!r) debug({ unsub: c })
        if (fi) {
            r = false
            Object.values(c).forEach(v => {
                const s = v + '' // number to string
                fs.forEach(f => {
                    if (f && s.toLowerCase().includes(f.toLowerCase())) r = true
                })
            })
        }
        //debug({ filter: r, c, fi, fs })
        return r
    }
    save = (e, o) => {
        req({ req: 'save', files: { cs: page.cs } }).then(r => debug({ r }))
    }
    form = (o) => {
        const { name, param } = o.attr()
        if (form[name]) return form[name]
    }
    update = (e, o) => {
        const { name, param } = o.attr()
        debug({ 'update': o.attr(), e })
        this._table.setAttribute('param', 'update')
    }

}

export default Admin