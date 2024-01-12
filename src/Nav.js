import css from './css/combined.css'
import favicon from './icon/jetstream.ico'
import Html, { debug, error } from './Html'
import html from './html/Nav.html'
import { icons } from './icons'
import Data from './Data.js'
import { apage } from './Admin'

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
            admin: { nav: 'Admin', page: () => apage(this.f ? this.f.admin : 'email'), hide: true, href: 'admin', tip: 'data admin' },
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
            }).catch(e => {
                debug({ e })
                this._user = false
                this.render(this, 'root')
            })
        })
    }
    form = () => { // section and options populated on load
        return { admin: { options: ['select', 'email'] } }
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
        const unsub = this.path === 'unsubscribe',
            sub = this.path === 'subscribe'
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
        if (pg) this.checkUser()
        else if (unsub) this.unsubscribe()
        else if (sub) this.subscribe()
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
            else if (token) {
                this.d.user().then(r => {
                    this.userIcon(r)
                }).catch(e => {
                    debug({ e })
                    this.userIcon(false)
                })
            }
        })
    }
    logout = (e, o) => {
        localStorage.removeItem('HEtoken')
        this.userIcon(false)
        debug({ page: this.page, path: this.path })
        if (this.path = 'volunteer') this.page.popclose('vol_avail') // safe to call if not open
        this.load('home')
    }
    unsubscribe = () => {
        const l = this.q(`[id*="TT_user_nav"]`)
        this.popup('Unsub', 'nav_unsub', l, 'bottom-end')
    }
    subscribe = () => {
        const l = this.q(`[id*="TT_user_nav"]`)
        this.popup('Sub', 'nav_sub', l, 'bottom-end')
    }
    close = (m, u) => {
        this.popclose(u || u === false ? 'nav_sub' : 'nav_unsub')
        if (u) {
            const token = localStorage.getItem('HEtok')
            localStorage.setItem('HEtoken', token)
            this._user = u
        }
        if (m) {
            const tt = this.tt.TT_user_nav_5
            tt.tooltip(null, m)
            tt.timer = setTimeout(() => {
                tt.ttremove()
                tt.listen(true)
                if (m === 'Unsubscribed') this.logout()
            }, 2000)
        }
    }
    ctt = () => {
        this.checkUser()
        return 'contact us'
    }
    tt = () => {
        this.checkUser()
        const u = this._user, name = u ? u.first + ' ' + u.last : '', a = u && u.admin
        return a ? `<span class='red'>${name}</span>` : name || 'login'
    }
}
export default Nav
export { nav }