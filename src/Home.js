import Html, { debug } from './Html'
import html from './html/Home.html'
import home_main from './html/home_main.html'
import news from './html/news.html'

class Home extends Html {
    constructor() {
        super()
        this.data = { divs: { home_main, news } }
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
export default Home
