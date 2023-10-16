import Html, { debug, _s } from './Html'
import html from './html/Contact.html'
import { ajax } from './ajax'
import { nav } from './Nav'

class Contact extends Html {
    constructor() {
        super()
        this.spam = Math.floor(Math.random() * 3)
    }
    form = () => {
        let form = {
            subject: { placeholder: 'subject', required: true },
            message: { placeholder: 'message...', required: true },
            send: { class: 'form disabled', click: 'submit', tip: this.spamtt }
        }
        if (!nav._user) {
            const extra = {
                name: { placeholder: 'name', required: !nav._user },
                email: { placeholder: 'email', type: 'email', required: !nav._user },
                spam1: {}, spam2: {}, spam3: {}
            }
            form = { ...form, ...extra }
        }
        return form
    }
    html = () => {
        return html
    }
    var = (name) => {
        const user = nav._user
        if (name === 'name_email') return `${user ? '' : '{input.name}<br />{input.email}<br />'}`
        if (name === 'spam') return `${user ? '' : '{checkbox.spam1} {checkbox.spam2} {checkbox.spam3} '}`
        return 'Hatch End Triathlon'
    }
    spamtt = () => {
        const complete = this.checkForm(), m = this.form.message
        if (complete) {
            const b = ['left', 'middle', 'right'], s = b[this.spam]
            const spam = this.checkSpam()
            if (spam) return `please tick the ${s} box`
            else return m ? 'send message' : 'login by email'
        }
        else return m ? 'complete the form' : 'enter your email'
    }
    confirm = (r) => {
        this.popup.close('<div class="success">Message sent.</div>')
    }
    close = () => {
        this.popup.close()
    }
    input = (e, o) => {
        const complete = this.checkForm(),
            spam = this.checkSpam(),
            sendButton = this.fe('send')
        if (complete && !spam) {
            sendButton.classList.remove('disabled')
            sendButton.classList.add('primary')
        }
        else {
            sendButton.classList.remove('primary')
            sendButton.classList.add('disabled')
        }
        if (o.name === 'send' && complete && !spam) {
            this.send()
        }
    }
    send = () => {
        const data = this._form
        if (this._to) data.to = this._to
        ajax({ req: 'send', data })
            .then(r => this.confirm(r))
            .catch(e => this.error(e))
    }
    checkForm = () => {
        const form = this.form(), data = this._form = this.getForm(),
            nav = {}, user = nav._user && (nav._user.vol || nav._user.comp)
        let complete = true
        if (user) return data.message && data.subject
        else Object.keys(form).forEach(k => {
            const f = form[k]
            if (f.required && !data[k]) complete = false
        })
        if (data.email && !data.email.match(/^[^@]+@[^@]+$/)) complete = false
        return complete
    }
    checkSpam = () => {
        const data = this._form, user = nav._user
        let spam = false
        if (!user) ['spam1', 'spam2', 'spam3'].forEach((k, i) => {
            spam = spam || data[k] !== (i === this.spam)
        })
        return spam
    }
    sendtt = () => {
        const complete = this.checkForm(),
            user = nav._user && (nav._user.vol || nav._user.comp)
        if (complete) {
            const b = ['left', 'middle', 'right'], s = b[this.spam]
            const spam = this.checkSpam()
            if (spam) return `please tick the ${s} box`
            else return 'send email'
        }
        else if (user) return 'complete the form'
        else {
            const data = this.getForm()
            if (data.email && !data.email.match(/^[^@]+@[^@]+$/)) return 'invalid email address'
            else return 'complete the form'
        }
    }



}
export default Contact