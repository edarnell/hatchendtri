import Html from './Html'
import nav from './html/Nav.html'
import css from './css/Nav.css'
import swim from './res/swim.jpg'
import bike from './res/bike.jpg'
import run from './res/run.jpg'
const debug = console.log.bind(console)
let pages = {}, navfunc
import Home from './Home'

const replace = {}
const navlinks = {
    home: { href: '#home', text: 'Home', tip: 'overview, updates and entry link' },
    details: { href: '#details', text: 'Details', tip: 'detailed event information' },
    results: { href: '#results', text: 'Results', tip: 'results from 2000 onwards' },
    volunteer: { href: '#volunteer', text: 'Volunteer', tip: 'volunteer system' },
    contact: { href: '#contact', text: 'Contact', tip: 'contact us' }
}
const images = [swim, bike, run]

class Nav extends Html {
    constructor() {
        super(nav, css, replace, navlinks)
        this.i = Math.floor(Math.random() * 3)
        navfunc = this.nav
        window.addEventListener('load', () => {
            this.image()
            this.wrap()
            this.watchNav()
        })
        window.addEventListener('resize', this.wrap)
    }
    image = () => {
        const root = this.shadowRoot, t = root.querySelector('.background-image')
        t.style.backgroundImage = `url(${images[this.i]})`
        this.i = (this.i + 1) % 3
    }
    wrap = () => {
        const root = this.shadowRoot, nav = root.querySelector('.nav')
        if (nav.offsetTop > 40) nav.style.paddingTop = '0px'
        else nav.style.paddingTop = '20px'
    }
    nav = (page) => {
        const root = this.shadowRoot,
            c = root.querySelector('.nav li a.active'),
            p = root.querySelector('.page'),
            l = this.links[page]
        if (c) c.classList.remove('active')
        if (l.classList) l.classList.add('active')
        else l.classList = ['active']
        p.innerHTML = navlinks[page].text
        this.page(page)
        this.image()
    }
    page = (pg) => {
        const el = document.getElementById('page')
        let p
        switch (pg) {
            default:
            case 'home':
                if (pages['home']) p = pages['home']
                else {
                    customElements.define('he-home', Home)
                    pages['home'] = p = document.createElement('he-home')
                }
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
        this.nav(navs[0].name)
    }
}
export { navlinks, navfunc as nav }
export default Nav