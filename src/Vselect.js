import Html, { error, debug, nav, _s } from './Html'
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
            new: { class: "form green hidden", popup: `{Vol.n}` }
        }
    }
    link = (n) => {
        if (n === 'close') return { class: 'close', tip: 'close', click: () => this.close() }
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
            .then(r => this.close('Role Requested'))
            .catch(e => {
                error({ e })
                this.close('<div class="red">Error</div>')
            })
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
        const vs = nav.d.data.vs
        const { last: al, first: af } = vs[a], { last: bl, first: bf } = vs[b]
        if (al < bl) return -1
        if (al > bl) return 1
        if (af < bf) return -1
        if (af > bf) return 1
        return 0
    }
    filter = (id) => {
        const f = this._form, d = nav.d.data, v = d.vs[id], vr = d.vr[id]
        if (f && f.name) {
            const name = v.first + ' ' + v.last
            return name.toLowerCase().indexOf(f.name.toLowerCase()) > -1
        }
        else return vr && ((vr.adult && (!vr.arole || vr.arole === 'Role')) || (vr.junior && (!vr.jrole || vr.jrole === 'Role')))
    }
    vol_names = () => {
        const d = nav.d.data, vs = d.vs,
            vols = Object.keys(d.vr).filter(this.filter).sort(this.nameSort),
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
            d = nav.d.data, v = d.vs[id], vy = d.vr[id] || {}
        if (aj !== 'j') {
            vy.adult = true
            vy.asection = sec
            vy.arole = role
        }
        if (aj !== 'a') {
            vy.junior = true
            vy.jsection = sec
            vy.jrole = role
        }
        ajax({ req: 'save', v, roles: vy }).then(r => {
            this.close('<div class="green">updated</div>', 'vs')
        }).catch(e => {
            error({ e })
            this.close('<div class="red">Error</div>')
        })
    }
    input = () => {
        this._form = this.getForm()
        this.reload('names')
    }
}
export default Vselect