const debug = console.log.bind(console)
import { tooltip, removeTooltip } from './tooltip'
import { nav } from './Nav'
import { links } from './links'

class Html extends HTMLElement {
    constructor(html, css, replace) {
        super()
        const template = document.createElement('template')
        let _html = html.toString()
        if (replace) _html = this.replace(replace, _html)
        if (links) _html = this.createLinks(links, _html)
        if (replace) _html = this.replace(replace, _html)
        // if (navlinks) _html = this.navLinks(_html)
        template.innerHTML = _html
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        const style = document.createElement('style')
        style.innerHTML = css;
        this.shadowRoot.appendChild(style)
        if (links) this.watchLinks(links)
    }
    replace(replace, html) {
        Object.keys(replace).forEach(k => html = html.replaceAll(`{${k}}`, replace[k]))
        return html
    }
    createLinks(links, html) {
        let i = 0
        Object.keys(links).forEach(k => {
            const p = `\\{links\\.(_)?(${k})(?:\\.(.*))?\\}`
            const regex = new RegExp(p, 'gi')
            html = html.replace(regex, (m, _u, k1, k2) => {
                //console.log({ m, k1, k2 })
                const t = k2 ? k2.replaceAll('_', ' ') : k1.replaceAll('_', ' ')
                return links[k].href ? _u || links[k].nav ? `<a name="${k}" href="${links[k].href}" class="${links[k].class}">${t}</a>`
                    : `<a name="${k}" href="${links[k].href}" target="_blank" rel="noreferrer"  class="${links[k].class}">${t}</a>`
                    : `<span name="${k}" class="${links[k].class || 'link'}">${t}</span>`
            })
        })
        return html
    }
    watchLinks = (links) => {
        Object.keys(links).forEach(n => {
            if (!links[n].tip) return
            const ls = this.shadowRoot.querySelectorAll(`[name=${n}]`)
            if (ls) ls.forEach(l => {
                if (links[n].nav) l.addEventListener('click', () => nav(n))
                l.addEventListener('mouseenter', () => tooltip(l, links[n]))
                l.addEventListener('mouseleave', () => removeTooltip())
            })
        })
    }
}
export default Html