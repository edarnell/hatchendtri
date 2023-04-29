import Html, { debug, page, _s, nav } from './Html'
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
        const { name, param } = this.attr()
        let to = this._to = (name.charAt(0) === '_' ? name.substring(1) : null)
        if (!to && name === 'list' && typeof this.parent('list') === 'function') to = this.parent('list')
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
        const v = page.vs && page.vs[this._to]
        debug({ var: o.attr(), to: this._to, v })
        if (v) {
            if (v) return `{link._${v.id}.${_s(v.name)}}`
            else this._toName = o
            return ''
        }
        else return 'Hatch End Triathlon'
    }
    link = (o) => {
        const { name, param } = o.attr(), id = name.substring(1)
        if (name.startsWith('_') && page._page === 'volunteer') {
            const vol = page.vs[id], _id = name, vp = page.firstChild, admin = nav.admin()
            debug({ name, vol, vp, admin })
            if (vol && admin) return { tip: 'update', theme: 'light', class: vp.color(id), popup: `{vol.${_id}}` }
            else return { tip: 'close', theme: 'light', class: vp.color(id), click: this.tt.close }
        }
        else debug({ name, page: page._page })
    }
    form = (o) => {
        const { name } = o.attr(), k = name.toLowerCase()
        return form[k]
    }
    confirm = (r) => {
        this.innerHTML = '<div class="message">Message sent</div>'
        setTimeout(this.tt.close, 3000)
    }
    error = (e) => {
        debug({ e })
        this.innerHTML = `<div class="message error">Error sending</div>`
        setTimeout(this.tt.close, 3000)
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
            req({ req: 'send', data })
                .then(r => this.confirm(r))
                .catch(e => this.error(e))
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