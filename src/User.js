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
*/


import Html, { debug, page, _s } from './Html'
import { req } from './data'
import user from './html/user.html'
import login from './html/login.html'

const form = {
    email: { placeholder: 'email', type: 'email', required: true },
    send: { class: 'form disabled', submit: true },
    spam1: {}, spam2: {}, spam3: {},
}

class User extends Html {
    constructor() {
        super()
        form.send.tip = this.spamtt
        form.send.click = this.send
        this.spam = Math.floor(Math.random() * 3)
    }
    //debug = (m) => debug({ User: m, popup: this.popup })
    spamtt = () => {
        const complete = this.checkForm()
        if (complete) {
            const b = ['left', 'middle', 'right'], s = b[this.spam]
            const spam = this.checkSpam()
            if (spam) return `please tick the ${s} box`
            else return 'login by email'
        }
        else return 'enter your email'
    }
    confirm = (r) => {
        this.innerHTML = '<div class="message">Login link emailed.</div>'
        setTimeout(this.popup.close, 3000)
    }
    error = (e) => {
        debug({ e })
        this.innerHTML = `<div class="message error">Error sending</div>`
        setTimeout(this.popup.close, 3000)
    }
    var = (o) => {
        const { name, param } = o.attr()
        if (name === 'admin' && nav.admin(true)) return "{link.admin}"
        else return ''
    }
    link = (o) => {
        const { name, param } = o.attr()
        if (name === 'menu') return { icon: 'menu', tip: '' }
        if (name === 'logout') return { tip: 'logout', click: nav.logout }
    }
    html = (o) => {
        if (!o) {
            const token = localStorage.getItem('token')
            if (token) return user
            else return login
        }
    }
    form = (o) => {
        const { name, param } = o.attr()
        return form[name]
    }
    update = (e, o) => {
        const p = o && o.attr(), name = p.name,
            complete = this.checkForm(),
            spam = this.checkSpam(),
            sendButton = this.querySelector(`button[name=send]`)
        if (complete && !spam) {
            sendButton.classList.remove('disabled')
            sendButton.classList.add('primary')
        }
        else {
            sendButton.classList.remove('primary')
            sendButton.classList.add('disabled')
        }
        if (name === 'send' && complete && !spam) {
            const f = this.getForm(form)
            req({ req: 'login', email: f.email })
                .then(r => this.confirm(r))
                .catch(e => this.error(e))
        }
    }
    checkForm = () => {
        const data = this.getForm(form)
        let complete = true
        Object.keys(form).forEach(k => {
            const f = form[k]
            if (f.required && !data[k]) complete = false
        })
        return complete
    }
    checkSpam = () => {
        const data = this.getForm(form)
        let spam = false
            ;['spam1', 'spam2', 'spam3'].forEach((k, i) => {
                spam = spam || data[k] !== (i === this.spam)
            })
        return spam
    }

}
export default User