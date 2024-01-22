import Html, { error, debug, nav, _s } from './Html'
import select from './html/select.html'
import selectV from './html/selectV.html'
import { roles, sections } from './roles'
import { ajax } from './ajax'

function clear(id, aj, sec, role, ys) {
    vr = nav.d.data.vr
    if (!id) {
        Object.keys(vr).forEach(id => {
            const r = clear(id, aj, sec, role)
            if (r) ys.push(r)
        })
        return ys
    }
    let ret
    if (aj !== 'a' && aj !== 'j') {
        let r1 = clear(id, 'a', sec, role), r2 = clear(id, 'j', sec, role)
        ret = r2 || r1
    }
    else {
        const r = vr[id]
        if (r && r[aj + 'section'] === sec && r[aj + 'role'] === role) {
            r[aj + 'section'] = '', r[aj + 'role'] = ''
            ret = { id, r }
        }
        else ret = false
    }
    return ret
}

const year = 2024
class Vselect extends Html {
    constructor(p, name) {
        super(p, name)
        this.id = 'vselect'
        this.vs = this.vNames()
    }
    form = () => {
        return {
            name: { placeholder: 'name', width: '50rem' },
            new: { class: "form green hidden", popup: 'Vol' }
        }
    }
    link = (n) => {
        if (n === 'close') return { class: 'close', tip: 'close', click: () => this.popup.close() }
        else if (n === 'new') return { tip: 'check existing first' }
        else if (n === 'request') return { tip: 'click to request', click: this.request }
        else if (n.charAt(0) === '_') return { theme: 'light', tip: () => this.tip(n.substring(1)), click: () => this.setid(n.substring(1)) }
    }
    html = (n, p) => {
        //debug({ html: this, n, p })
        if (n === 'names') return this.vol_names()
        else if (!p) {
            if (nav._user.admin) return select
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
        const vs = this._vs
        const { last: al, first: af } = vs[a], { last: bl, first: bf } = vs[b]
        if (al < bl) return -1
        if (al > bl) return 1
        if (af < bf) return -1
        if (af > bf) return 1
        return 0
    }
    filter = (id) => {
        const f = this._form, vs = this._vs, v = vs[id], y = v && v.year, vy = y && y[year]
        if (f && f.name) {
            const name = v.first + ' ' + v.last
            return name.toLowerCase().indexOf(f.name.toLowerCase()) > -1
        }
        else return vy && ((vy.adult && (!vy.arole || vy.arole === 'Role')) || (vy.junior && (!vy.jrole || vy.jrole === 'Role')))
    }
    vNames = () => {
        const vs = nav.d.data.vs, es = nav.d.data.es, ns = {}
        Object.keys(vs).filter(id => vs[id].i).forEach(id => {
            ns[id] = vs[id]
            const v = ns[id], u = es[v.i]
            v.first = v.first || u.first
            v.last = v.last || u.last
        })
        this._vs = ns
    }
    vol_names = () => {
        const vs = this._vs,
            vols = Object.keys(vs).filter(this.filter).sort(this.nameSort),
            html = vols.slice(0, 10).map(id => `<div>{link._${id}.${_s(vs[id].first)}_${_s(vs[id].last)}}</div>`)
                .join(' ')
        const f = this._form, name = f && f.name
        if (name && vols.length === 0) {
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
            vs = this._vs,
            ys = []
        clear(null, aj, sec, role, ys)
        const v = vs && vs[id], vy = v.year[year] || {}
        if (aj !== 'a') { vy.jsection = sec, vy.jrole = role, vy.junior = true, vy.none = false }
        if (aj !== 'j') { vy.asection = sec, vy.arole = role, vy.adult = true, vy.none = false }
        ajax({ req: 'save', vol: v.id, year, roles: vy, ys }).then(r => {
            this.popup.close('<div class="green">updated</div>', 'vs')
        }).catch(e => {
            error({ e })
            this.popup.close('<div class="red">Error</div>')
        })
    }
    input = () => {
        this._form = this.getForm()
        this.reload('names')
    }
}
export { clear }
export default Vselect