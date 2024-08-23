import Html from './Html.mjs'
import html from './html/Details.html'
import details_main from './html/details_main.html'
import news from './html/news.html'

class Details extends Html {
    constructor() {
        super()
        this.page = this
        this.id = 'details'

    }
    html = (name) => {
        if (name === 'details_main') return details_main
        else if (name === 'news') return news
        else return html
    }
}
export default Details