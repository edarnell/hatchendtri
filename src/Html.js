const debug = console.log.bind(console)
const error = console.error.bind(console)
import TT from './TT.js'
import IN from './IN.js'
import Table from './Table.js'

function _s(s, p) {
    if (p === undefined) return s && s.replace(/\s/g, "&nbsp;")
    else {
        const r = s && s.replace(/_|&nbsp;|\s/g, " ")
        return r && p ? r.toLowerCase() : r
    }
}

class Html {
    static nav
    constructor(p, name, param) {
        if (p) {
            const id = this.id = name + (param ? '_' + param : '')
            this.page = p.page
            this.html = () => p.page.html(name, param)
            if (!p.div) p.div = {}
            p.div[id] = this
        }
    }
    q = (q) => document.querySelector(q)
    fe = (n) => {
        const f = this.form, d = f && f[n], o = d && d.o, l = o && this.q(`#${o.id}`)
        if (!l) error({ fe: { f, n, d, o, l } })
        return l
    }
    render(o, id = o.id) {
        debug({ render: { o, id } })
        if (!o.d && o.data) this.nav.d.get(o.data).then(r => {
            o.d = r
            this.render(o, id)
        })
        else {
            if (o === this) {
                this.unload(this)
            }
            else {
                if (!this.div) this.div = {}
                if (this.div[id]) this.unload(this.div[id])
                this.div[id] = o
            }
            const _html = this.replace(o)
            const e = this.q(`#${id}`)
            if (e) e.innerHTML = _html
            else error({ render: this, id })
            requestAnimationFrame(() => {
                //debug({ render: done })
                this.listen(o)
                if (o.loaded) o.loaded()
            })
        }
    }
    replace = (o, html) => {
        const _html = (html || o.html()).replace(/\{([\w_]+)(?:\.([^\s}.]+))?(?:\.([^\s}]+))?}/g, (match, t, l, c) => {
            return this.links(o, t, l, c)
        })
        return _html
    }
    listen = (p) => {
        debug({ listen: p.id, p })
        if (p.div) Object.keys(p.div).forEach(d => this.listen(p.div[d]))
        if (p.tt) Object.keys(p.tt).forEach(id => p.tt[id].listen())
        if (p.form) Object.keys(p.form).forEach(id => p.form[id].o && p.form[id].o.listen())
    }
    unload = (p) => {
        //debug({ unload: p.id })
        if (p.div) {
            Object.keys(p.div).forEach(d => this.unload(p.div[d]))
            p.div = {}
        }
        if (p.tt) {
            Object.keys(p.tt).forEach(id => p.tt[id].remove(null, true))
            p.tt = {}
        }
        if (p.form) {
            Object.keys(p.form).forEach(id => {
                const f = p.form[id]
                if (f.o) f.o.remove(null, true)
                f.o = null
            })
        }
    }
    reload = (n) => {
        if (!n) this.render(this)
        else if (this.div[n]) this.render(this.div[n])
    }
    links = (o, t, l, c) => {
        if (t === 'div') {
            const div = new Html(o, l, c)
            return this.replace(div)
        }
        else if (t === 'var') {
            return this.var(l, c)
        }
        else if (t === 'table') {
            const tbl = new Table(o, l, c)
            return this.replace(o, tbl.html())
        }
        else if (['input', 'button', 'select', 'textarea', 'checkbox'].includes(t)) {
            const ipt = new IN(o, t, l, c)
            return ipt.html()
        }
        else {
            const tt = new TT(o, t, l, c)
            return tt.html()
        }
    }
    init(css, favicon) {
        const link = document.createElement('link');
        link.rel = 'shortcut icon';
        link.href = favicon;
        link.type = 'image/x-icon';
        document.head.appendChild(link);
        const style = document.createElement('style')
        style.innerHTML = css
        document.head.appendChild(style)
        const hash = window.location.hash, token = hash && hash.substring(1)
        if (token && token.length > 10) {
            localStorage.setItem('token', token)
            window.location.hash = ''
        }
        this.path = window.location.pathname.replace('/', '')
    }
    setForm = (vs) => {
        if (vs && this.form) Object.keys(vs).forEach(k => {
            const l = this.fe(k)
            if (l) {
                if (l.type === 'checkbox' || l.type === 'radio') l.checked = vs[k]
                else l.value = vs[k]
            }
            else error({ setForm: k, vs })
        })
        else error({ setForm: vs })
        return this.getForm()
    }
    getForm = () => {
        let ret = {}
        if (this.form) Object.keys(this.form).forEach(name => {
            const l = this.fe(name)
            if (l) ret[name] = l.type === 'checkbox' || l.type === 'radio' ? l.checked : l.value
        })
        else error({ getForm: this })
        return ret
    }

}
export default Html
export { debug, error, _s }