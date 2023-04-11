import Html, { debug } from './Html'
import { page } from './Page'

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

    replace_form = () => {
        const name = this.getAttribute("name"),
            type = this.getAttribute("type"),
            param = this.getAttribute("param"),
            data = this._data(), form = data.form, fe = form && form[name]
        if (!fe) debug({ type, name, param, parent: p.id })
        switch (type) {
            case 'input':
                return `<input
            type="${fe.type || 'text'}"
            name="${name}"
            ${fe.placeholder ? `placeholder="${fe.placeholder}"` : ''}
            ${fe.required ? 'required' : ''}
            />`
            case 'select':
                return `<select class="form" 
            name="${name}">
            ${fe.options.map(o => `<option>${o}</option>`).join('')}
            </select>`
            case 'textarea':
                return `<textarea rows="${fe.rows || 10}" cols="${fe.cols || 40}" class="form" 
            name="${name}"
            ${fe.placeholder ? `placeholder="${fe.placeholder}"` : ''}
            ${fe.required ? 'required' : ''}
            ></textarea>`
            case 'checkbox':
                return `<input
            type="checkbox"
            class="checkbox"
            name="${name}"
            ${fe.required ? 'required' : ''}
            />`
        }
    }

    click = e => {
        //debug({ click: this.name })
    }
    input = e => {
        //debug({ input: this.name })
        const data = this._data()
        if (data && data.update) data.update(e)
    }
}
export default Form