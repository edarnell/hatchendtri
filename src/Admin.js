import Html, { debug, page, _s } from './Html'
import { zip } from './unzip'
import { req } from './data'
import { csv } from './csv'
import html from './html/Admin.html'

const form = { // section and options populated on load
    filter: { placeholder: 'name filter', width: '50rem' },
    C: { class: 'hidden form red bold', tip: 'clear name', submit: true },
    Save: { class: 'form red', tip: 'save ids' },
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
    link = (o) => {
        const { name, param } = o.attr(), id = name.substring(1)
        if (param) {
            debug({ param, f: this.fs[id] })
        }
        return { tip: page.ids[id] }
    }
    ths = (o) => {
        const { name, param } = o.attr()
        if (name === 'users') return ['id', 'first', 'last', 'gender', 'cat', 'club', 'email', 'phone']
    }
    trs = (o) => {
        const { name, param } = o.attr()
        this._table = o
        if (page.cs) return Object.values(page.cs).map(r => [r.id, r.first, r.last, r.gender, r.cat, r.club, r.email, r.phone])
        else return []
    }
    save = (e, o) => {
        req({ req: 'save', files: { cs: page.cs } }).then(r => debug({ r }))
    }
    form = (o) => {
        const { name, param } = o.attr()
        if (form[name]) return form[name]
    }
    filter = (id) => {
    }
    update = (e, o) => {
        const { name, param } = o.attr()
        debug({ 'update': this.rows, o: o.attr(), e })
    }

}

export default Admin