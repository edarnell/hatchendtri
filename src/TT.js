import Html, { debug } from './Html'
import { links } from './links'
import { icons } from './icons'
import { pages } from './Page'
import { createPopper } from '@popperjs/core'

class TT extends Html {
    constructor() {
        super()
    }
    //debug = (m) => debug({ TT: this.o(), m })
    listen = (set = true) => {
        const lk = this.lk
        if (lk && set) {
            if (lk.popup || lk.click || lk.nav || lk.submit || this.attr().name === 'close') {
                this.addEventListener("click", this.click)
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
        let ret
        const f = this.parent('link') || this.page('link')
        if (typeof f === 'function') ret = f(this)
        if (!ret && this.attr().name === 'close') {
            ret = { class: 'close', tip: 'close', click: this.close }
        }
        return ret
    }
    html = () => {
        const { type, param, name } = this.attr(), k = name.toLowerCase(), link = this.link() || pages[k] || links[k] || icons[k]
        if (!link) debug({ TT: "link=(o)=>", o: this.o() })
        else {
            this.lk = link
            const icon = (link.icon_ && icons[link.icon_]) || (link.icon && icons[link.icon]) || (type === 'svg' && icons[k]),
                img = icon ? `<img name="${k}" src="${icon.default}" class="${link.class || 'icon'}" />` : '',
                w = link.icon || type === 'svg' ? img
                    : param ? param.replace(/_/g, "&nbsp;") + img : name.replace(/_/g, "&nbsp;") + img
            if (link.nav) {
                return `<a name="${k}" href="${link.href}">${w}</a>`
            }
            else if (link.href) {
                return `<a name="${k}" href="${link.href}" target="_blank" rel="noreferrer"  ${link.class ? `class="${link.class}"` : ''}>${w}</a>`
            }
            else return `<span name="${k}" class="${link.class || 'link'}">${w}</span>`
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
                nav.nav(lk.href)
                const p = this.parent('close')
                //debug({ TT: "nav", o: this.o(), e, p })
                if (p) p()
            }
            else if (typeof lk.click === 'function') lk.click(e, this)
            else if (lk.click) {
                const update = this.parent('update') || this.page('update')
                if (update) update(e, this)
                else debug({ TT: "update=(e,o)=>", o: this.debug(), e })
            }
            else if (this._form) this.input(e)
            else debug({ TT: "click", o: this.o(), e, lk })
        }
        else debug({ TT: "click", o: this.o(), e })
    }
    tooltip = (e) => {
        const tt = this.tt = document.createElement('div'),
            arrow = this.arrow = document.createElement('div'),
            link = this.lk,
            { name } = this.attr()
        tt.classList.add('tooltip')
        arrow.classList.add('arrow')
        tt.setAttribute("name", name)
        arrow.setAttribute("name", name)
        const html = link.tip ? (typeof link.tip === 'function' ? link.tip(e, this) : link.tip)
            : (typeof link.hover === 'function' ? link.hover(this) : link.hover)
        tt.innerHTML = this.render(html)
        tt.setAttribute('data-theme', link.theme || (link.tip ? 'dark' : 'light'))
        arrow.setAttribute('data-popper-arrow', true)
        tt.appendChild(arrow)
        document.body.appendChild(tt)
        this.tip = createPopper(this.firstChild, tt, {
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