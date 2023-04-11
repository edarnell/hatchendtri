const debug = console.log.bind(console)

class Html extends HTMLElement {
    constructor() {
        super()
    }
    /*
    connectedCallback() {
        debug({ connectedCallback: this })
    }
    disconnectedCallback() {
        // Add code to run when the element is removed from the DOM
        debug({ disconnectedCallback: this })
    }
    attributeChangedCallback(name, oldValue, newValue) {
        // Add code to run when an attribute of the element is changed
        debug({ attributeChangedCallback: this, name, oldValue, newValue })
    }
    */
    init = (p) => {

    }
    sleep = () => {
        //this.removeWatch()
        this._html.remove()
    }
    resume = () => {
        this.root.appendChild(this.html)
        //this.resumeWatch()
    }
    _data = () => {
        let p = this, data = p.data
        while (p && !data) {
            p = p.parentNode
            data = p && p.data
        }
        return data
    }
    render = (html) => {
        if (!html || typeof html !== 'string') return debug({ error: 'no html', html, id: this.id })
        const _html = html.replace(/\{([\w_]+)(?:\.([^\s}.]+))?(?:\.([^\s}]+))?}/g, (match, t, l, c) => {
            if (t === 'div' || t === 'this') {
                return `<ed-div type="${t}" name="${l}" param="${c || ''}"></ed-div>`
            }
            else if (t === 'table') {
                return `<ed-table name="${l}" param="${c || ''}"></ed-table>`
            }
            else if (['input', 'select', 'checkbox', 'textarea'].indexOf(t) !== -1) {
                return `<ed-form type="${t}" name="${l}" param="${c || ''}"></ed-form>`
            }
            else if (['nav', 'svg', 'link', 'button'].indexOf(t) !== -1) {
                return `<ed-tt type="${t}" name="${l}" param="${c || ''}"></ed-tt>`
            }
            else return match
        })
        return _html
    }
    setForm = (vs) => {
        const data = this._data(), form = data && data.form
        if (vs && form) Object.keys(vs).forEach(name => {
            const fe = this.querySelector(`ed-form[name=${name}]`),
                l = fe && fe.firstChild
            if (l && l.tagName !== "BUTTON" && vs[name] !== undefined) l.value = vs[name]
        })
        else debug({ error: { vs, form } })
        debug({ setForm: { vs, form } })
    }
    getForm = () => {
        const ret = {}, data = this._data(), form = data && data.form
        if (form) Object.keys(form).forEach(name => {
            const fe = this.querySelector(`ed-form[name=${name}]`),
                l = fe && fe.firstChild, opts = form[name].options
            if (l && l.type === 'checkbox') ret[name] = l.checked
            else if (l && l.tagName !== "BUTTON") ret[name] = opts && l.value === opts[0] ? '' : l.value
        })
        return ret
    }
}
export default Html
export { debug }