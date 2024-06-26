import Html, { debug, page, _s } from './Html.mjs'
import { req, cleanse } from './Data.mjs'
import comp from './html/Comp.html'
import compD from './html/compD.html'
import swimD from './html/swimD.html'

function diff(a, b) { return JSON.stringify(a) !== JSON.stringify(b) }

const swimTip = '<i>400m swim estimate</i><br />5:00-8:00 fast/club<br />8:00-10:00 regular<br />10:00-12:00 occasional<br />12:00-15:00 slower<br />'
const form = { // section and options populated on load
    swim400: { class: 'form swim', label: "Swim&nbsp;Estimate", placeholder: 'mm:ss', tip: swimTip, width: '30px', pattern: "^([4-9]|1[0-9]):[0-5][0-9]$", required: true, theme: 'light' },
    stroke: { class: 'bold', label: 'breast-stroke', tip: 'slower wider lane' },
    n: { class: 'form swim', placeholder: '#', required: true, width: '30px' },
    brief: { class: 'form swim', placeholder: 'briefing', required: true, width: '30px' },
    start: { class: 'form swim', placeholder: 'start', required: true, width: '30px' },
    early: { radio: 'start', class: 'bold', label: 'early', tip: 'early start preference (less traffic)' },
    late: { radio: 'start', class: 'bold', label: 'late', tip: 'later start preference' },
    either: { radio: 'start', class: 'bold', label: 'either', tip: 'best scheduling' },
    deaf: { class: 'bold', label: 'deaf', tip: 'for briefing &amp; marshalls' },
    first: { placeholder: 'first name', required: true },
    last: { placeholder: 'last name', required: true },
    email: { placeholder: 'email', type: 'email', required: true },
    phone: { placeholder: 'mobile', type: 'phone' },
    club: { placeholder: 'club' },
}

class Comp extends Html {
    constructor() {
        super()
        //if (!this.page.cs_) this.data = 'cs'
        const { name, param } = this.attr(),
            cid = this.cid = name.substring(1),
            c = this.c = cid === 'new' ? {} : page.cs_ ? page.cs_[cid] : page.cs[cid]
        debug({ c })
    }
    //debug = (m) => debug({ Vol: m, o: this.o(), popup: this.popup })
    listen = (o) => {
        if (!this._f) {
            const c = { ...this.c }
            if (c.swim400 && c.swim400 !== cleanse(c.swim400)) {
                debug({ c })
                c.swim400 = cleanse(c.swim400)
            }
            this.setForm(c, form)
            this._f = this.getForm(form)
        }
    }
    var = (o) => {
        const { name, param } = o.attr(),
            c = this.c, nm = _s(`${c.first} ${c.last}`)
        if (name === 'name') return `{link.u_${this.cid}.${nm}}`
    }
    html = (o) => {
        if (!o) {
            if (page.cs_) return comp
            else if (this.c.swim400) return comp
            else this.junior()
        }
        else {
            const { name, param } = o.attr()
            if (name === 'compD') return compD
            else if (name === 'swimD') return swimD
        }
    }
    details = (o) => {
        if (!this.show_compD) req({ req: 'comp', cid: this.cid }).then(r => {
            debug({ r })
            const c = this.c = r.comp
            this.show_compD = true
            this._compD._upd()
            this.setForm(this.c, contact)
            this._f = this.getForm(contact)
        })
    }
    form = (o) => {
        const { name, param } = o.attr()
        if (form[name]) return form[name]
        else if (contact[name]) return contact[name]
    }
    swimTip = () => { return }
    link = (o) => {
        const { name, param } = o.attr()
        if (name.startsWith('u_')) return { tip: 'update contact details', click: this.details }
        if (name === 'Swim') return { theme: 'light', tip: swimTip }
        else if (name === 'close') {
            this._x = o
            if (this._f) {
                const f = this.getForm(form)
                if (diff(f, this._f)) return { class: 'close', icon: 'save', tip: 'save and close', click: this.save }
                else return { class: 'close', tip: 'close', click: this.popup.close }
            }
            else return { class: 'close', tip: 'close', click: this.popup.close }
        }
    }
    update = (e, o) => {
        this._x._upd()
    }
    confirm = (r) => {
        this.innerHTML = '<div class="message">Updated</div>'
        setTimeout(this.popup.close, 2000)
    }
    junior = (r) => {
        this.innerHTML = '<div class="message">Junior - not required in advance</div>'
        setTimeout(this.popup.close, 2000)
    }
    error = (e) => {
        debug({ e })
        this.innerHTML = `<div class="message error">Error - retry</div>`
        setTimeout(this.popup.close, 2000)
    }
    save = () => {
        const f = this.getForm(form), comp = { ...this.c, ...f }
        //if (f && f.swim400) f.swim400 = cleanse(f.swim400)
        debug({ c: this.c, f, comp })
        req({ req: 'save', comp }).then(r => {
            if (r.comp) page.cs_[r.comp.id] = r.comp
            this.confirm()
        }).catch(e => this.error(e))
    }
}
export default Comp