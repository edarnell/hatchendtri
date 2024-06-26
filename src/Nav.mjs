import css from './css/combined.css'
import favicon from './icon/jetstream.ico'
import Html, { debug, error, dbg } from './Html.mjs'
import html from './html/Nav.html'
import { icons } from './icons.mjs'
import Data from './Data.mjs'
import { apage } from './Admin.mjs'
import { ajax } from './ajax.mjs'
import manifest from '../public/manifest.json'
const version = manifest.version

const images = ['url("swim.jpg")', 'url("bike.jpg")', 'url("run.jpg")']
var nav
class Nav extends Html {
    constructor() {
        super()
        this.pages = {
            home: { nav: 'Home', href: 'home', tip: this.tt, tt: 'overview, updates and entry link' },
            details: { nav: 'Details', href: 'details', tip: this.tt, tt: 'detailed event information' },
            results: { nav: 'Results', href: 'results', tip: this.tt, tt: 'previous results' },
            volunteer: { nav: 'Volunteer', hide: true, href: 'volunteer', tip: 'volunteer system' },
            admin: { nav: 'Admin', page: () => apage('email'), hide: true, href: 'admin', tip: 'data admin' },
            competitor: { nav: 'Competitor', hide: true, href: 'competitor', tip: 'entry system' },
            contact: { popup: 'Contact', icon: 'email', tip: this.tt, tt: 'contact us', placement: 'bottom-end' },
            user: { popup: 'User', icon: 'user', tip: this.tt, tt: 'user', placement: 'bottom-end' },
        }
        this.d = new Data(this)
        this.id = 'nav'
        this.init(css, favicon)
        import('./Objects.mjs').then(m => {
            const H = new m.default()
            this.O = H.O
            nav = this
            this.path()
            this.i = Math.floor(Math.random() * 3)
            this.render(this, 'root')
        })
    }
    var = (n) => {
        if (n === 'testing') {
            if (this._logout) return '<div id="_logout" style="display: none;">logged out</div>'
            else return ''
        }
    }
    path = () => {
        const jcI = localStorage.getItem('HEcI'),
            cI = this.cI = jcI ? JSON.parse(jcI) : {} // client info - including user token
        if (cI.token === undefined) {
            const token = localStorage.getItem('HEtoken')
            localStorage.clear()
            if (token) cI.token = token
            else cI.token = null
        }
        if (!cI.v || cI.v !== version) {
            const now = new Date()
            cI.v = version
            cI.ts = now.toISOString()
        }
        const hash = window.location.hash, token = hash && hash.substring(1)
        window.location.hash = ''
        this.path = window.location.pathname.replace('/', '')
        if (this.path === 'logout') {
            if (this._logout = cI.token ? true : false) cI.token = null
            if (hash === '#clear') localStorage.clear()
        }
        else if (token && token.length > 10) cI.token = token
        if (this.path === 'register' || this.path === 'unsubscribe' || this.path === 'subscribe') this._path = this.path
        localStorage.setItem('HEcI', JSON.stringify(cI))
    }
    html = (n) => {
        // ${this.path === 'admin' ? '{select.admin}' : ''}
        if (n === 'nav_admin') return `<span id="nav_admin"></div>`
        else return html
    }
    image = () => {
        const bg = this.q('#background')
        bg.style.backgroundImage = images[this.i]
        this.i = (this.i + 1) % 3
    }
    rendered = () => {
        this.user().then(r => {
            this.userIcon(r)
            this.load()
            if (this._path) this.q(`[id*="TT_user_nav"]`).click()
        }).catch(() => {
            this.userIcon(false)
            this.load()
        })
    }
    wrap = () => {
        // not sure this is needed now
        constnave = this.shadowRoot.querySelector('.nav')
        if (nav.offsetTop > 40) nav.style.paddingTop = '0px'
        else nav.style.paddingTop = '20px'
    }
    toggle = (active, path) => {
        const p = this.pages[path], l = this.q(`[id*="TT_${path}_nav"]`)
        if (l) {
            if (!active) {
                l.classList.remove('active')
                if (l.classList.length === 0) l.removeAttribute('class') // better for testing
            }
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
        dbg({ load: pg })
        if (!this.pages[this.path]) this.path = 'home'
        if (pg && pg !== this.path && this.pages[pg]) {
            this.toggle(false, this.path)
            this.path = pg
        }
        const p = this.pages[this.path], pe = this.q('#nav_page')
        pe.innerHTML = p.nav
        this.page = p.page ? p.page() : this.O(p.nav)
        this.toggle(true, this.path)
        this.render(this.page, 'page')
        history.pushState(null, null, this.path === 'home' ? '/' : `/${this.path}`);
        this.image()
        if (pg) this.user().then(r => this.userIcon(r, pg))
    }
    userIcon = (set, close) => {
        if (set !== undefined) {
            this._user = set
            const l = this.q(`[id*="icon_TT_user_nav"]`)
            l.src = (this._user) ? icons['user'].active : l.src = icons['user'].default
            // TODO - should ideally refresh tt if hovered
        }
        { }
        const lo = close && this.q(`[id*="TT_user_nav"]`), o = lo && this.tt[lo.id]
        if (o && o.pdiv) o.close()
    }
    user = () => {
        return new Promise((s, f) => {
            const token = this.cI.token
            if (token) ajax({ req: 'user' }).then(r => {
                s(r.u) // user or null (no vol or comp)
            }).catch(e => {
                error({ e })
                if (!e.reload) {
                    this.cI.token = null
                    localStorage.setItem('HEcI', JSON.stringify(this.cI))
                }
                f(e)
            })
            else {
                s(false) // undefined (no token)
            }
        })
    }
    logout = (e, o) => {
        dbg('logout')
        this.cI.token = null
        localStorage.setItem('HEcI', JSON.stringify(this.cI))
        this.userIcon(false, true)
        this.load('home')
    }
    tt = (n, t) => {
        const tt = t.lk.tt
        this.user().then(r => this.userIcon(r, tt !== 'user'))
        dbg({ tt })
        if (tt === 'user') {
            const u = this._user, name = u ? u.first + ' ' + u.last : '', a = u && u.aed
            return a ? `<span class='red'>${name}</span>` : name || 'login or register'
        }
        else return tt
    }
}
export default Nav
export { nav, debug, error }