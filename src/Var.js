import Html, { debug, nav } from './Html'
class Var extends Html {
    constructor() {
        super()
    }
    html() {
        const _var = this.var()
        if (typeof _var === 'string') return this.render(_var)
        else debug({ Var: "define var=(o)=>", o: this.o() })
    }

    var = () => {
        const pvar = this.parent('var') || this.page('var')
        if (typeof pvar === 'function') return pvar(this)
        else if (this.attr().name === 'name') return nav.name()
    }
}
export default Var