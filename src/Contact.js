import Html, { debug } from './Html'
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
        form.send.tip = this.tt
        this.spam = Math.floor(Math.random() * 3)
    }
    html = () => html
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
            req({ req: 'send', data }).then(r => debug({ send: r }))
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
        let spam = false;
        ['spam1', 'spam2', 'spam3'].forEach((k, i) => {
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