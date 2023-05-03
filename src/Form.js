import { debug } from './Html'
import TT from './TT'
import { icons } from './icons'

class Form extends TT {
    constructor() {
        super()
        this._form = true
    }
    form = () => {
        const f = this.parent('form') || this.page('form')
        if (typeof f === 'function') return f(this)
    }
    //debug = (m) => debug({ Form: this.o(), m })
    html = () => {
        const { name, type, param } = this.attr(), form = this.lk = this.form()
        if (!form) debug({ Form: "define form=(o)=>", o: this.o(), form })
        else switch (type) {
            case 'input':
                return `<input
            type="${form.type || 'text'}"
            name="${name}"
            ${form.placeholder ? `placeholder="${form.placeholder}"` : ''}
            ${form.required ? 'required' : ''}
            ${form.value ? `value="${form.value}"` : ''}
            class="${form.class || 'form'}" 
            />`
            case 'select':
                return `<select class="${form.class || 'form'}" 
            name="${name}">
            ${form.options.map(o => typeof o === 'string' ? `<option value="${o}" ${o === form.value ? 'selected' : ''}>${o}</option>`
                    : `<option value="${o.value}" ${o.value === form.value ? 'selected' : ''}>${o.name}</option>`).join('')}
            </select>`
            case 'textarea':
                return `<textarea rows="${form.rows || 5}" cols="${form.cols || 25}" class="${form.class || 'form'}" 
            name="${name}"
            ${form.placeholder ? `placeholder="${form.placeholder}"` : ''}
            ${form.required ? 'required' : ''}
            >${form.value || ''}</textarea>`
            case 'checkbox':
                return `<span ${form.class ? `class="${form.class}"` : ''}>
            <input type="checkbox" class="checkbox"
            ${form.value === true ? 'checked' : ''}
            name="${name}"
            ${form.required ? 'required' : ''}
            />${form.label || ''}</span>`
            case 'button':
                const icon = form.icon && icons[form.icon], active = form.class && form.class.includes('active'),
                    img = icon && `<img name="${name}" data-image="${form.icon}" src="${active ? icon.active : icon.default}" class="${form.class || 'icon'}" />`
                return img || `<button 
            name="${name}" 
            class="${form.class || 'form'}">${param || name}</button>`
        }
    }
    input = e => {
        e.preventDefault()
        const update = this.parent('update') || this.page('update')
        if (update) update(e, this)
        else debug({ Form: "update=(e,o)=>", o: this.o(), input: e })
    }
}
export default Form