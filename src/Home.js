import html from './html/Home.html'
import home_main from './html/home_main.html'
import news from './html/news.html'

class Home {
    //debug = (m) => debug({ Home: m, o: this.o(), div: this })
    // <div>{link.ENTER_NOW}</div> add back when entries open
    constructor(parent) {
        this.parent = parent
        id = 'home'
    }
    html = (name) => {
        if (name === 'home_main') return home_main
        else if (name === 'news') return news
        else return html
    }
}
export default Home
