import Html, { debug, nav, _s } from './Html'
import select from './html/select.html'
import selectV from './html/selectV.html'
import { roles, sections } from './roles'
import { ajax } from './ajax'

const year = 2024
class Vselect extends Html {
    constructor(p, name) {
        super(p, name)
        this.id = 'vselect'
    }
    form = () => {
        return {
            name: { placeholder: 'name', width: '50rem' },
            new: { class: "form green hidden", popup: 'Vol' }
        }
    }
    link = (name, param) => {
        if (name === 'close') return { class: 'close', tip: 'close', click: () => this.popup.close() }
        else if (name === 'new') return { tip: 'check existing first' }
        else if (name === 'request') return { tip: 'click to request', click: this.request }
        else if (name.charAt(0) === '_') return { theme: 'light', tip: () => this.tip(name.substring(1)), click: () => this.setid(name.substring(1)) }
    }
    html = (n, p) => {
        //debug({ html: this, n, p })
        if (n === 'names') return this.vol_names()
        else if (!p) {
            if (nav.d.admin()) return select
            else return selectV
        }
    }
    request = () => {
        const { name } = this,
            [, aj, s, r] = name.match(/([sajf])_(\d{1,2})r_(\d{1,2})/),
            sec = sections[s], rs = roles(sec), role = rs[r],
            t = { a: 'Adult', j: 'Junior', s: '', f: '' }
        const data = { subject: 'Role Request', message: `Request: ${t[aj]}, ${sec}, ${role}`, to: 52 }
        req({ req: 'send', data })
            .then(r => this.confirm(r))
            .catch(e => this.error(e))
    }
    confirm = (r) => {
        this.innerHTML = '<div class="message">Role Requested</div>'
        setTimeout(this.popup.close, 3000)
    }
    error = (e) => {
        debug({ e })
        this.innerHTML = `<div class="message error">Request Error</div>`
        setTimeout(this.popup.close, 3000)
    }
    var = (n) => {
        const name = this.name
        if (n === 'title') {
            if (!name) {
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
    nameSort = (a, b) => {
        const { last: al, first: af } = firstLast(a.name), { last: bl, first: bf } = firstLast(b.name)
        if (al < bl) return -1
        if (al > bl) return 1
        if (af < bf) return -1
        if (af > bf) return 1
        return 0
    }
    rendered = () => {
        const vs = nav.d.data.vs
        this._form = this.getForm()
    }
    filter = () => {
        const f = this._form, filter = f && (this._name = f.name), vs = nav.d.data.vs
        if (filter) {
            return Object.keys(vs).filter(id => vs[id].name.toLowerCase().indexOf(filter.toLowerCase()) > -1)
                .map(id => ({ id, name: vs[id].name }))
        }
        else if (nav.path === 'volunteer') {
            return Object.keys(vs).filter(id => {
                const v = vs[id], y = v && v.year, vy = y && y[year]
                return vy && ((vy.adult && (!vy.arole || vy.arole === 'Role')) || (vy.junior && (!vy.jrole || vy.jrole === 'Role')))
            })
                .map(id => ({ id, name: vs[id].name }))
        }
        else return []
    }
    vol_names = () => {
        const vols = this.filter()
            .sort(this.nameSort),
            html = vols.slice(0, 10).map(v => `<div>{link._${v.id}.${_s(v.name)}}</div>`)
                .join(' ')
        if (this._name && vols.length === 0) {
            const b = this.fe("new")
            b.classList.remove('hidden')
        }
        return `<div id="names">${html}</div>`
    }
    tip = (id) => this.p._p('tip')(id)
    setid = (id) => {
        const name = this.name,
            [, aj, s, r] = name.match(/([sajf])_(\d{1,2})r_(\d{1,2})/),
            sec = sections[s], rs = roles(sec), role = rs[r],
            vs = nav.d.data.vs,
            v = vs && vs[id]
        const vy = v.year[year] || {}
        if (aj !== 'a') { vy.jsection = sec, vy.jrole = role, vy.junior = true, vy.none = false }
        if (aj !== 'j') { vy.asection = sec, vy.arole = role, vy.adult = true, vy.none = false }
        ajax({ req: 'save', vol: v.id, year, roles: vy }).then(r => {
            nav.d.saveZip({ vs: r.vs })
            this.p.reload()
            this.popup.close('updated')
        }).catch(e => debug({ e }))
    }
    input = () => {
        this._form = this.getForm()
        this.reload('names')
    }
}
export default Vselect