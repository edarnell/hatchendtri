import Html, { debug } from './Html'
import { links } from './links'
import { icons } from './icons'
import { pages } from './Page'
import { nav } from './Nav'
import { createPopper } from '@popperjs/core'

function removeTooltip() {
    const tt = document.getElementById('tooltip'),
        a = document.getElementById('arrow')
    if (a && tt && a.name === tt.name) {
        a.remove()
        tt.remove()
    }
}
class TT extends Html {
    constructor() {
        super()
    }
    connectedCallback() {
        this.innerHTML = this.replace_link()
        this.addEventListener("mouseenter", this.tooltip)
        this.addEventListener("mouseleave", removeTooltip)
        this.addEventListener("click", this.click)
    }

    disconnectedCallback() {
        this.removeEventListener("mouseenter", this.tooltip)
        this.removeEventListener("mouseleave", removeTooltip)
        this.removeEventListener("click", this.click)
        this.innerHTML = ''
        if (this.show) removeTooltip()
        delete this
    }
    link = () => {
        const root = nav.page, page = root && root.firstChild,
            link = page && page.link
        let ret
        if (typeof link === 'function') ret = link(this)
        if (!ret && page) {
            const { type } = this.attr()
            if (type === 'button') {
                const form = page.form
                if (typeof form === 'function') ret = form(this)
            }
        }
        return ret
    }
    replace_link = () => {
        const { type, param, name } = this.attr(), k = name.toLowerCase(), link = this.link() || pages[k] || links[k] || icons[k]
        if (!link) debug({ TT: this.attr() })
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
            else if (type === 'button') return `<button name="${k}" class="${link.class || 'form'}">${w}</button>`
            else return `<span name="${k}" class="${link.class || 'link'}">${w}</span>`
        }
        return "?"
    }

    click = (e) => {
        const type = this.getAttribute("type")
        if (this.lk && this.lk.nav) {
            e.preventDefault()
            nav.nav(this.lk.href)
        }
        else if (type === 'button' || this.lk.click) {
            const root = nav.page, page = root && root.firstChild, update = page && page.update
            if (update) update(e, this)
        }
    }

    tooltip = (e) => {
        removeTooltip()
        const tt = document.createElement('div'),
            arrow = document.createElement('div'),
            link = this.lk
        tt.id = 'tooltip'
        arrow.id = 'arrow'
        tt.name = arrow.name = this.name
        tt.innerHTML = (link.f ? link.f(this, link) : link.tip)
        tt.setAttribute('data-theme', link.theme || 'dark')
        arrow.setAttribute('data-popper-arrow', true)
        tt.appendChild(arrow)
        document.body.appendChild(tt)
        const pop = createPopper(this.firstChild, tt, {
            placement: link.placement || 'top',
            modifiers: [{ name: 'offset', options: { offset: [0, 8], }, },],
        })
        //debug({ Tooltip: { l, link, tt, pop } })
        tt.setAttribute('data-show', '')
        this.show = true
    }

    dragdiv(l, d) {
        const div = document.createElement('div')
        div.id = 'drag_' + d.id
        if (this.drags[div.id]) {
            this.close(null, div.id)
        }
        else {
            div.innerHTML = card
            const cb = div.querySelector('.card-body')
            cb.appendChild(d)
            document.body.appendChild(div)
            this.watchClose(div)
            const pop = createPopper(l, div, {
                placement: 'top',
                modifiers: [{ name: 'offset', options: { offset: [0, 8], }, },],
            })
            //debug({ dragdiv: { l, d, div } })
            div.setAttribute('data-show', '')
        }
    }
}
export default TT
export { removeTooltip }