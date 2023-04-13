import Html from './Html'
import Nav, { nav } from './Nav'
import Home from './Home'
import Details from './Details'
import Results from './Results'
import Volunteer from './Volunteer'
import Competitor from './Competitor'
import Contact from './Contact'
import { custom_html } from './custom_html'
const debug = console.log.bind(console)
const pages = {
    home: { nav: 'Home', href: 'home', tip: 'overview, updates and entry link' },
    details: { nav: 'Details', href: 'details', tip: 'detailed event information' },
    results: { nav: 'Results', href: 'results', tip: 'results from 2000 onwards' },
    volunteer: { nav: 'Volunteer', href: 'volunteer', tip: 'volunteer system' },
    competitor: { nav: 'Competitor', href: 'competitor', tip: 'entry system' },
    contact: { nav: 'Contact', icon: 'email', href: 'contact', tip: 'contact us' },
}
function custom_pages() {
    customElements.define("ed-nav", Nav)
    customElements.define("ed-page", Page)
    customElements.define("ed-home", Home)
    customElements.define("ed-details", Details)
    customElements.define("ed-results", Results)
    customElements.define("ed-volunteer", Volunteer)
    customElements.define("ed-competitor", Competitor)
    customElements.define("ed-contact", Contact)
    custom_html()
}
class Page extends Html {
    constructor() {
        super()
        this.pages = pages
        this.id = 'page'
    }
    // Add code to run when the element is added to the DOM
    connectedCallback() {
        //debug({ page: nav.page })
        this.load(nav.page)
    }
    load = (page) => {
        if (page !== this.page && pages[page]) {
            if (!this.page) nav.page = this
            this.page = page
            this.innerHTML = this.render(`{page.${page}}`)
            history.pushState(null, null, `/${page}`);
        }
        else debug({ load: { page, this_page: this.page } })
    }
}
export { pages, custom_pages }