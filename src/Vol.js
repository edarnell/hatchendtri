import Html, { debug, nav, _s, error } from './Html'
import { sections, roles, selectSection, selectRole, setVol } from './roles'
import html from './html/Vol.html'
import volD from './html/volD.html'
import volE from './html/volE.html'
import { ajax } from './ajax'

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
        debug({ n, v: this.v })
    }
    user = () => {
        const u = nav._user, { i, first, last, vs } = (u||{}), v = vs && vs[0]
        if (v) ajax({ req: 'vol', v: v.id }).then(r => {
            this.v = r.v
        })
        return v ? v : { i, first, last }
    }
    form = () => {
        if (this.edit) return { // section and options populated on load
            first: { placeholder: 'first name', width: '50rem', required: true },
            last: { placeholder: 'last name', width: '50rem', required: true },
            email: { placeholder: 'email', type: 'email', width: '50rem', required: true },
            mobile: { placeholder: 'mobile', type: 'tel', width: '50rem' },
            notes: { placeholder: 'notes', rows: 1, cols: 20 }
        }
        else return { // section and options populated on load
            adult: { class: 'bold', label: 'Adult', tip: 'available for adult race' },
            junior: { class: 'bold', label: 'Junior', tip: 'available for junior race' },
            none: { class: 'bold', label: 'None', tip: `not available in ${year}` },
            asection: { class: "form hidden", options: ['Section'].concat(sections) },
            arole: { class: "form hidden", options: ['Role'].concat(roles()) },
            jsection: { class: "form hidden", options: ['Section'].concat(sections) },
            jrole: { class: "form hidden", options: ['Role'].concat(roles()) },
            notes: { placeholder: 'role preference?', rows: 1, cols: 20 }
        }
    }
    html = (n) => {
        if (n === 'vol') return `<form id="vol">${this.edit ? volD : volE}</form>`
        else return html
    }
    var = (n) => {
        if (n === 'name') {
            if (!this.v.i) return '{link.details.New_Volunteer_}'
            const { first, last } = this.v
            return `{link.details.${first + '_' + last}_}`
        }
        else if (n === 'mobile') return this.edit ? '' : '{link.mobile}'
        else if (n === 'admin') return nav._user.aed ? '{checkbox.admin}' : ''
    }
    link = (name) => {
        if (name === 'details') return { tip: this.edit ? this.dtip : 'edit contact details', icon_: this.edit ? 'save' : 'edit', click: this.details }
        else if (name === 'close') return { class: 'close', tip: this.edit ? 'close' : 'save and close', click: this.edit ? () => this.close() : this.save }
        else if (name === 'mobile') return { tip: this.mobile, click: this.details }
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
    mobile = () => {
        const m = this.v.mobile
        if (m) return `<span id="mobile">...${m.slice(-3)} click to update</span>`
        else return 'click to add'
    }
    details = (o) => {
        if (!this.edit) ajax({ req: 'vol', v: this.v.id }).then(r => {
            this.v = r.v
            this.edit = true
            this.reload()
        })
        else {
            const v = this.v, f = this.getForm()
            let upd = false
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

    dtip = () => {
        const l = this.q('#vol'), f = this.getForm(),
            e = f.email.match(/^[^@]+@[^@]+$/),
            fn = f.first, ln = f.last
        if (l && !l.checkValidity()) l.reportValidity()
        return e && fn && ln ? 'save' : fn && ln && !e ? 'please enter a valid email' : 'please complete name and email'
    }

    updateV = () => {
        const v = this.v
        if (v.id === 0) {
            this.edit = true
        }
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
                if (nav._user.aed) {
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
        debug({ save: this })
        const r24 = this.roleRem(this.getForm()), v = this.v, vr = nav.d.data.vr, vy = v.id && vr && vr[v.id] || {},
            roles = (JSON.stringify(r24) !== JSON.stringify(vy)) && r24
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