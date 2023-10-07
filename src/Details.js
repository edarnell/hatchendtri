import html from './html/Details.html'
import details_main from './html/details_main.html'
import news from './html/news.html'

class Details {
    constructor(page) {
        this.page = page
    }
    html = (name) => {
        if (name === 'details_main') return details_main
        else if (name === 'news') return news
        else return html
    }
    id = () => 'details'
}
export default Details