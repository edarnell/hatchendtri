const debug = console.log.bind(console),
    dbg = window._test ? console.log.bind(console) : () => { },
    error = console.error.bind(console)
import TT from './TT.mjs'
import IN from './IN.mjs'
import Img from './Img.mjs'
import Table from './Table.mjs'
import { nav } from './Nav.mjs'

function _s(s, p) {
    if (p === undefined) return s && s.replace(/\s/g, "&nbsp;")
    else {
        const r = s && s.replace(/_|&nbsp;|\s/g, " ")
        return r && p ? r.toLowerCase() : r
    }
}

function snakeCase(str) {
    if (str === str.toLowerCase() || str === str.toUpperCase()) return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    else return str
}

function jsonToHtml(json) {
    let html = '<ul>'
    for (let key in json) {
        if (typeof json[key] === 'object' && json[key] !== null) {
            html += `<li>${key}: ${jsonToHtml(json[key])}</li>`
        } else {
            html += `<li>${key}: ${json[key]}</li>`
        }
    }
    html += '</ul>'
    return html
}

class Html {
    constructor(p, name, param) {
        if (p) {
            Object.assign(this, { p, name, param })
            const id = this.id = name + (param ? '_' + param : '');
            (p.div || (p.div = {}))[id] = this
        }
    }
    _p = (f) => {
        if (this[f]) return this[f]
        else if (this.p) return this.p._p(f)
        // else return undefined
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
    fe = (n, v) => {
        const l = this.q(`[id*="IN_${n}_"]`)
        if (!l) error({ fe: n, v })
        else if (v) l.value = v
        return l
    }
    render(o, id = o.id) {
        if (o === this) this.unload(this)
        else if (o.p && o.p.div && o.p.div[id]) {
            this.unload(o.p.div[id])
            o.p.div[id] = o
        }
        const _html = this.replace(o)
        const e = this.q(`#${id}`)
        if (e) { // prevent nested divs with same id
            const t = document.createElement('div')
            t.innerHTML = _html
            const t1 = t.firstChild
            if (t1.id === id) e.innerHTML = t1.innerHTML
            else e.innerHTML = _html
        }
        else error({ render: this, id })
        requestAnimationFrame(() => {
            this.listen(o) // may need delay for pupeteer
        })
    }
    checkData = (o) => {
        if (this._check === false) {
            delete this._check
            return
        }
        const data = (o || this)._p('data'),
            loaded = (o || this)._p('loaded')
        nav.user().then(r => nav.userIcon(r))
        if (data) nav.d.get(data).then(loaded)
    }
    replace = (o, html) => {
        if (!html && o && o.data) this.checkData(o)
        const c = (html || o._p('html')(o.name, o.param)),
            _html = (typeof c === 'object') ? this.replace(c) : c
        return _html && this.rep(o, _html)
    }
    rep = (o, h) => {
        let r = /\{([\w_]+)(?:\.([^\s}.]+))?(?:\.([^\s}]+))?\}/g
        let ms = Array.from(h.matchAll(r))
        let rs = ms.map(m => this.links(o, m[1], m[2], m[3]))
        return ms.reduce((res, m, i) => res.replace(m[0], rs[i]), h)
    }
    listen = (p) => {
        if (p.div) Object.keys(p.div).forEach(d => this.listen(p.div[d]))
        if (p.tt) Object.keys(p.tt).forEach(id => p.tt[id].listen())
        if (p.frm) Object.keys(p.frm).forEach(id => p.frm[id].listen())
        if (p.img) Object.keys(p.img).forEach(id => p.img[id].listen())
        if (p.rendered) p.rendered(p.id)
    }
    unload = (p) => {
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
        if (p.img) {
            Object.keys(p.img).forEach(id => p.img[id].remove(null, true))
            p.img = {}
        }
        if (p.popups) Object.keys(p.popups).forEach(id => p.popclose(id))
    }
    pdiv = (n) => {
        if (this.id === n) return this
        const d = this.div && this.div[n]
        if (d) return d
        else if (this.p) return this.p.pdiv(n)
        else return null
    }
    reload = (n) => {
        if (n === false) this._check = n
        if (!n) this.render(this)
        else {
            const div = this.pdiv(n)
            if (div) this.render(div)
            else error({ reload: this, n })
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
            if (v === undefined) error({ var: n, p })
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
        else if (t === 'img') {
            const img = new Img(o, t, n, p)
            return img.html()
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
    }
    setForm = (vs) => {
        const f = this._p('form'), fm = f && f()
        if (vs && fm) Object.keys(vs).forEach(k => {
            if (fm[k]) {
                const l = this.fe(k)
                if (l) {
                    if (l.type === 'checkbox' || l.type === 'radio') l.checked = vs[k]
                    else l.value = vs[k]
                }
                else error({ setForm: k, vs })
            }
        })
        else error({ setForm: vs })
        return this.getForm()
    }
    getForm = () => {
        let ret = {}
        const f = this._p('form'), fm = f && f()
        if (fm) Object.keys(fm).forEach(name => {
            const l = this.fe(name)
            if (l && l.type !== 'button') ret[name] = (l.type === 'checkbox' || l.type === 'radio') ? l.checked : l.value
        })
        else error({ getForm: this })
        return ret
    }
}
export default Html
export { debug, error, dbg, _s, nav, snakeCase, jsonToHtml }