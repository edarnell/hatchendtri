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
        if (name === 'admin' && nav._user[52]) return "{link.admin}"
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