import Html from './Html'
class Div extends Html {
    constructor() {
        super()
    }
    //debug = (m) => this.debug({ Div, m: this.o(), depth: this.depth() })
    html = () => {
        const f = this.parent('html') || this.page('html')
        if (typeof f === 'function') {
            const html = f(this)
            if (typeof html === 'string') return html
        }
    }
}
export default Div