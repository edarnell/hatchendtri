import Html, { debug, page, _s } from './Html'
import { zip } from './unzip'
import { req } from './data'
import { csv } from './csv'
import html from './html/Admin.html'

const form = { // section and options populated on load
    filter: { placeholder: 'name filter', width: '50rem' },
    C: { class: 'hidden form red bold', tip: 'clear name', submit: true },
    Save: { class: 'form red', tip: 'save ids' },
    Send: { class: 'form red', tip: 'save emails', popup: '{contact.list}' },
}

class Admin extends Html {
    constructor() {
        super()
        this.data = '2023C'
        form.Save.click = this.save
    }
    listen = () => {
        page.cs = csv(page['2023C'])
        this._table.setAttribute('param', 'update')
    }
    html = (o) => {
        const p = o && o.attr(), name = p && p.name
        if (!o) return html
    }
    ths = (o) => {
        const { name, param } = o.attr()
        if (name === 'users') return ['id', 'first', 'last', 'gender', 'cat', 'club', 'email', 'phone']
    }
    trs = (o) => {
        const { name, param } = o.attr(), cs = page.cs
        debug({ trs: name, param })
        this._table = o
        if (page.cs) return Object.values(page.cs).filter(c => this.filter(c)).map(r => [r.id, r.first, r.last, r.gender, r.cat, r.club, r.email, r.phone])
        else return []
    }
    filter = (c) => {
        const fm = this.getForm(form), fi = fm && fm.filter, fs = fi && fi.split(",")
        let r = true
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