import { debug, error, _s } from './Html'
import user from './html/user.html'
import unsub from './html/unsub.html'
import sub from './html/sub.html'
import login from './html/login.html'
import Contact from './Contact'
import { nav } from './Nav'
import { ajax } from './ajax'

class User extends Contact {
    constructor() {
        super()
        if (nav._unsub) ajax({ req: 'unsub', tok: localStorage.getItem('HEtok'), u: true }).then(r => {
            this.u = r.u
            this.reload('unsub_name')
        }).catch(e => this.close('Unsubscribed.'))
        else if (!nav._user) this.spam = Math.floor(Math.random() * 3)
    }
    form = () => {
        let f = {}
        if (nav._unsub) f = {
            reason: { placeholder: 'reason (optional)', type: 'text' },
            unsub: { tip: 'Confirm Unsubscribe', class: 'form primary', click: this.unsub },
        }
        else if (nav._sub) {
            f = {
                first: { placeholder: 'First name', type: 'text' },
                last: { placeholder: 'Last name', type: 'text' },
                sub: { tip: 'Subscribe', class: 'form primary', click: this.sub },
            }
        }
        else if (!nav._user) {
            f = {
                email: { placeholder: 'email', type: 'email', required: true },
                send: { class: 'form disabled', click: 'submit', tip: this.spamtt },
                spam1: { tip: this.spamtt }, spam2: { tip: this.spamtt }, spam3: { tip: this.spamtt }
            }
        }
        return f
    }
    input = () => {
        // do nothing
    }
    html = (n, p) => {
        if (n === 'unsub_name') return `<span id='unsub_name' class="bold">${this.u ? this.u.first + ' ' + this.u.last : ''}</span>`
        else {
            if (nav._unsub) return `<div id='unsub'>${unsub}</div>`
            else if (nav._sub) return `<div id='unsub'>${sub}</div>`
            else if (nav._user) return `<div id='user'>${user}</div>`
            else return `<div id='login'>${login}</div>`
        }
    }
    unsubscribe = () => {
        this.u = nav._user
        nav._unsub = true
        this.reload()
    }
    unsub = () => {
        const f = this.getForm()
        ajax({ req: 'unsub', i: this.u.i, tok: localStorage.getItem('HEtok'), reason: f.reason })
            .then(r => {
                this.close('Unsubscribed.', 'unsub')
            })
            .catch(e => {
                error({ e })
                this.close('<div class="error">Error.</div>')
            })
    }
    sub = () => {
        const f = this.getForm()
        ajax({ req: 'sub', tok: localStorage.getItem('HEtok'), details: f })
            .then(r => {
                this.close('<div class="success">Subscribed.</div>', 'sub')
            })
            .catch(e => {
                error({ e })
                this.close('<div class="error">Error.</div>')
            })
    }
    send = () => {
        const f = this._form
        ajax({ req: 'login', email: f.email })
            .then(r => this.close('<div class="success">Login link emailed.</div>'))
            .catch(e => {
                error({ e })
                this.close('<div class="error">Error.</div>')
            })
    }
    var = (name) => {
        if (name === 'title') return nav._user ? 'Switch User' : 'Login'
        else if (name === 'admin' && nav._user.aed) return "{link.admin}"
        else if (name === 'spam') return nav._user ? '' : "<div class=\"small\">I'm not a robot</div>{checkbox.spam1} {checkbox.spam2} {checkbox.spam3} "
        else return ''
    }
    link = (name, param) => {
        if (name === 'menu') return { icon: 'menu', tip: '' }
        else if (name === 'unsubscribe') return { tip: 'unsubscribe', click: this.unsubscribe }
        else if (name === 'logout') return { tip: 'logout', click: nav.logout }
    }
}

class Login extends User {
    constructor() {
        super()
    }
    html = (n, p) => {
        return login
    }
}

export { Login }
export default User