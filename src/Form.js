import Html, { debug } from './Html'
import { nav } from './Nav'

class Form extends Html {
    constructor() {
        super()
    }
    connectedCallback() {
        // Add code to run when the element is added to the DOM
        //debug('Form connectedCallback', this)
        this.innerHTML = this.replace_form()
        this.addEventListener("input", this.input)
        this.addEventListener("click", this.click)
    }

    disconnectedCallback() {
        // Add code to run when the element is removed from the DOM
        //debug({ disconnectedCallback: this })
        this.removeEventListener("input", this.input)
        this.removeEventListener("click", this.click)
        this.innerHTML = ''
    }
    form = () => {
        const root = nav.page, page = root && root.firstChild,
            form = page && page.form
        if (typeof form === 'function') return form(this)
        else debug({ form, page, root })
    }
    replace_form = () => {
        const { name, type, params } = this.attr(), form = this.form()
        if (!form) debug({ Form: this.attr() })
        else switch (type) {
            case 'input':
                return `<input
            type="${form.type || 'text'}"
            name="${name}"
            ${form.placeholder ? `placeholder="${form.placeholder}"` : ''}
            ${form.required ? 'required' : ''}
            />`
            case 'select':
                return `<select class="form" 
            name="${name}">
            ${form.options.map(o => `<option>${o}</option>`).join('')}
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
            name="${name}"
            ${form.required ? 'required' : ''}
            />`
        }
    }

    click = e => {
        //debug({ click: this.name })
    }
    input = e => {
        const root = nav.page, page = root && root.firstChild,
            update = page && page.update
        if (update) update(e, this)
    }
}
export default Form