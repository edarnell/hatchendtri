import Html from './Html'
import html from './html/Details.html'
import details_main from './html/details_main.html'
import news from './html/news.html'
const debug = console.log.bind(console)

class Details extends Html {
    constructor() {
        super()
        this.data = { divs: { details_main, news } }
        this.id = 'details'
    }
    connectedCallback() {
        //debug({ connectedCallback: this.id })
        this.innerHTML = this.render(html)
    }
    disconnectedCallback() {
        // Add code to run when the element is removed from the DOM
        //debug({ disconnectedCallback: this.id })
        this.innerHTML = ''
    }
}
export default Details