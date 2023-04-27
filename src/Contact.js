import Html, { debug, page } from './Html'
import html from './html/Contact.html'
import { req } from './data'

const form = {
    name: { placeholder: 'name', required: true },
    email: { placeholder: 'email', type: 'email', required: true },
    subject: { placeholder: 'subject', required: true },
    message: { placeholder: 'message...', required: true },
    send: { class: 'form primary disabled', submit: true, tt: '...' },
    spam1: {}, spam2: {}, spam3: {},
}

class Contact extends Html {
    constructor() {
        super()
        this.popup = true
        form.send.tip = this.tt
        this.spam = Math.floor(Math.random() * 3)
        const { name, param } = this.attr(),
            to = this._to = (name.charAt(0) === '_' ? name.substring(1) : name)
        if (to) this.data = 'vs'
    }
    debug = (m) => debug({ Contact: m, o: this.o(), div: this })
    html = (o) => {
        if (!o) return html
        else {
            const name = o.attr().name
            if (name === 'spam') return nav._user ? '' : '{checkbox.spam1} {checkbox.spam2} {checkbox.spam3} '
            else if (name === 'from') return nav._user ? '' : '{input.name}<br />{input.email}<br />'
        }
    }
    listen = () => {
        if (this._toName) this._toName.setAttribute('param', 'update')
    }
    var = (o) => {
        debug({ var: o.attr(), to: this._to, v: page.vs && page.vs[this._to] })
        if (this._to) {
            if (page.vs) return page.vs[this._to].name
            else this._toName = o
            return ''
        }
        else return 'Hatch End Triathlon'
    }
    form = (o) => {
        const { name } = o.attr(), k = name.toLowerCase()
        return form[k]
    }
    update = (e, o) => {
        const p = o && o.attr(), name = p.name,
            complete = this.checkForm(),
            spam = this.checkSpam(),
            sendButton = this.querySelector(`button[name=send]`)
        if (complete && !spam) sendButton.classList.remove('disabled')
        else sendButton.classList.add('disabled')
        if (name === 'send' && complete && !spam) {
            const data = this.getForm(form)
            if (this._to) data.to = this._to
            req({ req: 'send', data }).then(r => this.tt.close())
        }
    }
    checkForm = () => {
        const data = this.getForm(form)
        let complete = true
        if (nav._user) return data.message && data.subject
        else Object.keys(form).forEach(k => {
            const f = form[k]
            if (f.required && !data[k]) complete = false
        })
        return complete
    }
    checkSpam = () => {
        const data = this.getForm(form)
        let spam = false;
        if (!nav._user) ['spam1', 'spam2', 'spam3'].forEach((k, i) => {
            spam = spam || data[k] !== (i === this.spam)
        })
        return spam
    }
    tt = () => {
        const complete = this.checkForm()
        if (complete) {
            const b = ['left', 'middle', 'right'], s = b[this.spam]
            const spam = this.checkSpam()
            if (spam) return `please tick the ${s} box`
            else return 'send email'
        }
        else return 'complete the form'
    }
}
export default Contact