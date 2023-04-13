import Html, { debug } from './Html'
import { nav } from './Nav.js'
class Var extends Html {
    constructor() {
        super()
    }
    connectedCallback() {
        const _var = this.var()
        if (_var) this.innerHTML = this.render(_var)
        else debug({ var: `define ${_var ? '' : 'var=(o)=>'}`, "o.name": this.attr().name, "o._id()": this._id() })
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