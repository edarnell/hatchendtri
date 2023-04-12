import Html, { debug } from './Html'
import { nav } from './Nav.js'
class Div extends Html {
    constructor() {
        super()
    }
    connectedCallback() {
        const { type } = this.attr(), html = this.html()
        if (type === 'this') this.root = true
        if (html) this.innerHTML = this.render(html)
        else debug({ Div: this.attr(), page: nav.page })
    }
    html = () => {
        const root = nav.page, page = root && root.firstChild,
            html = page && page.html
        if (typeof html === 'function') return html(this)
        else debug({ html, page, root })
    }
    disconnectedCallback() {
        this.innerHTML = ''
    }
}
export default Div