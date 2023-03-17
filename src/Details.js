import Html from './Html'
import details from './html/Details.html'
import details_main from './html/details_main.html'
import news from './html/news.html'
import css from './css/Details.css'
const debug = console.log.bind(console)

const replace = { details_main, news }

class Details extends Html {
    constructor() {
        super(details, css, replace)
    }
}
export default Details