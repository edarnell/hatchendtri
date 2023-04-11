import Html, { debug } from './Html'
import { page } from './Page'
class Div extends Html {
    constructor() {
        super()
    }
    connectedCallback() {
        // Add code to run when the element is added to the DOM
        const pg = page.firstChild,
            name = this.getAttribute("name"),
            type = this.getAttribute("type"),
            param = this.getAttribute("param")
        //debug({ Div: { parent: parent.id, type, name, param } })
        if (type === 'this') {
            const f = pg[name]
            this.data = f && typeof f === 'function' && f(param)
            if (this.data) this.innerHTML = this.render(this.data.html)
            else debug({ error: 'no data', div: name, parent: parent.id })
        }
        else {
            const data = this._data(), divs = data && data.divs, html = divs && divs[name]
            if (html) this.innerHTML = this.render(html)
            else debug({ error: 'no html', div: name, pg: pg.id })
        }
    }
    disconnectedCallback() {
        // Add code to run when the element is removed from the DOM
        //debug({ disconnectedCallback: this })
        this.innerHTML = ''
    }
}
export default Div