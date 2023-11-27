const debug = console.log.bind(console)
const error = console.error.bind(console)
import { icons } from './icons'
import TT from './TT'

class IN extends TT {
    constructor(p, type, name, param) {
        super(p, type, name, param, true)
        this.id = 'IN_' + this.name + '_' + this.p.id
        const f = this.p._p('form'), form = f && f()
        this.lk = form && form[name]
        if (!this.lk) error({ IN: this, f, form, name })
        else (p.frm || (p.frm = {}))[name] = this
    }
    html = () => {
        const { lk, name, type, param } = this
        //debug({ name, type, param, form })
        switch (type) {
            case 'input':
                return `${lk.label ? `<label for="${this.id}">${lk.label}</label>` : ''}
            <input
            type="${lk.type || 'text'}"
            name="${name}"
            id="${this.id}"
            ${lk.placeholder ? `placeholder="${lk.placeholder}"` : ''}
            ${lk.pattern ? `pattern="${lk.pattern}"` : ''}
            ${lk.required ? 'required' : ''}
            ${lk.value ? `value="${lk.value}"` : ''}
            class="${lk.class || 'form'}" 
            />`
            case 'radio':
                return `<input type="radio"
            name="${lk.radio}"
            value="${name}"
            id="${this.id}"
            ${lk.required ? 'required' : ''}
            ${lk.value ? `value="${lk.value}"` : ''}
            />
            ${lk.label ? `<label for="${this.id}">${lk.label}</label>` : ''}`
            case 'select':
                return `<select class="${lk.class || 'form'}" 
            name="${name}"
            id="${this.id}">
            ${lk.options.map(o => typeof o === 'string' ? `<option value="${o}" ${o === lk.value ? 'selected' : ''}>${o}</option>`
                    : `<option value="${o.value}" ${o.value === lk.value ? 'selected' : ''}>${o.name}</option>`).join('')}
            </select>`
            case 'textarea':
                return `<textarea rows="${lk.rows || 5}" cols="${lk.cols || 25}" class="${lk.class || 'form'}" 
            name="${name}"
            id="${this.id}"
            ${lk.placeholder ? `placeholder="${lk.placeholder}"` : ''}
            ${lk.required ? 'required' : ''}
            >${lk.value || ''}</textarea>`
            case 'checkbox':
                return `<input type="checkbox" class="${lk.class ? 'checkbox ' + form.class : 'checkbox'}"
            ${lk.value === true || lk.checked ? 'checked' : ''}
            name="${name}"
            id="${this.id}"
            ${lk.required ? 'required' : ''}
            />
            ${lk.label ? `<label for="${this.id}">${lk.label}</label>` : ''}`
            case 'button':
                const icon = lk.icon && icons[lk.icon], active = lk.class && lk.class.includes('active'),
                    img = icon && `<img name="${name}" data-image="${lk.icon}" src="${active ? icon.active : icon.default}" class="${lk.class || 'icon'}" />`
                return img || `<button 
            name="${name}" 
            id="${this.id}"
            class="${lk.class || 'form'}">${param || name}</button>`
        }
    }
    input = e => {
        e.preventDefault()
        const ipt = this.p._p('input')
        if (ipt) ipt(e, this)
        else debug({ Form: this, e })
    }
}
export default IN