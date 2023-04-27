import Html, { debug } from './Html'
class Div extends Html {
    constructor() {
        super()
    }
    //debug = (m) => debug({ Div: m, o: this.o(), div: this })
    html = () => {
        const f = this.parent('html') || this.page('html')
        if (typeof f === 'function') {
            const html = f(this)
            if (typeof html === 'string') return html
        }
    }
}
export default Div