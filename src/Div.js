import Html from './Html'
class Div extends Html {
    constructor() {
        super()
    }
    html = () => {
        const f = this.page('html')
        if (typeof f === 'function') {
            const html = f(this)
            if (typeof html === 'string') return html
        }
    }
}
export default Div