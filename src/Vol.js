import Html, { debug, nav, _s } from './Html'
import { sections, roles, selectSection, selectRole } from './roles'
import html from './html/Vol.html'
import volD from './html/volD.html'
import volE from './html/volE.html'
import { ajax } from './ajax'

const year = 2024

const roleForm = { // section and options populated on load
    adult: { class: 'bold', label: 'Adult', tip: 'available for adult race' },
    junior: { class: 'bold', label: 'Junior', tip: 'available for junior race' },
    none: { class: 'bold', label: 'None', tip: `not available in ${year}` },
    asection: { class: "form hidden", options: ['Section'].concat(sections) },
    arole: { class: "form hidden", options: ['Role'].concat(roles()) },
    jsection: { class: "form hidden", options: ['Section'].concat(sections) },
    jrole: { class: "form hidden", options: ['Role'].concat(roles()) },
    notes: { placeholder: 'notes', rows: 1, cols: 20 }
}

const volForm = { // section and options populated on load
    name: { placeholder: 'name', width: '50rem' },
    email: { placeholder: 'email', type: 'email', width: '50rem' },
    mobile: { placeholder: 'mobile', type: 'tel', width: '50rem' },
    notes: { placeholder: 'notes', rows: 1, cols: 20 },
    unsub: { class: 'bold red', label: 'Unsub', tip: 'Warning - remove completely. Consider role "none" instead.' },
    admin: { class: 'bold red hidden', label: 'Admin', tip: 'Warning - admin rights' }
}


class Vol extends Html {
    constructor(p, name) {
        super(p, name)
        const vs = nav.d.data.vs
        this.v = (vs && vs[this.name]) || { id: 0 }
    }
    form = () => {
        if (this.edit) return volForm
        else return roleForm
    }
    html = (n) => {
        if (n === 'volD') return this.edit ? volD : ''
        else if (n === 'volE') return this.edit ? '' : volE
        else return html
    }
    var = (n) => {
        const v = this.v
        if (n === 'name') return v.id ? `{link.details.${_s(v.name)}_}` : 'New'
        else if (n === 'admin') return nav.d.admin() ? '{checkbox.admin}' : ''
    }
    link = (name) => {
        if (name === 'details') return { tip: this.edit ? 'save' : 'edit contact details', icon_: this.edit ? 'save' : 'edit', click: this.details }
        else if (name === 'close') return { class: 'close', tip: 'save and close', click: this.edit ? this.details : this.save }
    }
    rendered = () => {
        debug({ vol: this.v })
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
            debug({ r })
            const id = this.v.id, v = r.vol
            v.id = id // restore id if missing
            this.edit = true
            this.reload()
        })
        else {
            const v = this.v, f = this.getForm()
            let upd = false
            Object.keys(roleForm).forEach(k => {
                if (v[k] !== f[k]) {
                    upd = true
                    v[k] = f[k]
                }
            })
            if (upd) ajax({ req: 'save', vol: this.v.id, details: f }).then(r => {
                this.edit = false
                nav.d.saveZip({ vs: r.vs })
                this.p.reload()
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
    save = () => {
        const r24 = this.roleRem(this.getForm()), v = this.v,
            roles = (JSON.stringify(r24) !== JSON.stringify(v.year && v.year[year])) && r24
        if (roles) ajax({ req: 'save', vol: this.v.id, year, roles }).then(r => {
            nav.d.saveZip({ vs: r.vs })
            debug({ save: this, v })
            this.p.reload()
            this.popup.close('updated')
        }).catch(e => debug({ e }))
        else this.popup.close('unchanged')
    }
    input = (e, o) => {
        debug({ input: e, o })
        const name = o.name
        if (name === 'asection' || name === 'jsection') selectSection(this, name, name.charAt(0) + 'role')
        else if (name === 'arole' || name === 'jrole') selectRole(this, name.charAt(0) + 'section', name)
        else if (name === 'adult' || name === 'junior' || name === 'none') this.hidden(name)
    }
}
export default Vol