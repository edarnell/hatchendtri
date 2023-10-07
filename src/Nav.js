import css from './css/combined.css'
import favicon from './icon/jetstream.ico'
import { Html, debug, dom } from './Dom'
import html from './html/Nav.html'
import { icons } from './icons'
import Page from './Page'
const pages = {
    home: { nav: 'Home', href: 'home', tip: 'overview, updates and entry link' },
    details: { nav: 'Details', href: 'details', tip: 'detailed event information' },
    results: { nav: 'Results', href: 'results', tip: 'results from 2000 onwards' },
    volunteer: { nav: 'Volunteer', href: 'volunteer', tip: 'volunteer system' },
    admin: { nav: 'Admin', href: 'admin', tip: 'data admin' },
    competitor: { nav: 'Competitor', href: 'competitor', tip: 'entry system' },
    contact: { popup: `{contact}`, icon: 'email', href: 'contact', tip: 'contact us', placement: 'bottom-end', strategy: 'fixed' },
    user: { popup: `{user}`, icon: 'user', tip: 'login', placement: 'bottom-end' },
}
const images = ['url("swim.jpg")', 'url("bike.jpg")', 'url("run.jpg")']
class Nav extends Html {
    constructor() {
        super()
        this.i = Math.floor(Math.random() * 3)
        pages.user.tip = this.tt
        this.page = new Page(this)
        this.init(css, favicon)
        this.render(html, null, this.nav)
        this.id = 'nav'
    }
    /*listen = () => {
        const hash = window.location.hash, token = hash && hash.substring(1)
        if (token && token.length > 10) {
            localStorage.setItem('token', token)
            window.location.hash = ''
        }
        const p = window.location.pathname.replace('/', '')
        this.user()
        if (token && p === 'yes' || p === 'no') {
            this.reply = p
            this.nav('volunteer')
        }
        else this.nav(p)
    }*/
    image = () => {
        const bg = this.querySelector('#background')
        bg.style.backgroundImage = images[this.i]
        this.i = (this.i + 1) % 3
    }
    tt = () => {
        const u = this._user
        if (u && (u.vol || u.comp)) {
            if (page._page === 'competitor' && u.comp) return Object.values(u.comp).map(c => `<div>${c.first} ${c.last}</div>`).join('')
            else if (u.vol) return Object.values(u.vol).map(v => `<div>${v.name}</div>`).join('')
            else if (u.comp) return Object.values(u.comp).map(c => `<div>${c.first} ${c.last}</div>`).join('')
        }
        else return 'login'
    }
    name = (c_v) => {
        let r
        c_v = c_v || 'vol'
        if (this._user && this._user[c_v]) r = Object.values(this._user[c_v]).map(u =>
            `{link.u_${u.id}.${c_v === 'vol' ? _s(u.name) : _s(u.first + ' ' + u.last)}}`).join(', ')
        else r = 'Volunteer'
        return r
    }
    uid = (id, c_v) => {
        c_v = c_v || 'comp'
        const cs = this._user && this._user[c_v]
        let ret = false
        if (id && cs) Object.values(cs).forEach(u => { if (u.id * 1 === id * 1) ret = true })
        return ret
    }
    users = (c_v) => {
        c_v = c_v || 'vol'
        if (this._user && this._user[c_v]) return Object.values(this._user[c_v])
    }
    admin = (ed) => {
        const u = this._user, vs = u && u.vol
        let ret
        if (vs) ret = Object.values(vs).some(u => u.admin === true)
        if (ret && ed) ret = Object.values(vs).some(u => u.email === 'ed@darnell.org.uk')
        return ret
    }
    user = (p) => {
        const token = localStorage.getItem('token')
        if (this._token !== token) {
            this._token = token
            this._user = { vol: null, comp: null }
            if (token) req({ req: 'user' }).then(r => {
                if (r.vol) this._user.vol = r.vol.reduce((a, u) => {
                    a[u.id] = u
                    return a
                }, {})
                if (r.comp) this._user.comp = r.comp.reduce((a, u) => {
                    a[u.id] = u
                    return a
                }, {})
            })
            const l = this.querySelector(`.nav li img[name="user"]`)
            l.src = (token) ? icons['user'].active : l.src = icons['user'].default
        }
        const ui = this.querySelector(`ed-tt[name="user"]`)
        if (p) ui.close()
    }
    wrap = () => {
        // not sure this is needed now
        constnave = this.shadowRoot.querySelector('.nav')
        if (nav.offsetTop > 40) nav.style.paddingTop = '0px'
        else nav.style.paddingTop = '20px'
    }
    toggle = (active, page) => {
        const name = page.charAt(0).toUpperCase() + page.slice(1),
            l = this.querySelector(`[id*="nav_${name}"]`)
        if (l) {
            if (!active) l.classList.remove('active')
            else if (l.classList) l.classList.add('active')
            else l.classList = ['active']
            if (l.tagName === 'IMG') {
                const img = l.getAttribute('data-image')
                l.src = (!active) ? icons[img].default : icons[img].active
            }
        }
    }
    login = () => {
        const l = this.querySelector(`.nav li img[name="user"]`)
        l.click()
    }
    logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('vs')
        localStorage.removeItem('cs')
        this.nav('home')
    }
    nav = (pg) => {
        if (!pages[this.path]) this.path = 'home'
        if (pg && pg !== this.path && pages[pg]) {
            this.toggle(false, pg)
            this.path = pg
        }
        this.toggle(true, this.path)
        this.page.load(this.path) // may not have loaded yet
        this.image()
    }
}
export default Nav
export { pages }