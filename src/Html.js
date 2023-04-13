const debug = console.log.bind(console)

class Html extends HTMLElement {
    constructor() {
        super()
    }
    /*
    connectedCallback() {}
    disconnectedCallback() {}
    attributeChangedCallback(name, oldValue, newValue) {} // perhaps use to update
    html = (o) => { const { name,type,param } = o.attr(); debug({ html: o.attr(),_id:o._id })
    ths = (o) => { const { name,type,param } = o.attr(); debug({ ths: o.attr(),_id:o._id })
    trs = (o) => { const { name,type,param } = o.attr(); debug({ trs: o.attr(),_id:o._id })
    form = (o) => { const form={name:{}},{ name,type,param } = o.attr(); debug({ form: o.attr(),_id:o._id,form })
    */
    attr = () => {
        return {
            name: this.getAttribute("name"),
            type: this.getAttribute("type"),
            param: this.getAttribute("param")
        }
    }
    _id = () => {
        let p = this, c, id = ''
        while (p) {
            if (p.tagName && p.tagName.startsWith('ED-')) {
                const { name } = p.attr()
                if (c) {
                    let n
                    const { name: cname } = c.attr(),
                        os = p.querySelectorAll(`${c.tagName}[name=${cname}]`)
                    if (os.length) os.forEach((o, i) => { if (o === c) n = i })
                    else (n = 0)
                    if (!os || name === cname || n) {
                        // const warn= add specific warning code about naming
                        debug({ warn: '_id', p: `${p.tagName} ${name}`, c: `${c.tagName} ${cname}`, os: os.length, n })
                    }
                    if (n > 0) id += `_${n}`
                }
                id = id ? name + '_' + id : name
                c = p
            }
            p = p.parentNode
        }
        return id
    }
    render = (html) => {
        if (typeof html !== 'string') return debug({ html, id: this.id })
        const _html = html.replace(/\{([\w_]+)(?:\.([^\s}.]+))?(?:\.([^\s}]+))?}/g, (match, t, l, c) => {
            if (t === 'page') return `<ed-${l} name="${l}"></ed-${l}>`
            else if (t === 'div' || t === 'this') return `<ed-div type="${t}" name="${l}" param="${c || ''}"></ed-div>`
            else if (t === 'table') return `<ed-table type="${t}" name="${l}" param="${c || ''}"></ed-table>`
            else if (t === 'var') return `<ed-var type="${t}" name="${l}" param="${c || ''}"></ed-var>`
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