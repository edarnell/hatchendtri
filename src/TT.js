import Html, { debug } from './Html'
import { links } from './links'
import { icons } from './icons'
import { pages } from './Page'
import { createPopper } from '@popperjs/core'

class TT extends Html {
    constructor() {
        super()
    }
    listen = (set = true) => {
        const lk = this.lk
        if (lk && set) {
            if (lk.popup || lk.click || lk.nav || lk.submit) {
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
    remove = (e, listeners) => {
        if (this.tt) this.tt.remove()
        if (this.arrow) this.tt.remove()
        if (this.div) this.div.remove()
        if (listeners) {
            const lk = this.lk
            if (lk.hover || lk.tip) {
                this.removeEventListener("mouseenter", this.tooltip)
                this.removeEventListener("mouseleave", this.remove)
            }
            if (this._form) this.removeEventListener("input", this.input)
            if (lk.click || lk.popup || lk.nav || lk.submit) this.removeEventListener("click", this.click)
        }
    }
    link = () => {
        const f = this.parent('link') || this.page('link')
        if (typeof f === 'function') return f(this)
    }
    html = () => {
        const { type, param, name } = this.attr(), k = name.toLowerCase(), link = this.link() || pages[k] || links[k] || icons[k]
        if (!link) debug({ TT: "link=(o)=>", o: this.o() })
        else {
            this.lk = link
            const icon = (link.icon && icons[link.icon]) || (type === 'svg' && icons[k])
            const w = icon ? `<img name="${k}" data-image="${link.icon || ''}" src="${icon.default}" class="${link.class || 'icon'}" />`
                : param ? param.replace(/_/g, "&nbsp;") : name.replace(/_/g, "&nbsp;")
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
            if (lk.popup) this.popup(e)
            else if (lk.nav) nav.nav(lk.href)
            else if (this._form) this.input(e)
            else if (typeof lk.click === 'function') lk.click(e, this)
            else if (lk.click) {
                const update = this.parent('update') || this.page('update')
                if (update) update(e, this)
                else debug({ TT: "update=(e,o)=>", o: this.debug(), e })
            }
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
        const pop = createPopper(this.firstChild, tt, {
            placement: link.placement || 'top',
            modifiers: [{ name: 'offset', options: { offset: [0, 8], }, },],
        })
        tt.setAttribute('data-show', '')
    }
    popup = (e) => {
        this.remove(null, true)
        const popup = this.div = document.createElement('div'),
            { name } = this.attr()
        popup.classList.add('popup')
        popup.setAttribute("name", name)
        const link = this.lk
        const html = typeof link.popup === 'function' ? link.popup(this) : link.popup
        popup.innerHTML = this.render(html)
        popup.firstChild.tt = this
        document.body.appendChild(popup)
        const pop = createPopper(this.firstChild, popup, {
            placement: link.placement || 'top',
            modifiers: [{ name: 'offset', options: { offset: [0, 8], }, },],
        })
    }
    close = () => {
        if (this.div) {
            this.div.remove()
            this.listen()
        }
    }
}
export default TT