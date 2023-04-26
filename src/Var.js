import Html, { debug } from './Html'
class Var extends Html {
    constructor() {
        super()
    }
    html() {
        const _var = this.var()
        if (typeof _var === 'string') return _var
        else debug({ Var: "define var=(o)=>", o: this.o() })
    }

    var = () => {
        const pvar = this.parent('var') || this.page('var')
        if (typeof pvar === 'function') return pvar(this)
    }
}
export default Var