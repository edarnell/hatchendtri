import Html, { debug } from './Html'
import { links } from './links'
import { icons } from './icons'
import { pages, page } from './Page'
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
        // Add code to run when the element is added to the DOM
        //debug('TT connectedCallback', this)
        this.innerHTML = this.replace_link()
        this.addEventListener("mouseenter", this.tooltip)
        this.addEventListener("mouseleave", removeTooltip)
        this.addEventListener("click", this.click)
    }

    disconnectedCallback() {
        // Add code to run when the element is removed from the DOM
        //debug({ disconnectedCallback: this })
        this.removeEventListener("mouseenter", this.tooltip)
        this.removeEventListener("mouseleave", removeTooltip)
        this.removeEventListener("click", this.click)
        this.innerHTML = ''
        if (this.show) removeTooltip()
    }

    replace_link = () => {
        const name = this.getAttribute("name"),
            type = this.getAttribute("type"),
            param = this.getAttribute("param"),
            k = name && name.toLowerCase(), data = this._data()
        if (type === 'nav') {
            const n = pages[k]
            this.link = n
        }
        else if (type === 'button') {
            const form = data && data.form
            this.link = form && form[k]
        }
        else if (type === 'svg') {
            this.link = icons[k]
        }
        else {
            const data = this._data(), lks = (data && data.links), lk = (lks && lks[k]) || links[k]
            this.link = lk
        }
        const link = this.link
        if (!link) debug({ type, link, data })
        else {
            const icon = (link.icon && icons[link.icon]) || (type === 'svg' && icons[k])
            const w = icon ? `<img name="${k}" data-image="${link.icon || ''}" src="${icon.default}" class="${link.class || 'icon'}" />`
                : param ? param.replace(/_/g, ' ') : name.replace(/_/g, ' ')
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

    tooltip = () => {
        removeTooltip()
        const tt = document.createElement('div'),
            arrow = document.createElement('div'),
            link = this.link
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

    click = (e) => {
        const type = this.getAttribute("type")
        if (this.link && this.link.nav) {
            e.preventDefault()
            nav.nav(this.link.href)
        }
        else if (type === 'button') {
            const data = this._data()
            if (data && data.update) data.update(e)
        }
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