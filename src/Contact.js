import Html, { debug } from './Html'
import html from './html/Contact.html'
import { ajax } from './ajax'

class Contact extends Html {
    constructor() {
        super()
        this.id = 'contact'
    }
    connectedCallback() {
        debug({ connectedCallback: this.id })
        this.spam = Math.floor(Math.random() * 3)
        this.fm = {
            name: { placeholder: 'name', required: true },
            email: { placeholder: 'email', type: 'email', required: true },
            subject: { placeholder: 'subject', required: true },
            message: { placeholder: 'message...', required: true },
            send: { class: 'form primary disabled', f: this.tt, submit: true },
            spam1: {}, spam2: {}, spam3: {},
        }
        this.innerHTML = this.render(html)
    }
    disconnectedCallback() {
        // Add code to run when the element is removed from the DOM
        debug({ disconnectedCallback: this.id })
    }
    form = (o) => {
        const { name } = o.attr(), k = name.toLowerCase()
        return this.fm[k]
    }
    update = (e) => {
        e.preventDefault()
        const target = e.target, name = target.name,
            complete = this.checkForm(),
            spam = this.checkSpam(),
            sendButton = this.querySelector(`button[name=send]`)
        if (complete && !spam) sendButton.classList.remove('disabled')
        else sendButton.classList.add('disabled')
        if (name === 'send' && complete && !spam) {
            const data = this.getForm(this.fm)
            data.req = 'send'
            debug({ data })
            ajax(data)
        }
    }
    checkForm = () => {
        const data = this.getForm(this.fm)
        let complete = true
        Object.keys(this.form).forEach(k => {
            const f = this.fm[k]
            if (f.required && !data[k]) complete = false
        })
        return complete
    }
    checkSpam = () => {
        const data = this.getForm(this.fm)
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