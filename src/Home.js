import Html from './Html'
import home from './html/Home.html'
import home_main from './html/home_main.html'
import news from './html/news.html'
import css from './css/Home.css'
const debug = console.log.bind(console)

const replace = { home_main, news }

class Home extends Html {
    constructor() {
        super(home, css, replace)
    }
}
export default Home
