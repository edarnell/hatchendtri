import { links } from './links.mjs'
import { icons } from './icons.mjs'
import { createPopper } from '@popperjs/core'
import { nav, error, debug, dbg } from './Html.mjs'

class TT {
    constructor(p, type, name, param, fm) {
        Object.assign(this, { p, type, name, param, fm })
        if (!fm && type !== 'img') {
            if (!name) error({ TTe1: this })
            else {
                if (!p.tt) p.tt = {}
                this.id = 'TT_' + name.toLowerCase() + '_' + p.id + '_' + Object.keys(this.p.tt).length
                p.tt[this.id] = this
            }
        }
    }
    listen = (set = true) => {
        const lk = this.lk, l = this.el()
        if (!l) {
            const { id, p, type, name, param, fm } = this
            error({ TTe2: { id, type, name, param, fm } })
        }
        else if (lk && set) {
            if (lk.popup || lk.drag || lk.click || lk.nav || lk.submit || lk.close) {
                l.addEventListener("click", this.click)
            }
            else if (this.fm) l.addEventListener("input", this.input)
            if (lk.hover || lk.tip) {
                l.addEventListener("mouseenter", this.tooltip)
                l.addEventListener("mouseleave", this.remove)
            }
        }
        else if (lk && !set) {
            this.remove(null, true)
            this.lk = null
        }
    }
    ttremove = () => {
        if (this.tip) this.tip.destroy()
        if (this.tt) this.tt.remove()
        if (this.arrow) this.arrow.remove()
        if (this.timer) clearTimeout(this.timer)
        this.timer = this.tt = this.tip = this.arrow = null
    }
    remove = (e, listeners, click = true) => {
        this.ttremove()
        if (this.pO) this.pO.unload(this.pO)
        if (this.pop) this.pop.destroy()
        if (this.pdiv) this.pdiv.remove()
        this.pop = this.pdiv = this.pO = null
        if (listeners) {
            const lk = this.lk, l = this.el()
            if (!l) error({ TTe3: this })
            else if (lk.hover || lk.tip) {
                l.removeEventListener("mouseenter", this.tooltip)
                l.removeEventListener("mouseleave", this.remove)
            }
            if (click && (lk.click || lk.popup || lk.nav || lk.submit || this.name === 'close')) l.removeEventListener("click", this.click)
            else if (this.fm) l.removeEventListener("input", this.input)
        }
    }
    el = () => {
        const l = document.querySelector(`#${this.id}`)
        return l
    }
    html = () => {
        const { p, type, name, param } = this,
            k = name.toLowerCase(), l = p._p('link'),
            link = l && l(name, param) || nav.pages[k] || links[k] || icons[k]
                || (k === 'close' && {
                    class: 'close', tip: 'close', click: () => {
                        const p = this.p, pu = p && p.popup, close = (p && p.close) || (pu && pu.close)
                        if (typeof close === 'function') close()
                        else error({ close: this })
                    }
                })
        if (!link) error({ TTe4: this, type, name, param })
        else {
            this.lk = link
            if (link.id) this.id = link.id
            const icon = (link.icon_ && icons[link.icon_]) || (link.icon && icons[link.icon]) || (type === 'svg' && icons[k]),
                img = icon ? `<img id="${'icon_' + this.id}" src="${link.active ? icon.active : icon.default}" class="${link.class || 'icon'}"/>` : ''
            let w = link.body ? link.body(this) :
                link.icon || type === 'svg' ? img
                    : param ? param.replace(/_/g, "&nbsp;") + img : name.replace(/_/g, "&nbsp;") + img
            if (link.img) w = `<img id="${'img_' + this.id}" height="${link.height}" width="${link.width}" src="${link.img}" />`
            if (link.nav) {
                return `<a id="${this.id}" href="${link.href}">${w}</a>`
            }
            else if (link.href) {
                return `<a id="${this.id}" href="${link.href}" target="_blank" rel="noreferrer"  ${link.class ? `class="${link.class}"` : ''}>${w}</a>`
            }
            else return `<span id="${this.id}" class="${link.class || 'link'}">${w}</span>`
        }
        return "?"
    }
    click = (e) => {
        dbg({ click: this.id })
        const lk = this.lk
        if (lk) {
            e.preventDefault()
            if (this.tt) this.timer = setTimeout(this.ttremove, lk.tip === 'close' ? 100 : 1000)
            if (lk.popup || lk.drag) {
                if (this.pdiv) this.close()
                else this.popdiv(e)
                if (typeof lk.click === 'function') lk.click(e, this)
            }
            else if (lk.nav) {
                nav.load(lk.href)
            }
            else if (typeof lk.click === 'function') lk.click(e, this)
            else if (lk.click) {
                if (lk.click === 'submit') this.p.input(e, this)
                else if (this.p.click) this.p.click(e, this)
                else error({ TTclick: this, e })
            }
            else error({ TTclick: this, e })
        }
        else error({ TTclick: this, e })
    }
    tooltip = (e, m) => {
        dbg({ tooltip: this.id })
        this.ttremove()
        const tt = this.tt = document.createElement('div'),
            arrow = this.arrow = document.createElement('div'),
            link = this.lk,
            id = this.id
        tt.id = 'tip_' + id
        tt.classList.add('tooltip')
        arrow.classList.add('arrow')
        const html = m ?? (typeof link.tip === 'function' ? link.tip(e, this) : link.tip)
        tt.innerHTML = html
        tt.setAttribute('data-theme', link.theme || (link.tip ? 'dark' : 'light'))
        arrow.setAttribute('data-popper-arrow', true)
        tt.appendChild(arrow)
        document.body.appendChild(tt)
        this.tip = createPopper(this.el(), tt, {
            placement: link.placement || 'top',
            modifiers: [{ name: 'offset', options: { offset: [0, 8], }, },],
        })
        tt.setAttribute('data-show', '')
    }
    popdiv = (e) => {
        dbg({ popdiv: this.id })
        this.remove(null, true, false)
        const link = this.lk,
            p = this.pO = typeof (link.popup || link.drag) === 'function' ? link.popup ? link.popup() : link.drag() : nav.O(link.popup || link.drag, this.p)
        const popup = this.pdiv = document.createElement('div'),
            id = (link.popup ? 'popup_' : 'drag_') + this.id
        popup.classList.add(link.popup ? 'popup' : 'dragdiv')
        popup.id = id
        if (link.drag) popup.style.top = window.scrollY
        document.body.appendChild(popup)
        if (!p) error({ Popup: this, Objects: link.popup })
        else {
            p.id = id
            p.close = this.close
            p.render(p)
            if (link.popup) {
                this.pop = createPopper(this.el(), popup, {
                    placement: link.placement || 'top',
                    strategy: link.strategy || 'absolute',
                    modifiers: [{ name: 'offset', options: { offset: [0, 8], }, },],
                })
            }
        }
    }
    close = (m, d) => {
        dbg({ close: this.id, m, d })
        if (this.pdiv) {
            if (this.pO) this.pO.unload(this.pO)
            if (this.pdiv) this.pdiv.remove()
            if (this.pop) this.pop.destroy()
            this.pO = this.pop = this.pdiv = null
            this.listen(true)
            if (d) this.p.checkData()
            if (m) this.tooltip(null, m)
        }
        if (this.tt) this.timer = setTimeout(this.ttremove, 2000)
    }
}
export default TT