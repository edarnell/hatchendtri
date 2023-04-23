import Html, { debug, page, _s } from './Html'
import { send } from './data'
import user from './html/user.html'
import login from './html/login.html'
import { firstLast } from './Volunteer'

const form = {
    name: { placeholder: 'name', width: '50rem' },
    volunteer: { class: "form", options: ['Select'] },
    select: { class: 'form primary hidden', tip: 'send login email', submit: true }
}

class User extends Html {
    constructor() {
        super()
        this.popup = true
        this.data = 'volunteers'
    }
    html = (o) => {
        if (!o) {
            const token = localStorage.getItem('token')
            if (token) return user
            else return login
        }
        else return this.vol_names(o)
    }
    form = (o) => {
        const { name, param } = o.attr()
        return form[name]
    }
    nameSort = (a, b) => {
        const { last: al, first: af } = firstLast(a.name), { last: bl, first: bf } = firstLast(b.name)
        if (al < bl) return -1
        if (al > bl) return 1
        if (af < bf) return -1
        if (af > bf) return 1
        return 0
    }
    filter = () => {
        const f = this.getForm(form), filter = f.name
        if (filter) {
            const vs = page.volunteers
            return Object.keys(vs).filter(id => vs[id].name.toLowerCase().indexOf(filter.toLowerCase()) > -1)
                .map(id => ({ id, name: vs[id].name }))
        }
        else if (page._page === 'volunteer') {
            const vs = page.v2023
            return Object.keys(vs).filter(id =>
                ((vs[id].a2023 && !vs[id].arole) || (vs[id].j2023 && !vs[id].jrole)))
                .map(id => ({ id, name: vs[id].name }))
        }
        else return []
    }
    vol_names = (o) => {
        const vols = this.filter()
            .sort(this.nameSort),
            html = vols.slice(0, 10).map(v => `<div>{link._${v.id}.${_s(v.name)}}</div>`)
                .join(' ')
        this._vol_names = o
        return html
    }
    tip = (e, o) => {
        const { name } = o.attr(), id = name.substring(1), v = page.v2023[id]
        return page.firstChild.vtip(v)
    }
    link = (o) => {
        const { name, param } = o.attr()
        if (name === 'close') return { class: 'close', tip: 'close', click: this.tt.close }
        else if (name.charAt(0) === '_') return { theme: 'light', tip: this.tip, click: this.setid }
    }
    save = () => {

    }
    update = (e, o) => {
        const { name, param, type } = o.attr()
        if (name === 'name') this._vol_names.setAttribute('param', 'update')
    }
}
export default User