const debug = console.log.bind(console)
const error = console.error.bind(console)
import { icons } from './icons'
import TT from './TT'

class IN extends TT {
    constructor(p, type, name, param) {
        super(p, type, name, param, true)
        this.lk = this.p.form ? this.p.form[name] : this.p.page.form[name]
        this.lk.o = this
        this.id = this.p.id + '_' + this.name + '_IN'
    }
    html = () => {
        const { p, name, type, param } = this, form = this.lk
        //debug({ name, type, param, form })
        switch (type) {
            case 'input':
                return `${form.label ? `<label for="${this.id}">${form.label}</label>` : ''}
            <input
            type="${form.type || 'text'}"
            name="${name}"
            id="${this.id}"
            ${form.placeholder ? `placeholder="${form.placeholder}"` : ''}
            ${form.pattern ? `pattern="${form.pattern}"` : ''}
            ${form.required ? 'required' : ''}
            ${form.value ? `value="${form.value}"` : ''}
            class="${form.class || 'form'}" 
            />`
            case 'radio':
                return `<input type="radio"
            name="${form.radio}"
            value="${name}"
            id="${this.id}"
            ${form.required ? 'required' : ''}
            ${form.value ? `value="${form.value}"` : ''}
            />
            ${form.label ? `<label for="${this.id}">${form.label}</label>` : ''}`
            case 'select':
                return `<select class="${form.class || 'form'}" 
            name="${name}"
            id="${this.id}">
            ${form.options.map(o => typeof o === 'string' ? `<option value="${o}" ${o === form.value ? 'selected' : ''}>${o}</option>`
                    : `<option value="${o.value}" ${o.value === form.value ? 'selected' : ''}>${o.name}</option>`).join('')}
            </select>`
            case 'textarea':
                return `<textarea rows="${form.rows || 5}" cols="${form.cols || 25}" class="${form.class || 'form'}" 
            name="${name}"
            id="${this.id}"
            ${form.placeholder ? `placeholder="${form.placeholder}"` : ''}
            ${form.required ? 'required' : ''}
            >${form.value || ''}</textarea>`
            case 'checkbox':
                return `<input type="checkbox" class="${form.class ? 'checkbox ' + form.class : 'checkbox'}"
            ${form.value === true ? 'checked' : ''}
            name="${name}"
            id="${this.id}"
            ${form.required ? 'required' : ''}
            />
            ${form.label ? `<label for="${this.id}">${form.label}</label>` : ''}`
            case 'button':
                const icon = form.icon && icons[form.icon], active = form.class && form.class.includes('active'),
                    img = icon && `<img name="${name}" data-image="${form.icon}" src="${active ? icon.active : icon.default}" class="${form.class || 'icon'}" />`
                return img || `<button 
            name="${name}" 
            id="${this.id}"
            class="${form.class || 'form'}">${param || name}</button>`
        }
    }
    input = e => {
        e.preventDefault()
        const p = this.p, page = p.page, ipt = p.input || page.input
        if (ipt) ipt(e, this)
        else debug({ Form: this, e })
    }
}
export default IN