import Html, { debug, page, _s } from './Html'
import { sections, roles, selectSection, selectRole } from './roles'
import { save } from './data'
import html from './html/Vol.html'
import { firstLast } from './Volunteer'

const form = { // section and options populated on load
    name: { placeholder: 'name', width: '50rem' },
    email: { placeholder: 'email', type: 'email', width: '50rem' },
    a2023: { class: 'form' },
    j2023: { class: 'form' },
    n2023: { class: 'form' },
    unsub: { class: 'form' },
    hide: { class: 'form' },
    mobile: { placeholder: 'mobile', type: 'tel', width: '50rem' },
    notes: { placeholder: 'notes', rows: 1, cols: 20 },
    asection: { class: "form hidden", options: ['Section'].concat(sections) },
    arole: { class: "form hidden", options: ['Role'].concat(roles()) },
    jsection: { class: "form hidden", options: ['Section'].concat(sections) },
    jrole: { class: "form hidden", options: ['Role'].concat(roles()) },
    save: { class: 'form primary', tip: 'save', submit: true }
}

class Vol extends Html {
    constructor() {
        super()
        this.popup = true
    }
    html = (o) => html
    form = (o) => {
        const { name, param } = o.attr()
        return form[name]
    }
    listen = () => {
        const { name } = this.attr(), id = name.substring(1),
            v = page.v2023[id] || page.volunteers[id]
        const f = { ...v }
        Object.keys(f).forEach(k => {
            if (!form[k]) delete f[k]
        })
        if (f.asection === '') f.asection = 'Section'
        if (f.jsection === '') f.jsection = 'Section'
        if (f.arole === '') f.arole = 'Role'
        if (f.jrole === '') f.jrole = 'Role'
        this.setForm(f)
        this.hidden()
    }
    link = (o) => {
        const { name, param } = o.attr()
        if (name === 'close') return { class: 'close', tip: 'close', click: true }
    }
    getF = () => {
        const r = this.getForm(form)
        if (r.asection === 'Section') r.asection = ''
        if (r.jsection === 'Section') r.jsection = ''
        if (r.arole === 'Role') r.arole = ''
        if (r.jrole === 'Role') r.jrole = ''
        return r
    }
    hidden() {
        ['a', 'j'].forEach(aj => {
            const sn = aj + 'section', rn = aj + 'role'
            const c = this.querySelector(`input[name=${aj + '2023'}]`),
                s = this.querySelector(`select[name=${sn}]`),
                r = this.querySelector(`select[name=${rn}]`)
            if (c && c.checked) {
                s.classList.remove('hidden')
                form[sn].class = 'form'
                r.classList.remove('hidden')
                form[rn].class = 'form'
            }
            else {
                s.classList.add('hidden')
                form[sn].class = 'form hidden'
                r.classList.add('hidden')
                form[rn].class = 'form hidden'
            }
        })
    }
    save = () => {
        const data = this.getF()
        data.vid = this.vid
        data.v2023 = (data.a2023 || data.j2023) ? true : false
        save({ vol: data }).then(r => {
            page._update.setAttribute('param', 'update')
            this.tt.close()
        }).catch(e => debug({ e }))
    }
    update = (e, o) => {
        const { name, param, type } = o.attr()
        if (name === 'asection' || name === 'jsection') selectSection(e, o, form, this, name.charAt(0))
        else if (name === 'arole' || name === 'jrole') selectRole(e, o, form, this, name.charAt(0))
        else if (name === 'a2023' || name === 'j2023') this.hidden()
        else if (name === 'close') this.tt.close()
        else if (name === 'save') this.save()
        else if (name === 'volunteer') this.setid(e, o)
        else if (name === 'name' && !this.vid) this._vol_names.setAttribute('param', 'update')
    }
}
export default Vol