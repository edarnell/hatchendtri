import Html, { debug } from './Html'
class Div extends Html {
    constructor() {
        super()
    }
    connectedCallback() {
        const { type } = this.attr(), html = this.html()
        if (html) this.innerHTML = this.render(html)
        else debug({ Div: "define html(o)=>{}", "o.name()": this.attr().name, "o._id()": this._id() })
    }
    html = () => {
        const html = this.page('html')
        if (typeof html === 'function') return html(this)
    }
    disconnectedCallback() {
        this.innerHTML = ''
    }
}
export default Div