import Html, { debug, _s } from './Html'
import html from './html/Contact.html'
import { ajax } from './ajax'

class Contact extends Html {
    constructor() {
        super()
        this.form = {
            name: { placeholder: 'name', required: true },
            email: { placeholder: 'email', type: 'email', required: true },
            subject: { placeholder: 'subject', required: true },
            message: { placeholder: 'message...', required: true },
            send: { class: 'form primary disabled', click: this.input, tip: this.sendtt },
            spam1: {}, spam2: {}, spam3: {},
        }
        this.spam = Math.floor(Math.random() * 3)
        /*
        let to = this._to = (name.charAt(0) === '_' ? name.substring(1) : null)
        if (!to && name === 'list' && typeof this.parent('list') === 'function') to = this.parent('list')
        if (to) this.data = 'vs'
        */
    }
    //debug = (m) => debug({ Contact: m, o: this.o(), div: this })
    html = (name, param) => {
        debug({ html: name, param })
        const user = false
        if (name === 'form') return `<div id="form"><form>
        ${user ? '' : '{input.name}<br />{input.email}<br />'}
        {input.subject}<br />
        {textarea.message}<br />
        ${user ? '' : '{checkbox.spam1} {checkbox.spam2} {checkbox.spam3} '} {button.send}
        </form></div>`
        else return this.message ?? `<div id=${this.id}>${html}</div>`
    }
    var = (name, param) => {
        if (name === 'id') return this.id
        const v = this.page.vs && this.page.vs[this._to]
        if (v) {
            if (v) return `{link._${v.id}.${_s(v.name)}}`
            else this._toName = o
            return ''
        }
        else return 'Hatch End Triathlon'
    }
    link = (name) => {
        debug({ link: name })
        if (name.startsWith('_') && page._page === 'volunteer') {
            const vol = page.vs[id], _id = name, vp = page.firstChild
            if (vol) return nav.admin() ? { tip: 'update', theme: 'light', class: vp.color(id), popup: `{vol.${_id}}`, placement: 'bottom' }
                : { tip: 'close', theme: 'light', class: vp.color(id), click: this.popup.close }
        }
    }
    close = () => {
        this.popup.close()
    }
    confirm = (r) => {
        this.message = `<div class="message">Message sent</div>`
        this.reload()
        setTimeout(this.close, 3000)
    }
    error = (e) => {
        debug({ e })
        this.message = `<div class="message error">Error sending</div>`
        this.reload()
        setTimeout(this.close, 3000)
    }
    input = (e, o) => {
        const complete = this.checkForm(),
            spam = this.checkSpam(),
            sendButton = this.form.send.o.el()
        if (complete && !spam) sendButton.classList.remove('disabled')
        else sendButton.classList.add('disabled')
        if (o.name === 'send' && complete && !spam) {
            const data = this.form_data
            if (this._to) data.to = this._to
            ajax({ req: 'send', data })
                .then(r => this.confirm(r))
                .catch(e => this.error(e))
        }
    }
    checkForm = () => {
        const form = this.form, data = this.form_data = this.getForm(),
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
        const data = this.form_data, user = nav._user && (nav._user.vol || nav._user.comp)
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