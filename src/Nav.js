import Html from './Html'
import html from './html/Nav.html'
import { icons } from './icons'
import { page, pages } from './Page'
const debug = console.log.bind(console)
const images = ['url("swim.jpg")', 'url("bike.jpg")', 'url("run.jpg")']
let nav
class Nav extends Html {
    constructor() {
        super()
        this.id = 'nav'
        nav = this
    }
    // Add code to run when the element is added to the DOM
    connectedCallback() {
        //debug({ connectedCallback: this.id })
        this.innerHTML = this.render(html)
        this.i = Math.floor(Math.random() * 3)
        const p = window.location.pathname.replace('/', '')
        this.nav(pages[p] ? p : 'home')
    }
    image = () => {
        const bg = this.querySelector('.background-image')
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
        const l = (active) ? this.querySelector('.nav li img.active') || this.querySelector('.nav li a.active')
            : this.querySelector(`.nav li img[name="${page}"]`) || this.querySelector(`.nav li a[name="${page}"]`)
        if (l) {
            if (active) l.classList.remove('active')
            else if (l.classList) l.classList.add('active')
            else l.classList = ['active']
            if (l.tagName === 'IMG') {
                const img = l.getAttribute('data-image')
                l.src = (active) ? icons[img].default : icons[img].active
            }
        }
    }
    nav = (pg) => {
        const _pg = pg && pg.replace('/', ''),
            pg_ = _pg && pages[_pg] ? _pg : 'home'
        //debug({ pg, _pg, page })
        this.image()
        this.toggle(true, this._page)
        this.toggle(false, pg_)
        const p = this.querySelector('.page')
        p.innerHTML = pages[pg_].nav
        this.page = pg_
        if (page) this.page = page.load(pg_) // may not have loaeded yet
    }
}
export { nav }
export default Nav