import Html, { debug } from './Html'
import { createPopper } from '@popperjs/core'

class Popup extends Html {
    constructor() {
        super()
    }
    connectedCallback() {
        this.innerHTML = this.replace_link()
        if (this.lk) {
            this.addEventListener("mouseenter", this.popup)
            this.addEventListener("mouseleave", this.remove)
            this.addEventListener("click", this.click)
        }
    }

    disconnectedCallback() {
        if (this.lk) {
            this.removeEventListener("mouseenter", this.popup)
            this.removeEventListener("mouseleave", this.remove)
            this.removeEventListener("click", this.click)
        }
        this.innerHTML = ''
        if (this.show) remove()
    }
    link = () => {
        const link = this.page('popup')
        let ret
        if (typeof link === 'function') ret = link(this)
        return ret
    }
    replace_link = () => {
        const { type, param, name } = this.attr(), k = name.toLowerCase(), link = this.link()
        if (!link) debug({ TT: "popup=(o)=>", o: this.debug() })
        else {
            this.lk = link
            const w = param ? param.replace(/_/g, "&nbsp;") : name.replace(/_/g, "&nbsp;")
            return `<span name="${k}" class="${link.class || 'link'}">${w}</span>`
        }
        return "?"
    }

    click = (e) => {
        this.clicked = true
    }
    remove = (e) => {
        if (this.popdiv) this.popdiv.remove()
    }
    popup = (e) => {
        const popup = this.popdiv = document.createElement('div')
        const link = this.lk
        popup.name = this.name
        const html = link.f ? this.link.f(this) : link.html
        popup.innerHTML = this.render(html)
        document.body.appendChild(popup)
        const pop = createPopper(this.firstChild, popup, {
            placement: link.placement || 'top',
            modifiers: [{ name: 'offset', options: { offset: [0, 8], }, },],
        })
        //debug({ Tooltip: { l, link, tt, pop } })
        //popup.setAttribute('data-show', '')
        this.show = true
    }
}
export default Popup