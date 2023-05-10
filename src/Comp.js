import Html, { debug, page, _s } from './Html'
import { req, cleanse } from './data'
import comp from './html/Comp.html'

function diff(a, b) { return JSON.stringify(a) !== JSON.stringify(b) }

const swimTip = '<i>400m swim estimate</i><br />5:00-8:00 fast/club<br />8:00-10:00 regular<br />10:00-12:00 occasional<br />12:00-15:00 slower<br />'
const form = { // section and options populated on load
    swim400: { class: 'form swim', label: "Swim&nbsp;Estimate", placeholder: 'mm:ss', tip: swimTip, width: '30px', pattern: "^([4-9]|1[0-9]):[0-5][0-9]$", required: true, theme: 'light' },
    stroke: { class: 'bold', label: 'breast-stroke', tip: 'slower wider lane' },
    early: { radio: 'start', class: 'bold', label: 'early', tip: 'early start preference (less traffic)' },
    late: { radio: 'start', class: 'bold', label: 'late', tip: 'later start preference' },
    either: { radio: 'start', class: 'bold', label: 'either', tip: 'best scheduling' },
    deaf: { class: 'bold', label: 'deaf', tip: 'for briefing &amp; marshalls' },
}

class Comp extends Html {
    constructor() {
        super()
        this.data = 'cs'
        const { name, param } = this.attr(),
            id = name.substring(1),
            c = this.c = page.cs[id]
    }
    //debug = (m) => debug({ Vol: m, o: this.o(), popup: this.popup })
    listen = (o) => {
        if (!this._f) {
            if (this.c.swim400) this.c.swim400 = cleanse(this.c.swim400)
            this.setForm(this.c, form)
            this._f = this.getForm(form)
        }
    }
    var = (o) => {
        const { name, param } = o.attr(),
            c = this.c, nm = `${c.first} ${c.last}`
        if (name === 'name') return nm
    }
    html = (o) => {
        if (!o) {
            if (this.c.swim400) return comp
            else this.junior()
        }
    }
    form = (o) => {
        const { name, param } = o.attr()
        if (form[name]) return form[name]
    }
    swimTip = () => { return }
    link = (o) => {
        const { name, param } = o.attr()
        if (name.startsWith('u_')) return { tip: '' }
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
        const f = this.getForm(form)
        if (f && f.swim400) f.swim400 = cleanse(f.swim400)
        if (f && f.swim400) req({ req: 'save', cid: this.c.id, swim: f }).then(r => {
            if (r.comp) page.cs[this.c.id] = r.comp
            this.confirm()
        }).catch(e => this.error(e))
        else this.error({ message: 'invalid swim time' })
    }
}
export default Comp