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
        this.spam = Math.floor(Math.random() * 3)
    }
    form = (name) => {
        let form = {
            email: { placeholder: 'email', type: 'email', required: true },
            send: { class: 'form disabled', click: 'submit', tip: this.spamtt },
        }
        if (!nav._user) {
            const extra = {
                spam1: {}, spam2: {}, spam3: {}
            }
            form = { ...form, ...extra }
        }
        return form
    }
    html = (n, p) => {
        if (nav._user) return user
        else return login
    }
    send = () => {
        const f = this._form
        ajax({ req: 'login', email: f.email })
            .then(r => this.confirm(r))
            .catch(e => this.confirm(null, e))
    }
    confirm = (r, e) => {
        if (e) error({ send: e })
        this.popup.close(e ? '<div class="red">Error Sending.</div>' : '<div class="success">Login link emailed.</div>')
    }
    var = (name) => {
        if (name === 'title') return nav._user ? 'Switch User' : 'Login'
        else if (name === 'admin' && nav.d.admin(true)) return "{link.admin}"
        else if (name === 'spam') return nav._user ? '' : '{checkbox.spam1} {checkbox.spam2} {checkbox.spam3} '
        else return ''
    }
    link = (name, param) => {
        if (name === 'menu') return { icon: 'menu', tip: '' }
        if (name === 'logout') return { tip: 'logout', click: nav.logout }
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

class Unsub extends User {
    constructor(p) {
        super()
        this.p = p
        ajax({ req: 'name', tok: localStorage.getItem('HEtok') }).then(r => {
            this.name = r.name
            this.reload('unsub_name')
        }).catch(e => this.close('Unsubscribed.'))
    }
    form = (name) => {
        return {
            reason: { placeholder: 'reason (optional)', type: 'text' },
            unsub: { tip: 'Confirm Unsubscribe', class: 'form primary', click: this.confirm },
        }
    }
    html = (n) => {
        if (n === 'unsub_name') return `<span id='unsub_name' class="bold">${this.name || ''}</span>`
        else return unsub
    }
    close = (m, e) => {
        if (e) {
            error({ unsub: e })
            this.p.close('<div class="red">Error Unsubscribing - please contact us</div>')
        }
        else this.p.close(m || 'Cancelled unsubscribe.')
    }
    confirm = () => {
        const f = this.getForm()
        ajax({ req: 'unsub', name: this.name, tok: localStorage.getItem('HEtok'), reason: f.reason })
            .then(r => {
                this.close('Unsubscribed.')
            })
            .catch(e => this.close(false, e))
    }
    input = () => {
        // do nothing
    }
}

class Sub extends User {
    constructor(p) {
        super()
        this.p = p
    }
    form = (name) => {
        return {
            first: { placeholder: 'First name', type: 'text' },
            last: { placeholder: 'Last name', type: 'text' },
            sub: { tip: 'Subscribe', class: 'form primary', click: this.confirm },
        }
    }
    html = (n) => {
        return sub
    }
    close = (m, e) => {
        if (e) {
            error({ unsub: e })
            this.p.close('<div class="red">Error Unsubscribing - please contact us</div>')
        }
        else this.p.close(m || 'Cancelled unsubscribe.')
    }
    confirm = () => {
        const f = this.getForm()
        ajax({ req: 'unsub', name: this.name, tok: localStorage.getItem('HEtok'), reason: f.reason })
            .then(r => {
                this.close('Unsubscribed.')
            })
            .catch(e => this.close(false, e))
    }
    input = () => {
        // do nothing
    }
}

export { Login, Unsub, Sub }
export default User