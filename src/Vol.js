import Html, { debug, nav, _s, error } from './Html'
import { sections, roles, selectSection, selectRole } from './roles'
import html from './html/Vol.html'
import volD from './html/volD.html'
import volE from './html/volE.html'
import { ajax } from './ajax'
import { name } from './Volunteer'

const year = 2024

const roleForm = { // section and options populated on load
    adult: { class: 'bold', label: 'Adult', tip: 'available for adult race' },
    junior: { class: 'bold', label: 'Junior', tip: 'available for junior race' },
    none: { class: 'bold', label: 'None', tip: `not available in ${year}` },
    asection: { class: "form hidden", options: ['Section'].concat(sections) },
    arole: { class: "form hidden", options: ['Role'].concat(roles()) },
    jsection: { class: "form hidden", options: ['Section'].concat(sections) },
    jrole: { class: "form hidden", options: ['Role'].concat(roles()) },
    notes: { placeholder: 'role preference?', rows: 1, cols: 20 }
}

const volForm = { // section and options populated on load
    first: { placeholder: 'first name', width: '50rem' },
    last: { placeholder: 'last name', width: '50rem' },
    email: { placeholder: 'email', type: 'email', width: '50rem' },
    mobile: { placeholder: 'mobile', type: 'tel', width: '50rem' },
    notes: { placeholder: 'notes', rows: 1, cols: 20 }
}


class Vol extends Html {
    constructor(p, n) {
        super(p, n)
        const vs = nav.d.data.vs
        if (n === 'n') this.v = this.user()
        else this.v = (vs && vs[this.n]) || { id: 0 }
    }
    user = () => {
        const u = nav._user, vs = nav.d.data.vs, vi = Object.values(vs).filter(v => v.i == u.i)
        return vi.length ? vi[0] : { id: -1, i: u.i }
    }
    form = () => {
        if (this.edit) return volForm
        else return roleForm
    }
    html = (n) => {
        if (n === 'vol') return `<div id="vol">${this.edit ? volD : volE}</div>`
        else return html
    }
    var = (n) => {
        if (n === 'name') {
            const v = this.v, fl = v && v.id > 0 && name(v.id, true), es = nav.d.data.es, u = es && es[v.i]
            if (fl) return `{link.details.${fl.first + '_' + fl.last}_}`
            return u ? `{link.details.${u.first + '_' + u.last}_}` : 'New'
        }
        else if (n === 'admin') return nav.d.admin() ? '{checkbox.admin}' : ''
    }
    link = (name) => {
        if (name === 'details') return { tip: this.edit ? 'save' : 'edit contact details', icon_: this.edit ? 'save' : 'edit', click: this.details }
        else if (name === 'close') return { class: 'close', tip: 'save and close', click: this.edit ? this.details : this.save }
    }
    rendered = () => {
        //debug({ vol: this.v })
        if (this.edit) this.setForm(this.v)
        else this.updateV()
    }
    send = () => {
        const f = this.getForm(email)
        if (f.subject && f.message) req({ req: 'send', subject: f.subject, message: f.message, to: this.v.id }).then(r => {
            this.innerHTML = '<div class="tooltip">Message sent</div>'
            setTimeout(this.tt.close, 1000)
        })
    }
    details = (o) => {
        if (!this.edit) ajax({ req: 'vol', vol: this.v.id }).then(r => {
            const id = this.v.id, v = this.v = r.vol
            v.id = id // restore id if missing
            this.edit = true
            this.reload()
        })
        else {
            const v = this.v, f = this.getForm()
            let upd = false
            Object.keys(volForm).forEach(k => {
                if (v[k] !== f[k]) {
                    upd = true
                    v[k] = f[k]
                }
            })
            if (upd) ajax({ req: 'save', vol: this.v.id, details: f }).then(r => {
                this.edit = false
                nav.d.saveZip('vs', r.vs)
                if (this.v.id < 0) {
                    this.v = r.v
                    this.name = r.v.id
                    nav._user.vol = { [r.v.id]: r.v }
                }
                this.reload()
            })
            else {
                this.edit = false
                this.reload()
            }
        }
    }
    updateV = () => {
        const v = this.v
        if (v.id === 0) {
            this.edit = true
        }
        else {
            const y = this.v.year, vy = (y && y[year])
            if (vy) {
                if (vy.none) this.fe('none').checked = true
                else {
                    if (vy.adult) {
                        this.fe('adult').checked = true
                        this.fe('asection').value = vy.asection
                        this.fe('arole').value = vy.arole
                    }
                    if (vy.junior) {
                        this.fe('junior').checked = true
                        this.fe('jsection').value = vy.jsection
                        this.fe('jrole').value = vy.jrole
                    }
                }
                if (vy.notes) this.fe('notes').value = vy.notes
                this.hidden()
            }
        }
    }
    hidden = (race) => {
        if (!race) {
            this.hidden('adult')
            this.hidden('junior')
            this.hidden('none')
            return
        }
        const a = this.fe('adult'),
            j = this.fe('junior'),
            n = this.fe('none'),
            as = this.fe('asection'),
            ar = this.fe('arole'),
            js = this.fe('jsection'),
            jr = this.fe('jrole')
        if (race === 'none' && n.checked) {
            a.checked = false
            j.checked = false
            as.classList.add('hidden')
            js.classList.add('hidden')
            ar.classList.add('hidden')
            jr.classList.add('hidden')
            selectSection(this, 'asection', 'arole')
            selectSection(this, 'jsection', 'jrole')
        }
        else if (race === 'adult' || race === 'junior') {
            const x = race === 'adult' ? a : j,
                s = race === 'adult' ? as : js,
                r = race === 'adult' ? ar : jr,
                c = race.charAt(0)
            if (x.checked) {
                n.checked = false
                if (nav.d.admin()) {
                    s.classList.remove('hidden')
                    r.classList.remove('hidden')
                }
            }
            else {
                s.classList.add('hidden')
                r.classList.add('hidden')
                selectSection(this, c + 'section', c + 'role')
            }
        }
    }
    roleRem = (r) => {
        ['asection', 'arole', 'jsection', 'jrole'].forEach(k => {
            if (r[k] === 'Section' || r[k] === 'Role') r[k] = '' // remove default values
        })
        return r
    }
    close = (m, p) => {
        if (this.popup.close) this.popup.close(m, p)
        else {
            this.p.popclose('vol_avail', m, p)
            this.p.updated()
        }
    }
    save = () => {
        debug({ save: this })
        const r24 = this.roleRem(this.getForm()), v = this.v,
            roles = (JSON.stringify(r24) !== JSON.stringify(v.year && v.year[year])) && r24
        if (roles) ajax({ req: 'save', vol: this.v.id, year, roles }).then(r => {
            debug({ save: this, year, roles, r })
            nav.d.saveZip('vs', r.vs)
            this.close('updated', { vol: r.v })
        }).catch(e => {
            error({ save: e })
            this.close('<div class="red">Error</div>')
        })
        else this.close('unchanged')
    }
    input = (e, o) => {
        const name = o.name
        if (name === 'asection' || name === 'jsection') selectSection(this, name, name.charAt(0) + 'role')
        else if (name === 'arole' || name === 'jrole') selectRole(this, name.charAt(0) + 'section', name)
        else if (name === 'adult' || name === 'junior' || name === 'none') this.hidden(name)
    }
}
export default Vol