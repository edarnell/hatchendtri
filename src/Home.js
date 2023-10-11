import Html from './Html.js'
import html from './html/Home.html'
import home_main from './html/home_main.html'
import news from './html/news.html'

class Home extends Html {
    // <div>{link.ENTER_NOW}</div> add back when entries open
    constructor() {
        super()
        this.id = 'home'
        this.page = this
    }
    html = (name) => {
        if (name === 'home_main') return home_main
        else if (name === 'news') return news
        else return html
    }
}
export default Home
