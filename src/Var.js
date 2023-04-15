import Html, { debug } from './Html'
class Var extends Html {
    constructor() {
        super()
    }
    connectedCallback() {
        const _var = this.var()
        if (typeof _var === 'string') this.innerHTML = this.render(_var)
        else debug({ Var: "define var=(o)=>", "o.name": this.attr().name, "o._id()": this._id() })
    }

    var = () => {
        const pvar = this.page('var')
        if (typeof pvar === 'function') return pvar(this)
    }
    disconnectedCallback() {
        this.innerHTML = ''
    }
}
export default Var