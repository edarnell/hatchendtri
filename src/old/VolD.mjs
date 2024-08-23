import Html, { debug, nav, _s, error } from './Html.mjs'
import volD from './html/volD.html'
import { ajax } from './ajax.mjs'

const year = 2024

class VolD extends Html {
    constructor(p, n) {
        super(p, n)
        if (n) {
            const vs = nav.d.data.vs, v = vs[n]
            if (v && v.id) {
                // check a or owner
                ajax({ req: 'vol', v: v.id }).then(r => {
                    this.v = r.v
                    this.reload()
                })
            } else error({ n })
        }
        else {
            const f = this._p('_form'), nm = f && f.filter
            if (nm) {
                const [first, ...last] = nm.trim().split(' ')
                this.v = { first, last: last.join(' ') }
            }
            else error({ f, nm })
        }
    }
    form = () => {
        return { // section and options populated on load
            first: { placeholder: 'first name', width: '50rem', required: true },
            last: { placeholder: 'last name', width: '50rem', required: true },
            email: { placeholder: 'email', type: 'email', width: '50rem', required: true },
            mobile: { placeholder: 'mobile', type: 'tel', width: '50rem' },
            notes: { placeholder: 'notes', rows: 1, cols: 20 },
            child: { class: 'bold', label: 'Child', tip: 'safeguarding' },
        }
    }
    html = (n) => {
        if (n === 'save') {
            const sv = this.saveY()
            return `<span id="save">${sv ? '{link.save}' : ''}</span>`
        }
        else return volD
    }
    var = (n) => {
        const v = this.v
        if (n === 'name') return v ? v.first + ' ' + v.last : 'New Volunteer'
    }
    link = (n) => {
        if (n === 'save') return { tip: 'save', icon: 'save', click: this.save }
    }
    rendered = () => {
        if (this.v) this._f = this.setForm(this.v)
    }
    contact = () => {
        if (this.v.mobile || this.v.email) return `<span>${this.v.mobile || ''} ${this.v.email || ''}</span>`
        else return '?'
    }
    saveY = () => {
        const f = this._f, v = this.v,
            c = f && Object.keys(f).filter(k => (f[k] || v[k]) && f[k] !== v[k]),
            e = f && f.email && f.email.match(/^[^@]+@[^@]+$/),
            n = f && f.first && f.last,
            s = c && c.length && n && e
        return s
    }
    save = (h) => {
        const s = this.saveY()
        if (s) {
            const v = this.v
            Object.keys(this._f).forEach(k => v[k] = this._f[k])
            ajax({ req: 'save', v }).then(r => {
                this.close('<div class="green">updated</div>', 'vr')
            }).catch(e => {
                error({ save: e })
                this.close('<div class="red">Error</div>')
            })
        }
    }
    input = () => {
        this._f = this.getForm()
        this.reload('save')
    }
}
export default VolD