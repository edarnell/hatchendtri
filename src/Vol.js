import Html, { debug, page, _s, set_nav } from './Html'
import { sections, roles, selectSection, selectRole } from './roles'
import { req } from './data'
import volR from './html/Vol.html'
import volD from './html/volD.html'

const form = { // section and options populated on load
    adult: { class: 'bold', label: 'Adult', tip: 'available for adult race' },
    junior: { class: 'bold', label: 'Junior', tip: 'available for junior race' },
    none: { class: 'bold', label: 'None', tip: 'not available in 2023' },
    asection: { class: "form hidden", options: ['Section'].concat(sections) },
    arole: { class: "form hidden", options: ['Role'].concat(roles()) },
    jsection: { class: "form hidden", options: ['Section'].concat(sections) },
    jrole: { class: "form hidden", options: ['Role'].concat(roles()) },
    save: { icon: 'save', tip: 'no changes to save', submit: true }
}

const contact = { // section and options populated on load
    name: { placeholder: 'name', width: '50rem' },
    email: { placeholder: 'email', type: 'email', width: '50rem' },
    mobile: { placeholder: 'mobile', type: 'tel', width: '50rem' },
    notes: { placeholder: 'notes', rows: 1, cols: 20 },
    unsub: { class: 'bold red', label: 'Unsubscribe', tip: 'Warning - remove completely' },
    admin: { class: 'bold red hidden', label: 'Admin', tip: 'Warning - admin rights' }
}

class Vol extends Html {
    constructor() {
        super()
        this.data = 'vs'
    }
    //debug = (m) => debug({ Vol: m, o: this.o(), popup: this.popup })
    html = (o) => {
        if (!o) return volR
        else {
            const { name, param } = o.attr()
            if (name === 'volD') {
                this._volD = o
                if (this.show_volD) return volD
                else return ''
            }
        }
    }
    send = () => {
        const f = this.getForm(email)
        if (f.subject && f.message) req({ req: 'send', subject: f.subject, message: f.message, to: this.v.id }).then(r => {
            this.innerHTML = '<div class="tooltip">Message sent</div>'
            setTimeout(this.tt.close, 1000)
        })
    }
    details = (o) => {
        if (!this.show_volD) req({ req: 'vol', vol: this.v.id }).then(r => {
            debug({ r })
            const id = this.v.id, v = this.v = r.vol
            this.v.id = id // restore id if missing
            Object.keys(contact).forEach(k => {
                contact[k].value = v[k] === undefined ? '' : v[k]
            })
            this.show_volD = true
            if (nav.admin(true)) contact.admin.class = 'bold red'
            this._volD.setAttribute('param', 'update')
        })
    }
    form = (o) => {
        const { name, param } = o.attr()
        if (name === 'save') this._save = o
        if (form[name]) return form[name]
        else if (contact[name]) return contact[name]
    }
    var = (o) => {
        const { name, param } = o.attr(), v = this.v
        this._name = o
        return v ? v.id ? `{link.details.${_s(v.name)}}` : 'New' : ''
    }
    listen = () => {
        const { name, param } = this.attr(),
            id = name === 'new' ? 0 : name.substring(1),
            v = this.v = id === 0 ? { id: 0, year: {}, name: param } : page.vs[id],
            vy = v.year[2023] || {}, f = { ...vy }
        this._name.setAttribute('param', 'update')
        if (f.asection === '') f.asection = 'Section'
        if (f.jsection === '') f.jsection = 'Section'
        if (f.arole === '') f.arole = 'Role'
        if (f.jrole === '') f.jrole = 'Role'
        if (f.asection) form['arole'].options = ['Role'].concat(roles(f.asection))
        if (f.jsection) form['jrole'].options = ['Role'].concat(roles(f.jsection))
        const ar = this.querySelector(`ed-form[name=arole]`),
            jr = this.querySelector(`ed-form[name=jrole]`)
        ar.setAttribute('param', 'update')
        jr.setAttribute('param', 'update')
        this.setForm(f)
        this.hidden('adult')
        this.hidden('junior')
        if (v.id === 0) {
            this.show_volD = true
            contact.name.value = v.name
            this._volD.setAttribute('param', 'update')
        }
    }
    link = (o) => {
        const { name, param } = o.attr()
        if (name === 'details') return { tip: 'edit details', click: this.details }
        else if (name === 'close') return { class: 'close', tip: 'save and close', click: this.save }
    }
    getF = () => {
        const r = this.getForm(form)
        if (r.asection === 'Section') r.asection = ''
        if (r.jsection === 'Section') r.jsection = ''
        if (r.arole === 'Role') r.arole = ''
        if (r.jrole === 'Role') r.jrole = ''
        return r
    }
    hidden = (race) => {
        const a = this.querySelector(`input[name=adult]`),
            j = this.querySelector(`input[name=junior]`),
            n = this.querySelector(`input[name=none]`),
            as = this.querySelector(`select[name=asection]`),
            ar = this.querySelector(`select[name=arole]`),
            js = this.querySelector(`select[name=jsection]`),
            jr = this.querySelector(`select[name=jrole]`)
        if (race === 'none' && n.checked) {
            a.checked = false
            j.checked = false
            as.classList.add('hidden')
            js.classList.add('hidden')
            ar.classList.add('hidden')
            jr.classList.add('hidden')
            form[`asection`].class = 'form hidden'
            form[`arole`].class = 'form hidden'
            form[`jsection`].class = 'form hidden'
            form[`jrole`].class = 'form hidden'
            selectSection('Section', null, form, this, 'a')
            selectSection('Section', null, form, this, 'j')
        }
        else if (race === 'adult' || race === 'junior') {
            const x = race === 'adult' ? a : j,
                s = race === 'adult' ? as : js,
                r = race === 'adult' ? ar : jr,
                c = race.charAt(0)
            if (x.checked) {
                n.checked = false
                if (nav.admin()) {
                    s.classList.remove('hidden')
                    r.classList.remove('hidden')
                    form[`${c}section`].class = 'form'
                    form[`${c}role`].class = 'form'
                }
            }
            else {
                s.classList.add('hidden')
                r.classList.add('hidden')
                form[`${c}section`].class = 'form hidden'
                form[`${c}role`].class = 'form hidden'
                selectSection('Section', null, form, this, c)
            }
        }
    }
    save = () => {
        const r = this.getF(),
            v = { ...this.v, ...this.getForm(contact) },
            roles = (JSON.stringify(r) !== JSON.stringify(this.v.year[2023])) && r,
            details = (this.show_volD && JSON.stringify(v) !== JSON.stringify(this.v)) && v
        if (roles || details) req({ req: 'save', vol: this.v.id, roles, details }).then(r => {
            this.popup.close()
        }).catch(e => debug({ e }))
        else this.popup.close()
    }
    update = (e, o) => {
        const { name, param, type } = o.attr()
        if (name === 'asection' || name === 'jsection') selectSection(e, o, form, this, name.charAt(0))
        else if (name === 'arole' || name === 'jrole') selectRole(e, o, form, this, name.charAt(0))
        else if (nav.admin() && (name === 'adult' || name === 'junior' || name === 'none')) this.hidden(name)
    }
}
export default Vol