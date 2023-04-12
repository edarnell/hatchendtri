import Html, { debug } from './Html'
import html from './html/Details.html'
import details_main from './html/details_main.html'
import news from './html/news.html'

class Details extends Html {
    constructor() {
        super()
    }
    html = (o) => {
        const { name } = o.attr()
        if (name === 'details_main') return details_main
        else if (name === 'news') return news
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