import Html, { debug } from './Html'
import html from './html/Home.html'
import home_main from './html/home_main.html'
import news from './html/news.html'

class Home extends Html {
    constructor() {
        super()
    }
    html = (o) => {
        const { name } = o.attr()
        if (name === 'home_main') return home_main
        else if (name === 'news') return news
    }
    connectedCallback() {
        this.innerHTML = this.render(html)
    }
    disconnectedCallback() {
        this.innerHTML = ''
    }
}
export default Home
