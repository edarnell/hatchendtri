const debug = console.log.bind(console),
    dbg = window._test ? console.log.bind(console) : () => { },
    error = console.error.bind(console)
import TT from './TT.mjs'
import IN from './IN.mjs'
import Popup from './Popup.mjs'
import Img from './Img.mjs'
import Table from './Table.mjs'
var nav

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
    constructor(o, n, p) {

        if (o && n && nav) {
            Object.assign(this, { o, n, p })
            const id = this.id = n
            if (nav.id[id]) error({ Html: this, o, n, p })
            else nav._id[id] = this
        }
        else if (o === null && n === 'nav') {
            Object.assign(this, p)
            nav = this
            this._data = {}
            this._id = {}
            this.id = 'nav'
            this.init('nav')
            this.render(nav, 'root')
        }
        else error({ Html: this, o, n, p })
    }
    init(p) {
        const fav = document.createElement('link')
        fav.rel = 'shortcut icon'
        fav.href = this._img['favicon']
        fav.type = 'image/x-icon'
        document.head.appendChild(fav)
        const style = document.createElement('style')
        style.innerHTML = this.css
        document.head.appendChild(style)
    }
    q = (q) => document.querySelector(q) // const l = this.q(`[id*="IN_${n}_"]`)
    qId = (id) => document.getElementById(id)
    render(o, id = o.id) {
        if (o === this) this.unload(this)
        else if (o.o && o.o.div && o.o.div[id]) {
            this.unload(o.o.div[id])
            o.o.div[id] = o
        }
        const html_ = this.replace(o)
        const e = this.q(`#${id}`)
        if (e) { // prevent nested divs with same id
            const t = document.createElement('div')
            t.innerHTML = html_
            const t1 = t.firstChild
            if (t1.id === id) e.innerHTML = t1.innerHTML
            else e.innerHTML = html_
        }
        else error({ render: this, id })
        requestAnimationFrame(() => {
            this.listen(o) // may need delay for pupeteer
        })
    }
    page = (pg) => {
        if (this.id !== 'nav' || !nav._html[pg]) error({ page: this, pg })
        else {
            if (this.pg) this.unload(this.pg)
            this.pg = new Html(this, pg)
        }
        const html_ = this.replace(this.pg, `{${pg}}`),
            p = this.qId('page')
        p.innerHTML = html_
        if (p) p.innerHTML = html_
        else error({ page: this, p, pg })
        requestAnimationFrame(() => {
            this.listen(this.pg) // may need delay for pupeteer
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
        return this.rep(o, html)
        /*
        const c = html || nav._html[o.id],
            html_ = (typeof c === 'object') ? this.replace(c) : c
        return html_ && this.rep(o, html_)*/
    }
    rep = (o, h) => {
        let r = /\{([\w_]+)(?:\.([^\s{}]+))?\}/g
        let ms = Array.from(h.matchAll(r))
        let rs = ms.map(m => this.links(o, m[1], m[2]))
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
        else if (this.o) return this.o.pdiv(n)
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
    links = (o, n, p) => {
        const t = n.toLowerCase(),
            //h = nav._html[t],
            l = nav._link[t],
            pop = nav._popup[t],
            f = nav._form[t]
        if (h) return this.replace(o, h)
        else if (l) {
            const tt = new TT(o, n, p)
            return tt.html()
        }
        else if (pop) {
            const p = new Popup(o, n, p)
            return p.html()
        }
        else if (f) {
            const fi = new IN(o, n, p)
            return fi.html()
        }
        else {
            error({ Object: this, t, n, p, nav })
            return `<r>{${t}}</r>`
        }
    }
    setForm = (vs) => {
        const fm = nv._form
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
        const fm = this.form
        if (fm) Object.keys(fm).forEach(name => {
            const l = this.fe(name)
            if (l && l.type !== 'button' && l.type !== 'submit') ret[name] = (l.type === 'checkbox' || l.type === 'radio') ? l.checked : l.value
        })
        else error({ getForm: this })
        return ret
    }
}
export default Html
export { debug, error, dbg, nav, _s, snakeCase, jsonToHtml }