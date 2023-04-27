import Html, { set_nav, page, _s, debug } from './Html'
import html from './html/Nav.html'
import { icons } from './icons'
import { pages } from './Page'
import { req } from './data'
const images = ['url("swim.jpg")', 'url("bike.jpg")', 'url("run.jpg")']
class Nav extends Html {
    constructor() {
        super()
        this.id = 'nav'
        set_nav(this)
        this.i = Math.floor(Math.random() * 3)
        pages.user.click = this.user
        pages.user.tip = this.tt
    }
    html = () => html
    listen = () => {
        const p = window.location.pathname.replace('/', '')
        this.nav(p)
    }
    image = () => {
        const bg = this.querySelector('.background-image')
        bg.style.backgroundImage = images[this.i]
        this.i = (this.i + 1) % 3
    }
    tt = () => {
        if (this._user) return Object.values(this._user).map(u => `<div>${u.name}</div>`).join('')
        else return 'login'
    }
    name = () => {
        if (this._user) return Object.values(this._user).map(u => `{link._${u.id}.${_s(u.name)}}`).join(', ')
        else return 'Volunteer'
    }
    admin = () => {
        if (this._user) return Object.values(this._user).some(u => u.admin === true)
    }
    user = (s) => {
        const token = localStorage.getItem('token')
        if (this._token !== token) {
            this._token = token
            this._user = null
            if (token) req({ req: 'vol' }).then(r => {
                this._user = r.vol.reduce((a, u) => {
                    a[u.id] = u
                    return a
                }, {})

            })
            const l = this.querySelector(`.nav li img[name="user"]`)
            l.src = (token) ? icons['user'].active : l.src = icons['user'].default
        }
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
    login = () => {
        const l = this.querySelector(`.nav li img[name="user"]`)
        l.click()
    }
    nav = (pg) => {
        const _pg = pg && pg.replace('/', ''),
            pg_ = _pg && pages[_pg] ? _pg : 'home'
        //debug({ pg, _pg, page })
        this.image()
        this.user()
        this.toggle(true, this._page)
        this.toggle(false, pg_)
        const p = this.querySelector('.page')
        p.innerHTML = pages[pg_].nav
        if (page) page.load(pg_) // may not have loaded yet
        else if (!page) {
            this._page = pg_ // will be used when page loads
        }
    }
}
export default Nav