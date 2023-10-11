import css from './css/combined.css'
import favicon from './icon/jetstream.ico'
import Html, { debug, error } from './Html'
import html from './html/Nav.html'
import { icons } from './icons'
import Home from './Home'
import Details from './Details'
import Results from './Results'
import Data from './Data.js'
import Contact from './Contact'
import User from './User'

const pages = {
    home: { nav: 'Home', href: 'home', tip: 'overview, updates and entry link' },
    details: { nav: 'Details', href: 'details', tip: 'detailed event information' },
    results: { nav: 'Results', href: 'results', tip: 'results from 2000 onwards' },
    volunteer: { nav: 'Volunteer', href: 'volunteer', tip: 'volunteer system' },
    admin: { nav: 'Admin', href: 'admin', tip: 'data admin' },
    competitor: { nav: 'Competitor', href: 'competitor', tip: 'entry system' },
    contact: { icon: 'email', tip: 'contact us', placement: 'bottom-end', strategy: 'fixed' },
    user: { icon: 'user', tip: 'login', placement: 'bottom-end' },
}
const images = ['url("swim.jpg")', 'url("bike.jpg")', 'url("run.jpg")']
class Nav extends Html {
    constructor() {
        super()
        this.nav = this
        this.d = new Data(this)
        this.id = 'nav'
        this.i = Math.floor(Math.random() * 3)
        this.init(css, favicon)
        this.render(this, 'root')
        pages.contact.popup = this.contact
        pages.user.popup = this.user
    }
    contact = () => new Contact()
    user = () => new User()
    html = () => html
    loaded = () => this.load()
    image = () => {
        const bg = this.q('#background')
        bg.style.backgroundImage = images[this.i]
        this.i = (this.i + 1) % 3
    }
    wrap = () => {
        // not sure this is needed now
        constnave = this.shadowRoot.querySelector('.nav')
        if (nav.offsetTop > 40) nav.style.paddingTop = '0px'
        else nav.style.paddingTop = '20px'
    }
    toggle = (active, page) => {
        const l = this.q(`[id*="nav_${page}"]`)
        if (l) {
            if (!active) l.classList.remove('active')
            else if (l.classList) l.classList.add('active')
            else l.classList = ['active']
            if (l.tagName === 'IMG') {
                const img = l.getAttribute('data-image')
                l.src = (!active) ? icons[img].default : icons[img].active
            }
        }
        else error({ toggle: { active, page, l } })
    }
    create(pg) {
        switch (pg) {
            case 'home': return new Home()
            case 'details': return new Details()
            case 'results': return new Results()
            case 'volunteer': this.pages[pg] = new Volunteer(this); break
            case 'vol': this.pages[pg] = new Vol(this); break
            case 'user': this.pages[pg] = new User(this); break
            case 'comp': this.pages[pg] = new Comp(this); break
            case 'admin': this.pages[pg] = new Admin(this); break
            case 'competitor': this.pages[pg] = new Competitor(this); break
            case 'contact': this.pages[pg] = new Contact(this); break
            case 'vselect': this.pages[pg] = new Vselect(this); break
            default: error({ create: { page: pg } })
        }
    }
    load = (pg) => {
        if (!pages[this.path]) this.path = 'home'
        if (pg && pg !== this.path && pages[pg]) {
            //if (this.page) this.unload(this.page)
            this.toggle(false, this.path)
            this.path = pg
        }
        const p = pages[this.path]
        this.page = p.o ?? (p.o = this.create(this.path))
        this.toggle(true, this.path)
        this.render(this.page, 'page')
        history.pushState(null, null, `/${this.path}`);
        this.image()
    }


}
export default Nav
export { pages }