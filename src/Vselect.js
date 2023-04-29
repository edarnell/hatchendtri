import Html, { debug, page, _s } from './Html'
import select from './html/select.html'
import selectV from './html/selectV.html'
import { firstLast } from './Volunteer'
import { roles, sections } from './roles'
import { req } from './data'

const form = {
    name: { placeholder: 'name', width: '50rem' },
    volunteer: { class: "form", options: ['Select'] },
    new: { class: "form green hidden", popup: '{vol.new}' }
}

class Vselect extends Html {
    constructor() {
        super()
        this.popup = true
        this.data = 'vs'
    }
    link = (o) => {
        const { name, param } = o.attr()
        if (name === 'close') return { class: 'close', tip: 'close', click: this.tt.close }
        else if (name === 'new') return { tip: 'check existing first' }
        else if (name.charAt(0) === '_') return { theme: 'light', tip: this.tip, click: this.setid }
    }
    close = () => {
        this.tt.close()
    }
    var = (o) => {
        const { name, param } = o.attr()
        if (name === 'title') {
            const { name, param } = this.attr()
            debug({ title: { name, param } })
            if (name === 'new') {
                return "{link.new.New_Volunteer}"
            }
            else {
                const m = name.match(/([sajf])_(\d{1,2})r_(\d{1,2})/),
                    [, aj, s, r] = m || [],
                    sec = sections[s], rs = roles(sec), role = rs[r],
                    t = { a: 'Adult ', j: 'Junior ', s: '', f: '' }
                if (!m) debug({ m, aj, s, r, sec, rs, role, t })
                return m ? t[aj] + role : '?'
            }
        }
    }
    html = (o) => {
        if (!o) {
            if (nav.admin()) return adminSel
            else return userSel
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
        const f = this.getForm(form), filter = this._name = f.name
        if (filter) {
            const vs = page.vs
            return Object.keys(vs).filter(id => vs[id].name.toLowerCase().indexOf(filter.toLowerCase()) > -1)
                .map(id => ({ id, name: vs[id].name }))
        }
        else if (page._page === 'volunteer') {
            const vs = page.vs
            return Object.keys(vs).filter(id => {
                const vy = vs[id].year[2023]
                return vy && ((vy.adult && !vy.arole) || (vy.junior && !vy.jrole))
            })
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
        if (this._name && vols.length === 0) {
            const b = this.querySelector("button[name=new]")
            b.classList.remove('hidden')
            b.setAttribute('data-param', this._name)
        }
        return html
    }
    tip = (e, o) => page.firstChild.tip(null, o)
    setid = (e, o) => {
        const { name, param } = this.attr(),
            [, aj, s, r] = name.match(/([sajf])_(\d{1,2})r_(\d{1,2})/),
            sec = sections[s], rs = roles(sec), role = rs[r],
            { name: oname, param: oparam } = o.attr(), vid = oname.substring(1),
            v = page.vs[vid]
        const vy = v.year[2023] = v.year[2023] || {}
        if (aj !== 'a') { vy.jsection = sec, vy.jrole = role, vy.junior = true, vy.none = false }
        if (aj !== 'j') { vy.asection = sec, vy.arole = role, vy.adult = true, vy.none = false }
        req({ req: 'save', vol: v.id, roles: vy }).then(r => {
            this.tt.close()
        }).catch(e => debug({ e }))
    }
    update = (e, o) => {
        const { name, param, type } = o.attr()
        if (name === 'name') this._vol_names.setAttribute('param', 'update')
    }
}
export default Vselect