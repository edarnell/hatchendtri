import { debug, _s } from './Html'
import user from './html/user.html'
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
        const form = nav._user ? null : {
            email: { placeholder: 'email', type: 'email', required: true },
            send: { class: 'form disabled', click: 'submit', tip: this.spamtt },
            spam1: {}, spam2: {}, spam3: {},
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
            .catch(e => this.error(e))
    }
    confirm = (r) => {
        this.popup.close('<div class="success">Login link emailed.</div>')
    }
    var = (name) => {
        if (name === 'admin' && nav.d.admin(true)) return "{link.admin}"
        else return ''
    }
    link = (name, param) => {
        if (name === 'menu') return { icon: 'menu', tip: '' }
        if (name === 'logout') return { tip: 'logout', click: nav.logout }
    }
}
export default User