import css from './css/combined.css'
import favicon from './icon/jetstream.ico'
import Html, { debug, error } from './Html'
import html from './html/Nav.html'
import { icons } from './icons'
import Data from './Data.js'

const images = ['url("swim.jpg")', 'url("bike.jpg")', 'url("run.jpg")']
var nav
class Nav extends Html {
    constructor() {
        super()
        this.pages = {
            home: { nav: 'Home', href: 'home', tip: 'overview, updates and entry link' },
            details: { nav: 'Details', href: 'details', tip: 'detailed event information' },
            results: { nav: 'Results', href: 'results', tip: 'results from 2000 onwards' },
            volunteer: { nav: 'Volunteer', hide: true, href: 'volunteer', tip: 'volunteer system' },
            admin: { nav: 'Admin', hide: true, href: 'admin', tip: 'data admin' },
            competitor: { nav: 'Competitor', hide: true, href: 'competitor', tip: 'entry system' },
            contact: { popup: 'Contact', icon: 'email', tip: this.ctt, placement: 'bottom-end' },
            user: { popup: 'User', icon: 'user', tip: this.tt, placement: 'bottom-end' },
        }
        this.d = new Data(this)
        this.id = 'nav'
        this.i = Math.floor(Math.random() * 3)
        this.init(css, favicon)
        import('./Objects.js').then(m => {
            const H = new m.default()
            this.O = H.O
            nav = this
            this.d.user().then(r => {
                this._user = r
                this.render(this, 'root')
            })
        })
    }
    html = () => html
    image = () => {
        const bg = this.q('#background')
        bg.style.backgroundImage = images[this.i]
        this.i = (this.i + 1) % 3
    }
    rendered = () => {
        this.userIcon(this._user)
        this.load()
    }
    wrap = () => {
        // not sure this is needed now
        constnave = this.shadowRoot.querySelector('.nav')
        if (nav.offsetTop > 40) nav.style.paddingTop = '0px'
        else nav.style.paddingTop = '20px'
    }
    toggle = (active, path) => {
        const p = this.pages[path], l = this.q(`[id*="TT_${path}_nav"]`)
        this.userIcon()
        if (l) {
            if (!active) l.classList.remove('active')
            else if (l.classList) l.classList.add('active')
            else l.classList = ['active']
            if (l.tagName === 'IMG') {
                const img = l.getAttribute('data-image')
                l.src = (!active) ? icons[img].default : icons[img].active
            }
        }
        else if (!p.hide) error({ toggle: { active, page, l } })
    }
    load = (pg) => {
        if (!this.pages[this.path]) this.path = 'home'
        if (pg && pg !== this.path && this.pages[pg]) {
            this.toggle(false, this.path)
            this.path = pg
        }
        const p = this.pages[this.path], pe = this.q('#nav_page')
        this.page = this.O(p.nav)
        this.toggle(true, this.path)
        this.render(this.page, 'page')
        pe.innerHTML = p.nav
        history.pushState(null, null, `/${this.path}`);
        this.image()
        if (pg) this.checkUser()
    }
    userIcon = (set) => {
        if (set !== undefined) {
            this._user = set
            const l = this.q(`[id*="icon_TT_user_nav"]`)
            l.src = (this._user) ? icons['user'].active : l.src = icons['user'].default
        }
        const lo = this.q(`[id*="TT_user_nav"]`), o = lo && this.tt[lo.id]
        if (o && o.pdiv) o.close()
    }
    checkUser() { // check for logout/login elsewhere
        return new Promise((s, f) => {
            const token = localStorage.getItem('HEtoken')
            if (this._user !== false && !token) {
                this.logout() // logout elsewhere
                s()
            }
            else if (token && this._user === false) this.login().then(() => s())
        })
    }
    logout = (e, o) => {
        localStorage.removeItem('HEtoken')
        this.userIcon(false)
        this.load()
    }
    ctt = () => {
        this.checkUser()
        return 'contact us'
    }
    tt = () => {
        this.checkUser()
        const u = this.d.name(), a = this.d.admin()
        return a ? `<span class='red'>${u}</span>` : u || 'login'
    }
}
export default Nav
export { nav }