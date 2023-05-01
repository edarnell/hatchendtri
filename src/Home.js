import Html, { debug } from './Html'
import html from './html/Home.html'
import home_main from './html/home_main.html'
import news from './html/news.html'

class Home extends Html {
    constructor() {
        super()
    }
    //debug = (m) => debug({ Home: m, o: this.o(), div: this })
    // <div>{link.ENTER_NOW}</div> add back when entries open
    html = (o) => {
        const p = o && o.attr(), name = p && p.name
        if (name === 'home_main') return home_main
        else if (name === 'news') return news
        else return html
    }
}
export default Home
