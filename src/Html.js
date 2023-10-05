/*TODO
resturcture to have single HTMLElement as DOM root
Migrate HTML to be Object DOM with shared methods for data, ajax etc.

render callback - use requestAnimationFrame - called after repaint (ask AI if needed)
element.innerHTML = 'New content';
requestAnimationFrame(() => {
  // Code to run after the next repaint
  console.log('Element has finished rendering');
});
*/

const debug = console.log.bind(console)
import { data } from './data.js'
var nav, page
function set_nav(o) { nav = o }
function set_page(o) { page = o }
function _s(s, p) {
    if (p === undefined) return s && s.replace(/\s/g, "&nbsp;")
    else {
        const r = s && s.replace(/_|&nbsp;|\s/g, " ")
        return r && p ? r.toLowerCase() : r
    }
}

class Html extends HTMLElement {
    static get observedAttributes() {
        return ['param']
    }
    constructor() {
        super()
    }
    attributeChangedCallback(v, o, n) {
        this.debug ? this.debug(`attributeChangedCallback ${o}=>${n}`) : null
        if (o === '' && n === 'update') {
            this.setAttribute('param', '')
            this.disconnectedCallback()
            this.connectedCallback() // update
        }
    }
    //debug = () => debug({ Html: this.o() })
    _upd() {
        this.disconnectedCallback()
        this.connectedCallback()
    }
    disconnectedCallback() {
        this.debug ? this.debug("disconnectedCallback") : null
        if (this.listen) this.listen(false)
        this.innerHTML = ''
    }
    connectedCallback() {
        if (this.innerHTML) this.debug ? this.debug("connectedCallback 1") : null
        else {
            this.debug ? this.debug("connectedCallback 2") : null
            if (this.data) {
                this.debug ? this.debug("data") : null
                data(this.data).then(() => {
                    this.debug ? this.debug("s(data)") : null
                    this.render_html()
                })
                    .catch(e => {
                        this.debug ? this.debug({ "f(data)": e }) : null
                        if (e.res && e.res.status === 401) {
                            nav.login()
                        }
                        else debug({ "f(data)": e })
                    })
            }
            else this.render_html()
        }
    }
    render_html = () => {
        const html = this.html ? this.html() : null
        if (typeof html === 'string') {
            this.render(html, true)
            if (this.listen) this.listen(true)
            const tt = this.parent('tt')
            if (tt && tt.pop) tt.pop.update()
        }
        else debug({ Html: "html(o)=>", o: this.o(), depth: this.depth() })
    }
    depth = () => {
        let d = 0
        let p = this.parentNode
        while (p && p !== document) {
            d++
            p = p.parentNode
        }
        return d
    }
    var_update = () => {
        this.vars.update.forEach(o => o.setAttribute('param', 'update'))
        this.vars.update = []
    }
    page = (a) => {
        return a ? page && page.firstChild[a] : page && page.firstChild
    }
    o = () => {
        return { "o.name": this.attr().name, "o._id()": this._id() }
    }
    attr = () => {
        return {
            name: this.getAttribute("name"),
            type: this.getAttribute("type"),
            param: this.getAttribute("param")
        }
    }
    parent = (type) => {
        let p = this.parentNode
        while (p && !(p.popup && (!type || p[type]))) {
            //if (type === 'close') debug({ p: p.tagName, type: p[type] })
            p = p.parentNode
        }
        return p ? p[type] : p
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
    render = (html, set) => {
        if (typeof html !== 'string') return debug({ html, id: this.id })
        const _html = html.replace(/\{([\w_]+)(?:\.([^\s}.]+))?(?:\.([^\s}]+))?}/g, (match, t, l, c) => {
            if (t === 'page') return `<ed-${l} name="${l}"></ed-${l}>`
            else if (t === 'div') return `<ed-div type="${t}" name="${l}" param="${c || ''}"></ed-div>`
            else if (t === 'table') return `<ed-table type="${t}" name="${l}" param="${c || ''}"></ed-table>`
            else if (t === 'var') return `<ed-var type="${t}" name="${l}" param="${c || ''}"></ed-var>`
            else if (t === 'vol') return `<ed-vol type="${t}" name="${l}" param="${c || ''}"></ed-vol>`
            else if (t === 'vsel') return `<ed-vsel type="${t}" name="${l}" param="${c || ''}"></ed-vsel>`
            else if (t === 'user') return `<ed-user type="${t}" name="user" param="${c || ''}"></ed-user>`
            else if (t === 'comp') return `<ed-comp type="${t}" name="${l}" param="${c || ''}"></ed-comp>`
            else if (t === 'contact') return `<ed-contact type="${t}" name="${l}" param="${c || ''}"></ed-contact>`
            else if (['input', 'select', 'checkbox', 'textarea', 'button', 'radio'].indexOf(t) !== -1) {
                return `<ed-form type="${t}" name="${l}" param="${c || ''}"></ed-form>`
            }
            else if (['nav', 'svg', 'link'].indexOf(t) !== -1) {
                return `<ed-tt type="${t}" name="${l}" param="${c || ''}"></ed-tt>`
            }
            else return match
        })
        if (set) {
            // debug({ html, id: this.id, set, this: this.debug() })
            this.innerHTML = _html
            //this.var_update()
        }
        else return _html
    }
    setForm = (vs, form) => {
        if (vs) Object.keys(vs).filter(k => !form || form[k]).forEach(k => {
            const fe = this.querySelector(`ed-form[name=${k}]`),
                l = fe && fe.querySelector('input, select, textarea')
            if (l) {
                if (l.type === 'checkbox' || l.type === 'radio') l.checked = vs[k]
                else l.value = vs[k]
            }
            else debug({ setForm: this.o(), k })
        })
        else debug({ setForm: this.o(), vs })
    }
    getForm = (form) => {
        let ret = {}
        if (form) Object.keys(form).forEach(name => {
            const fe = this.querySelector(`ed-form[name=${name}]`),
                l = fe && fe.querySelector('input, select, textarea')
            if (l) ret[name] = l.type === 'checkbox' || l.type === 'radio' ? l.checked : l.value
        })
        else debug({ setForm: this.o(), form })
        return ret
    }
}
export default Html
export { debug, nav, page, set_nav, set_page, _s }