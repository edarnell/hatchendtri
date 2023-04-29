import Html, { debug, page, _s, set_nav } from './Html'
import { sections, roles, selectSection, selectRole } from './roles'
import { req } from './data'
import volR from './html/Vol.html'
import volD from './html/volD.html'

const form = { // section and options populated on load
    adult: { class: 'form' },
    junior: { class: 'form' },
    none: { class: 'form' },
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
    notes: { placeholder: 'notes', rows: 1, cols: 20 }
}

class Vol extends Html {
    constructor() {
        super()
        this.popup = true
        this.data = 'vs'
    }
    //debug = (m) => debug({ Vol: m, o: this.o(), div: this })
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
            this._volD.setAttribute('param', 'update')
        })
    }
    form = (o) => {
        const { name, param } = o.attr()
        if (name === 'save') this._save = o
        if (form[name]) return form[name]
        else if (contact[name]) return contact[name]
        else if (email[name]) return email[name]
    }
    var = (o) => {
        debug({ var: o.attr(), v: this.v })
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
        this.saveIcon()
        if (v.id === 0) {
            this.show_volD = true
            contact.name.value = v.name
            this._volD.setAttribute('param', 'update')
        }
    }
    link = (o) => {
        const { name, param } = o.attr()
        if (name === 'details') return { tip: 'edit details', click: this.details }
    }
    getF = () => {
        const r = this.getForm(form)
        if (r.asection === 'Section') r.asection = ''
        if (r.jsection === 'Section') r.jsection = ''
        if (r.arole === 'Role') r.arole = ''
        if (r.jrole === 'Role') r.jrole = ''
        return r
    }
    saveIcon = () => {
        const d = this.form_data = this.getF(),
            v = this.getForm(contact),
            rolechange = JSON.stringify(d) !== JSON.stringify(this.v.year[2023]),
            detailsChange = this.show_volD && JSON.stringify(v) !== JSON.stringify(this.v) || false
        if (rolechange || detailsChange) {
            form.save.class = 'icon active'
            form.save.tip = 'save changes'
        }
        else {
            form.save.class = 'icon'
            form.save.tip = 'no changes to save'
        }
        this._save.setAttribute('param', 'update')
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
                s.classList.remove('hidden')
                r.classList.remove('hidden')
                form[`${c}section`].class = 'form'
                form[`${c}role`].class = 'form'
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
            this.tt.close()
        }).catch(e => debug({ e }))
    }
    update = (e, o) => {
        const { name, param, type } = o.attr()
        if (name === 'asection' || name === 'jsection') selectSection(e, o, form, this, name.charAt(0))
        else if (name === 'arole' || name === 'jrole') selectRole(e, o, form, this, name.charAt(0))
        else if (name === 'adult' || name === 'junior' || name === 'none') this.hidden(name)
        else if (name === 'close') this.tt.close()
        else if (name === 'save') this.save()
        this.saveIcon()
    }
}
export default Vol