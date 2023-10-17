const debug = console.log.bind(console)
const error = console.error.bind(console)
import TT from './TT'
import IN from './IN'
import Table from './Table'
import { nav } from './Nav'
//import O from './Objects'

function _s(s, p) {
    if (p === undefined) return s && s.replace(/\s/g, "&nbsp;")
    else {
        const r = s && s.replace(/_|&nbsp;|\s/g, " ")
        return r && p ? r.toLowerCase() : r
    }
}

class Html {
    constructor(p, name, param) {
        if (p) {
            Object.assign(this, { p, name, param })
            const id = this.id = name + (param ? '_' + param : '')
            if (!p.div) p.div = {}
            p.div[id] = this
        }
    }
    _p = (f) => {
        if (this[f]) return this[f]
        else if (this.p) return this.p._p(f)
        // else return undefined
    }
    _c = (d) => {
        let ret
        if (Array.isArray(this[d])) ret = [...this[d]]
        else if (this[d]) ret = [this[d]]
        if (this.div) {
            Object.keys(this.div).forEach(k => {
                const div = this.div[k], r = div._c(d)
                if (Array.isArray(r)) ret = ret ? [...ret, ...r] : [...r]
                else if (r) ret ? ret.push(r) : ret = [r]
            })
        }
        if (ret) return ret
    }
    plink = (name, param) => {
        const p = this.p, l = p && p._p('link')
        if (l === undefined) error({ plink: { name, param } })
        else return l(name, param)
    }
    pinput = (name, param) => {
        const p = this.p, i = p && p._p('input')
        if (i === undefined) error({ pinput: { name, param } })
        else return i(name, param)
    }
    q = (q) => document.querySelector(q)
    fe = (n) => {
        const l = this.q(`[id*="IN_${n}_"]`)
        if (!l) error({ fe: this, n })
        return l
    }
    render(o, id = o.id) {
        debug({ render: { o, id } })
        if (o.data && !nav.d.check(o.data)) nav.d.get(o.data).then(r => {
            this.render(o, id)
        })
        else {
            if (o === this) this.unload(this)
            else if (o.p && o.p.div[id]) {
                this.unload(o.p.div[id])
                o.p.div[id] = o
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
        const c = (html || o._p('html')(o.name, o.param)),
        _html =(typeof c === 'object') ?this.replace(c):c
        return _html && _html.replace(/\{([\w_]+)(?:\.([^\s}.]+))?(?:\.([^\s}]+))?}/g, (match, t, n, p) => {
            return this.links(o, t, n, p)
        })
    }
    listen = (p) => {
        //debug({ listen: p.id, p })
        if (p.div) Object.keys(p.div).forEach(d => this.listen(p.div[d]))
        if (p.tt) Object.keys(p.tt).forEach(id => p.tt[id].listen())
        if (p.frm) Object.keys(p.frm).forEach(id => p.frm[id].listen())
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
        if (p.frm) {
            Object.keys(p.frm).forEach(id => p.frm[id].remove(null, true))
            p.frm = {}
        }
    }
    pdiv = (n) => {
        const d = this.div && this.div[n]
        if (d) return d
        else if (this.p) return this.p.pdiv(n)
        else return null
    }
    reload = (n) => {
        if (!n) this.render(this)
        else {
            const div = this.pdiv(n)
            if (div) this.render(div)
            else error({ reload: n })
        }
    }
    links = (o, t, n, p) => {
        if (t === 'div') {
            const h = o._p('html')(n, p)
            if (typeof h === 'string') {
                const div = new Html(o, n, p)
                return h && this.replace(div, h)
            }
            else if (typeof h === 'object') return this.replace(h)
            else error({ links: { o, t, n, p, h } })
        }
        else if (t === 'var') {
            const vf = o._p('var'), v = vf && vf(n, p)
            if (v === undefined) error({ var: o, n, p })
            return v && this.replace(o, v)
        }
        else if (t === 'table') {
            const tbl = new Table(o, n, p), h = tbl.html()
            return h && this.replace(o, h)
        }
        else if (['input', 'button', 'select', 'textarea', 'checkbox'].includes(t)) {
            const ipt = new IN(o, t, n, p)
            return ipt.html()
        }
        else if (['svg', 'nav', 'link'].includes(t)) {
            const tt = new TT(o, t, n, p)
            return tt.html()
        }
        else {
            const h = nav.O(t, this, n, p)
            if (h) return this.replace(h)
            else error({ Object: this, t, n, p })
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
        const f = this._p('form'), fm = f && f()
        if (vs && fm) Object.keys(vs).forEach(k => {
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
        const f = this._p('form'), fm = f && f()
        if (fm) Object.keys(fm).forEach(name => {
            const l = this.fe(name)
            if (l) ret[name] = l.type === 'checkbox' || l.type === 'radio' ? l.checked : l.value
        })
        else error({ getForm: this })
        return ret
    }

}
export default Html
export { debug, error, _s, nav }