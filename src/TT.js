import { debug } from './Dom'
import { links } from './links'
import { icons } from './icons'
import { pages } from './Nav'
import { createPopper } from '@popperjs/core'

class TT {
    constructor(parent, type, name, param) {
        Object.assign(this, { parent, type, param, name })
        if (!parent.tts) parent.tts = []
        this.ttid = parent.tts.length
        parent.tts.push(this)
    }
    listen = (set = true) => {
        const lk = this.lk
        if (lk && set) {
            if (lk.popup || lk.click || lk.nav || lk.submit) {
                parent.addEventListener("click", this.click)
            }
            if (this._form) this.addEventListener("input", this.input)
            if (lk.hover || lk.tip) {
                this.addEventListener("mouseenter", this.tooltip)
                this.addEventListener("mouseleave", this.remove)
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
    remove = (e, listeners) => {
        this.ttremove()
        if (this.pop) this.pop.destroy()
        if (this.div) this.div.remove()
        this.pop = this.div = null
        if (listeners) {
            const lk = this.lk
            if (lk.hover || lk.tip) {
                this.removeEventListener("mouseenter", this.tooltip)
                this.removeEventListener("mouseleave", this.remove)
            }
            if (this._form) this.removeEventListener("input", this.input)
            if (lk.click || lk.popup || lk.nav || lk.submit || this.attr().name === 'close') this.removeEventListener("click", this.click)
        }
    }
    link = () => {
        return false
        let ret
        const f = this.parent('link') || this.page('link')
        if (typeof f === 'function') ret = f(this)
        if (!ret && this.attr().name === 'close') {
            ret = { class: 'close', tip: 'close', click: this.close }
        }
        return ret
    }
    id = () => {
        return this.parent.id + '_TT_' + this.name + '_' + this.ttid
    }
    html = () => {
        const { type, name, param } = this,
            k = name.toLowerCase(), p = this.parent.page, l = p && p.link,
            link = l && l(name, param) || pages[k] || links[k] || icons[k]
        if (!link) debug({ TT: { type, name, param } })
        else {
            this.lk = link
            const icon = (link.icon_ && icons[link.icon_]) || (link.icon && icons[link.icon]) || (type === 'svg' && icons[k]),
                img = icon ? `<img id="${this.id()}" src="${icon.default}" class="${link.class || 'icon'}" />` : '',
                w = link.icon || type === 'svg' ? img
                    : param ? param.replace(/_/g, "&nbsp;") + img : name.replace(/_/g, "&nbsp;") + img
            if (link.nav) {
                return `<a id="${this.id()}" href="${link.href}">${w}</a>`
            }
            else if (link.href) {
                return `<a id="${this.id()}" href="${link.href}" target="_blank" rel="noreferrer"  ${link.class ? `class="${link.class}"` : ''}>${w}</a>`
            }
            else return `<span id="${this.id()}" class="${link.class || 'link'}">${w}</span>`
        }
        return "?"
    }
    click = (e) => {
        const lk = this.lk
        if (lk) {
            e.preventDefault()
            if (this.tt) this.timer = setTimeout(this.ttremove, 1000)
            if (lk.popup) {
                this.popdiv(e)
                if (typeof lk.click === 'function') {
                    debug({ TT: "click", o: this.o(), e, lk })
                    lk.click(e, this)
                }
            }
            else if (lk.nav) {
                this.parent.nav(lk.href)
                //const p = this.parent('close')
                //if (p) p()
            }
            else if (typeof lk.click === 'function') lk.click(e, this)
            else if (lk.click) {
                const update = this.parent('update') || this.page('update')
                if (update) update(e, this)
                else debug({ TT: "update=(e,o)=>", o: this.debug(), e })
            }
            else if (this._form) this.input(e)
            else debug({ TT: "click", e })
        }
        else debug({ TT: "click", e })
    }
    tooltip = (e) => {
        const tt = this.tt = document.createElement('div'),
            arrow = this.arrow = document.createElement('div'),
            link = this.lk,
            id = this.id()
        tt.classList.add('tooltip')
        arrow.classList.add('arrow')
        tt.setAttribute("name", id)
        arrow.setAttribute("name", id)
        const html = link.tip ? (typeof link.tip === 'function' ? link.tip(e, this) : link.tip)
            : (typeof link.hover === 'function' ? link.hover(this) : link.hover)
        tt.innerHTML = html
        tt.setAttribute('data-theme', link.theme || (link.tip ? 'dark' : 'light'))
        arrow.setAttribute('data-popper-arrow', true)
        tt.appendChild(arrow)
        document.body.appendChild(tt)
        this.tip = createPopper(this.parent.querySelector(`#${id}`), tt, {
            placement: link.placement || 'top',
            modifiers: [{ name: 'offset', options: { offset: [0, 8], }, },],
        })
        tt.setAttribute('data-show', '')
    }
    popdiv = (e) => {
        this.remove(null, true)
        this.addEventListener("click", this.close)
        const popup = this.div = document.createElement('div'),
            { name } = this.attr()
        popup.classList.add('popup')
        popup.setAttribute("name", name)
        const link = this.lk, param = e.target.getAttribute("data-param")
        const html = typeof link.popup === 'function' ? link.popup(this) : link.popup
        popup.innerHTML = this.render(html)
        popup.firstChild.popup = this
        if (param) popup.firstChild.setAttribute("param", param)
        document.body.appendChild(popup)
        this.pop = createPopper(this.firstChild, popup, {
            placement: link.placement || 'top',
            strategy: link.strategy || 'absolute',
            modifiers: [{ name: 'offset', options: { offset: [0, 8], }, },],
        })
    }
    close = () => {
        if (this.attr().name === 'close') {
            const popup = this.parent('popup')
            popup.close()
        }
        else if (this.div) {
            if (this.pop) this.pop.destroy()
            else debug({ TT: "close", o: this.o() })
            this.div.remove()
            this.removeEventListener("click", this.close)
            this.listen(true) // add back listeners
        }
    }
}
export default TT