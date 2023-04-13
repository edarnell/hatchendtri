import Html, { debug } from './Html'
import { nav } from './Nav.js'
class Var extends Html {
    static get observedAttributes() {
        return ['param']
    }
    constructor() {
        super()
    }
    connectedCallback() {
        const _var = this.var()
        if (_var) this.innerHTML = this.render(_var)
        else debug({ var: `define ${_var ? '' : 'var=(o)=>'}`, "o.name": this.attr().name, "o._id()": this._id() })
    }
    attributeChangedCallback(v, o, n) {
        if (v === 'param' && o === 'update' && n === '') this.connectedCallback() // update
    }
    var = () => {
        const root = nav.page, page = root && root.firstChild,
            pvar = page && page.var
        if (typeof pvar === 'function') return pvar(this)
    }
    disconnectedCallback() {
        this.innerHTML = ''
    }
}
export default Var