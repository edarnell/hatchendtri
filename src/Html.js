const debug = console.log.bind(console)

class Html extends HTMLElement {
    constructor() {
        super()
    }
    /*
    connectedCallback() {}
    disconnectedCallback() {}
    attributeChangedCallback(name, oldValue, newValue) {}
    */
    attr = () => {
        return {
            name: this.getAttribute("name"),
            type: this.getAttribute("type"),
            param: this.getAttribute("param")
        }
    }
    _p = () => {
        let p = this
        while (p && !p.root) {
            p = p.parentNode
        }
        return p
    }
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
    render = (html) => {
        if (!html || typeof html !== 'string') return debug({ error: 'no html', html, id: this.id })
        const _html = html.replace(/\{([\w_]+)(?:\.([^\s}.]+))?(?:\.([^\s}]+))?}/g, (match, t, l, c) => {
            if (t === 'page') return `<ed-${l} name="${l}"></ed-${l}>`
            else if (t === 'div' || t === 'this') return `<ed-div type="${t}" name="${l}" param="${c || ''}"></ed-div>`
            else if (t === 'table') return `<ed-table name="${l}" param="${c || ''}"></ed-table>`
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
    setForm = (vs, form) => {
        if (vs && form) Object.keys(vs).forEach(name => {
            const fe = this.querySelector(`ed-form[name=${name}]`),
                l = fe && fe.firstChild
            if (l && l.tagName !== "BUTTON" && vs[name] !== undefined) l.value = vs[name]
        })
        else debug({ error: { vs, form } })
        debug({ setForm: { vs, form } })
    }
    getForm = (form) => {
        let ret = {}
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