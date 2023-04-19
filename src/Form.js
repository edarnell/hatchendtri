import { debug } from './Html'
import TT from './TT'

class Form extends TT {
    constructor() {
        super()
        this._form = true
    }
    form = () => {
        const f = this.parent('form') || this.page('form')
        if (typeof f === 'function') return f(this)
    }
    html = () => {
        const { name, type, params } = this.attr(), form = this.lk = this.form()
        if (!form) debug({ Form: "define form=(o)=>", o: this.o() })
        else switch (type) {
            case 'input':
                return `<input
            type="${form.type || 'text'}"
            name="${name}"
            ${form.placeholder ? `placeholder="${form.placeholder}"` : ''}
            ${form.required ? 'required' : ''}
            ${form.value ? `value="${form.value}"` : ''}
            />`
            case 'select':
                return `<select class="${form.class || 'form'}" 
            name="${name}"
            ${form.value ? `value="${form.value}"` : ''}>
            ${form.options.map(o => `<option ${o === form.value ? 'selected' : ''}>${o}</option>`).join('')}
            </select>`
            case 'textarea':
                return `<textarea rows="${form.rows || 10}" cols="${form.cols || 40}" class="form" 
            name="${name}"
            ${form.placeholder ? `placeholder="${form.placeholder}"` : ''}
            ${form.required ? 'required' : ''}
            ></textarea>`
            case 'checkbox':
                return `<input
            type="checkbox"
            class="checkbox"
            ${form.value === true ? 'checked' : ''}
            name="${name}"
            ${form.required ? 'required' : ''}
            />`
            case 'button':
                return `<button 
            name="${name}" 
            class="${form.class || 'form'}">${name}</button>`
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