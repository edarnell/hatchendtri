import { debug, error, _s } from './Html'
import user from './html/user.html'
import unsub from './html/unsub.html'
import subscribe from './html/subscribe.html'
import register from './html/register.html'
import login from './html/login.html'
import Contact from './Contact'
import { nav } from './Nav'
import { ajax } from './ajax'

class User extends Contact {
    constructor() {
        super()
        if (nav._path === 'unsubscribe') ajax({ req: 'unsub', tok: localStorage.getItem('HEtok'), u: true }).then(r => {
            this.u = r.u
            this.reload('unsub_name')
        }).catch(e => this.close('Unsubscribed.'))
    }
    var = (n) => {
        if (n === 'title') return nav._user ? 'Switch User' : 'Login or {link.register.Register}'
        else if (n === 'name' && nav._user) return `${nav._user.first} ${nav._user.last}`
        else if (n === 'admin' && nav._user.aed) return "{link.admin}"
        else if (n === 'spam') return nav._user ? '' : "<div class=\"small\">I'm not a robot</div>{checkbox.spam1} {checkbox.spam2} {checkbox.spam3} "
        else return ''
    }
    clear = () => {
        nav._path = null
        this.close()
    }
    link = (n) => {
        if (n === 'menu') return { icon: 'menu', tip: '' }
        else if (n === 'unsubscribe') return { tip: 'unsubscribe', click: this.unsub }
        else if (n === 'register') return { tip: 'register', click: this.reg }
        else if (n === 'logout') return { tip: 'logout', click: nav.logout }
        else if ((nav._path === 'unsubscribe' || nav._path === 'register') && n === 'close') return { tip: 'cancel', class: 'close', click: this.clear }
    }
    form = () => {
        let f = {}
        if (nav._path === 'unsubscribe') {
            this._fid = '#unsub_form'
            f = {
                reason: { placeholder: 'reason (optional)', type: 'text' },
                unsub: { tip: 'Confirm Unsubscribe', class: 'form primary', click: this.unsub },
            }
        }
        else if (nav._path === 'register') {
            this._fid = '#register_form'
            this._submit = 'register'
            if (this.spam === undefined) this.spam = Math.floor(Math.random() * 3)
            f = {
                first: { placeholder: 'First name', type: 'text', required: 'first name' },
                last: { placeholder: 'Last name', type: 'text', required: 'last name' },
                email: { placeholder: 'email', type: 'email', required: 'valid email' },
                register: { tip: this.spamtt, class: 'form disabled', click: 'submit' },
                spam1: { tip: this.spamtt }, spam2: { tip: this.spamtt }, spam3: { tip: this.spamtt }
            }
        }
        else if (nav._user) {
            const u = nav._user, un = u.fi && u.fi.unsub
            f = un ? {
                sub: { tip: 'subscribe', class: 'form primary', click: this.sub },
            } : {}
        }
        else {
            this._fid = '#login_form'
            this._submit = 'login'
            if (this.spam === undefined) this.spam = Math.floor(Math.random() * 3)
            f = {
                email: { placeholder: 'email', type: 'email', required: true },
                login: { e: 'enter your email', m: 'login by email', class: 'form disabled', click: 'submit', tip: this.spamtt },
                spam1: { tip: this.spamtt }, spam2: { tip: this.spamtt }, spam3: { tip: this.spamtt }
            }
        }
        return f
    }
    html = (n, p) => {
        if (n === 'unsub_name') return `<span id='unsub_name' class="bold">${this.u ? this.u.first + ' ' + this.u.last : ''}</span>`
        else {
            if (nav._path === 'unsubscribe') return `<div id="unsub">${unsub}</div>`
            else if (nav._path === 'register') return `<div id="register">${register}</div>`
            else if (nav._user) {
                const u = nav._user, un = u.fi && u.fi.unsub
                return un ? `<div id="subscribe">${subscribe}</div>` : `<div id="user">${user}</div>`
            }
            else return `<div id="login">${login}</div>`
        }
    }
    unsub = () => {
        this.u = nav._user
        nav._path = 'unsubscribe'
        this.reload()
    }
    reg = () => {
        nav._path = 'register'
        this.reload()
    }
    unsub = () => {
        const f = this._f || {}
        nav._path = null
        ajax({ req: 'unsub', i: this.u.i, tok: localStorage.getItem('HEtok'), reason: f.reason })
            .then(r => {
                this.close('Unsubscribed.')
                nav.logout()
            })
            .catch(e => {
                error({ e })
                this.close('<div class="error">Error.</div>')
            })
    }
    register = () => {
        const f = this._f || {}, tok = localStorage.getItem('HEtok')
        nav._path = null
        ajax({ req: 'register', tok, details: f })
            .then(r => {
                if (r.u) {
                    nav._user = r.u
                    localStorage.removeItem('HEtok')
                    localStorage.setItem('HEtoken', tok)
                }
                this.close('<div class="success">Registered.</div>')
            })
            .catch(e => {
                error({ e })
                this.close('<div class="error">Error.</div>')
            })
    }
    subscribe = () => {
        ajax({ req: 'sub' })
            .then(r => {
                nav._user = r.u
                this.close('<div class="success">Subscribed.</div>')
            })
            .catch(e => {
                error({ e })
                this.close('<div class="error">Error.</div>')
            })
    }
    login = () => {
        const f = this._f // set in Contact.js
        ajax({ req: 'login', email: f.email })
            .then(r => this.close('<div class="success">Login link emailed.</div>'))
            .catch(e => {
                error({ e })
                this.close('<div class="error">Error.</div>')
            })
    }
}
export default User