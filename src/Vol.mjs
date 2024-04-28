import Html, { debug, nav, _s, error } from './Html.mjs'
import { sections, roles, selectSection, selectRole, setVol } from './roles.mjs'
import html from './html/Vol.html'
import volD from './html/volD.html'
import volE from './html/volE.html'
import { ajax } from './ajax.mjs'

const year = 2024

class Vol extends Html {
    constructor(p, n) {
        super(p, n)
        const vs = nav.d.data.vs
        if (n === 'u') this.v = this.user()
        else if (n === 'n') {
            const f = p && p._form, nm = f && f.name, [fn, ln] = (nm || '').split(' ')
            this.v = { first: fn || '', last: ln || '', email: '', mobile: '', notes: '' }
            this.edit = true
        }
        else this.v = (vs && vs[n])
        nav._vol = null // prevent popup from opening again
        if (this.v && this.v.id) {
            ajax({ req: 'vol', v: this.v.id }).then(r => {
                this.v = r.v
                this.reload()
            })
        }
    }
    user = () => {
        const d = nav.d.data, u = nav._user, { i, first, last, vs } = u, id = nav._vol || (vs && vs[0])
        return id ? d.vs[id] : { i, first, last }
    }
    form = () => {
        if (this.edit) return { // section and options populated on load
            first: { placeholder: 'first name', width: '50rem', required: true },
            last: { placeholder: 'last name', width: '50rem', required: true },
            email: { placeholder: 'email', type: 'email', width: '50rem', required: true },
            mobile: { placeholder: 'mobile', type: 'tel', width: '50rem' },
            notes: { placeholder: 'notes', rows: 1, cols: 20 },
            child: { class: 'bold', label: 'Child', tip: 'safeguarding' },
        }
        else return { // section and options populated on load
            adult: { class: 'bold', label: 'Adult', tip: 'available for adult race' },
            junior: { class: 'bold', label: 'Junior', tip: 'available for junior race' },
            none: { class: 'bold', label: 'None', tip: `not available in ${year}` },
            setup: { class: 'bold hidden', label: 'Setup', tip: 'Saturday setup team' },
            asection: { class: 'form hidden', options: ['Section'].concat(sections()) },
            arole: { class: 'form hidden', options: ['Role'].concat(roles()) },
            jsection: { class: 'form hidden', options: ['Section'].concat(sections()) },
            jrole: { class: 'form hidden', options: ['Role'].concat(roles()) },
            notes: { placeholder: 'role preference?', rows: 1, cols: 20 }
        }
    }
    html = (n) => {
        if (n === 'vol') return `<form id="vol">${this.edit ? volD : volE}</form>`
        else return html
    }
    var = (n) => {
        if (n === 'name') {
            if (!this.v.first) return '{link.details.New_Volunteer_}'
            const nm = _s(this.v.first + ' ' + this.v.last)
            return `{link.details.${nm}_}`
        }
        else if (n == 'contact') {
            const a = nav._user.admin
            return a ? '{link.contact}' : ''
        }
    }
    link = (name) => {
        const a = nav._user.admin
        if (name === 'details') return { tip: this.edit ? this.dtip : 'edit contact details', icon_: this.edit ? 'save' : 'edit', click: this.details }
        else if (name === 'close') return { class: 'close', tip: this.edit ? 'close' : 'save and close', click: this.edit ? () => this.close() : this.save }
        else if (name === 'contact') return a ? { tip: this.contact, popup: `{Contact.${this.v.id}}` } : ''
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
    contact = () => {
        if (this.v.mobile || this.v.email) return `<span>${this.v.mobile || ''} ${this.v.email || ''}</span>`
        else return '?'
    }
    details = (o) => {
        if (!this.edit) ajax({ req: 'vol', v: this.v.id }).then(r => {
            this.v = r.v
            this.edit = true
            this.reload()
        })
        else {
            const v = this.v, f = this.getForm()
            let upd
            Object.keys(f).forEach(k => {
                if ((f[k] || v[k]) && f[k] !== v[k]) {
                    v[k] = f[k]
                    upd = true
                }
            })
            if (upd) ajax({ req: 'save', v }).then(r => {
                this.edit = false
                this.reload()
            })
            else {
                this.edit = false
                this.reload()
            }
        }
    }
    dtip = () => {
        const l = this.q('#vol'), f = this.getForm(),
            e = f.email.match(/^[^@]+@[^@]+$/),
            fn = f.first, ln = f.last
        if (l && !l.checkValidity()) l.reportValidity()
        return e && fn && ln ? 'save' : fn && ln && !e ? 'please enter a valid email' : 'please complete name and email'
    }
    updateV = () => {
        const v = this.v
        if (v.id === 0) this.edit = true
        else {
            const vr = nav.d.data.vr, vy = vr && vr[v.id] || {}
            if (vy) {
                if (vy.none) this.fe('none').checked = true
                else setVol(this, vy)
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
        const u = nav._user, admin = u.admin,
            a = this.fe('adult'),
            j = this.fe('junior'),
            n = this.fe('none'),
            su = this.fe('setup'),
            as = this.fe('asection'),
            ar = this.fe('arole'),
            js = this.fe('jsection'),
            jr = this.fe('jrole')
        if (admin) {
            su.classList.remove('hidden');
            this.q(`label[for="${su.id}"]`).classList.remove('hidden')
        }
        if (race === 'none' && n.checked) {
            a.checked = false
            j.checked = false
            as.classList.add('hidden')
            js.classList.add('hidden')
            ar.classList.add('hidden')
            jr.classList.add('hidden')
            //selectSection(this, 'asection', 'arole')
            //selectSection(this, 'jsection', 'jrole')
        }
        else if (race === 'adult' || race === 'junior') {
            const x = race === 'adult' ? a : j,
                s = race === 'adult' ? as : js,
                r = race === 'adult' ? ar : jr,
                c = race.charAt(0)
            if (x.checked) {
                n.checked = false
                if (nav._user.admin) {
                    s.classList.remove('hidden')
                    r.classList.remove('hidden')
                }
            }
            else {
                s.classList.add('hidden')
                r.classList.add('hidden')
                //selectSection(this, c + 'section', c + 'role')
            }
        }
    }
    roleRem = (r) => {
        const o = Object.entries(r).filter(([k, v]) => v && v !== 'Role' && v !== 'Section')
            .reduce((a, [k, v]) => {
                a[k] = v
                return a
            }, {})
        return o
    }
    save = () => {
        const r24 = this.roleRem(this.getForm()), v = this.v, vr = nav.d.data.vr, vy = v.id && vr && vr[v.id] || {},
            { upd, ...vp } = vy,
            roles = (JSON.stringify(r24) !== JSON.stringify(vp)) && r24
        debug({ roles, r24, vy })
        if (roles) {
            ajax({ req: 'save', v, roles }).then(r => {
                this.close('<div class="green">updated</div>', 'vr')
            }).catch(e => {
                error({ save: e })
                this.close('<div class="red">Error</div>')
            })
        }
        else this.close('unchanged')
    }
    input = (e, o) => {
        const name = o.name
        if (name === 'asection' || name === 'jsection') selectSection(this, name)
        else if (name === 'arole' || name === 'jrole') selectRole(this, name)
        else if (name === 'adult' || name === 'junior' || name === 'none') this.hidden(name)
    }
}
export default Vol