import Html, { debug, _s, error, dbg } from './Html.mjs'
import html from './html/Contact.html'
import { ajax } from './ajax.mjs'
import { nav } from './Nav.mjs'

class Contact extends Html {
    constructor(p, id) {
        super()
        this._v = id
        this._fid = '#contact_form'
        this._submit = 'send'
    }
    form = () => {
        let form = {
            subject: { placeholder: 'subject', required: true },
            message: { placeholder: 'message...', required: true },
            send: { class: 'form disabled', click: 'submit', tip: this.spamtt }
        }
        if (!nav._user) {
            if (this.spam === undefined) this.spam = Math.floor(Math.random() * 3)
            const extra = {
                name: { placeholder: 'name', required: true },
                email: { placeholder: 'email', type: 'email', required: true },
                spam1: { tip: this.spamtt }, spam2: { tip: this.spamtt }, spam3: { tip: this.spamtt }
            }
            form = { ...form, ...extra }
        }
        return form
    }
    html = () => {
        return html
    }
    var = (n) => {
        const user = nav._user, vs = nav.d.data.vs, v = this._v && vs[this._v],
            to = v && `${v.first} ${v.last}`
        if (n === 'name_email') return `${user ? '' : '{input.name}<br />{input.email}<br />'}`
        if (n === 'spam') return `${user ? '' : "<div class=\"small\">I'm not a robot</div>{checkbox.spam1} {checkbox.spam2} {checkbox.spam3} "}`
        return to || 'Hatch End Triathlon'
    }
    spamtt = () => {
        const f = this.q(this._fid), c = f.checkValidity(),
            fm = this.form(), s = fm[this._submit], m = s && s.m, e = s && s.e
        if (c) {
            if (this.spam !== undefined) {
                const b = ['left', 'middle', 'right'], s = b[this.spam]
                const spam = this.checkSpam()
                if (spam) return `please tick the ${s} box`
                else return m || this._submit
            }
            else return m || this._submit
        }
        else {
            //f.reportValidity()
            return e || 'complete the form'
        }
    }
    input = (e, o) => {
        const f = this.q(this._fid), c = f.checkValidity(),
            s = this.checkSpam(),
            b = this.fe(this._submit)
        if (c && !s) {
            b.classList.remove('disabled')
            b.classList.add('primary')
        }
        else {
            b.classList.remove('primary')
            b.classList.add('disabled')
        }
        if (o.name === this._submit) {
            if (c && !s) this[this._submit]()
            else if (!c) f.reportValidity()
        }
    }
    send = () => {
        const { subject, message, name, email } = this._f, v = this._v
        ajax({ req: 'send', subject, message, name, email, v })
            .then(r => this.close('<div class="success">Message sent.</div>'))
            .catch(e => {
                if (e === 'unsubscribed') dbg({ e })
                else error(e)
                this.close(`<div class="error">Error Sending${e === 'unsubscribed' ? ' (unsubscribed)' : ''}.</div>`)
            })
    }
    checkSpam = () => {
        this._f = this.getForm()
        let spam = false
        if (this.spam !== undefined) ['spam1', 'spam2', 'spam3'].forEach((k, i) => {
            spam = spam || this._f[k] !== (i === this.spam)
        })
        return spam
    }
}
export default Contact