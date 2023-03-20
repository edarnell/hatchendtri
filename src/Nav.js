import Html from './Html'
import nav_ from './html/Nav.html'
import css from './css/Nav.css'
import jetstream from './res/JetStream.png'
const debug = console.log.bind(console)
let pages = {}, nav
import Home from './Home'
import Details from './Details'
import Results from './Results'
import Volunteer from './Volunteer'
import Contact from './Contact'
import icons from './icons'
const js = { home: Home, docs: Details, results: Results, help: Volunteer, contact: Contact }

const images = ['url("swim.jpg")', 'url("bike.jpg")', 'url("run.jpg")']

const replace = { jetstream }

class Nav extends Html {
    constructor() {
        super(nav_, css, replace)
        this.i = Math.floor(Math.random() * 3)
        nav = this.nav
        window.addEventListener('load', () => {
            this.image()
            this.wrap()
            //this.watchNav()
            const p = window.location.hash
            this.nav(p || 'home')
        })
        window.addEventListener('resize', this.wrap)
    }
    image = () => {
        const root = this.shadowRoot, t = root.querySelector('.background-image')
        t.style.backgroundImage = images[this.i]
        this.i = (this.i + 1) % 3
    }
    wrap = () => {
        const root = this.shadowRoot, nav = root.querySelector('.nav')
        if (nav.offsetTop > 40) nav.style.paddingTop = '0px'
        else nav.style.paddingTop = '20px'
    }
    nav = (pg) => {
        const page = pg.replace('#', '')
        //debug({ nav: page, pg })
        const root = this.shadowRoot, p = root.querySelector('.page'),
            c = root.querySelector('.nav li a.active') || root.querySelector('.nav li img.active'),
            l = root.querySelector(`.nav li a[name="${page}"]`) || root.querySelector(`.nav li img[name="${page}"]`)
        if (c && c.classList) {
            c.classList.remove('active')
            const name = c.getAttribute('name')
            if (c.tagName === 'IMG') c.src = icons[name].default
        }
        else debug({ c, page })
        if (l) {
            if (l.classList) l.classList.add('active')
            else l.classList = ['active']
            if (l.tagName === 'IMG') l.src = icons[page].active
        }
        else debug({ l, page })
        p.innerHTML = page.charAt(0).toUpperCase() + page.substring(1)
        this.page(page)
        this.image()
    }
    page = (pg) => {
        const el = document.getElementById('page')
        if (el.firstChild) el.firstChild.removeLinks()
        let p
        if (pages[pg]) {
            p = pages[pg]
            p.watchLinks()
        }
        else {
            const he = 'he-' + pg
            //debug({ he, pg, js })
            customElements.define(he, js[pg])
            p = pages[pg] = document.createElement(he)
        }
        if (el.firstChild) el.replaceChild(p, el.firstChild)
        else el.appendChild(p)
    }
    watchNav = () => {
        const root = this.shadowRoot,
            navs = root.querySelectorAll('.nav a')
        this.links = {}
        navs.forEach(l => {
            this.links[l.name] = l
            l.addEventListener('click', () => this.nav(l.name))
        })
    }
}
export { nav }
export default Nav