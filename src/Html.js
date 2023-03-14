const debug = console.log.bind(console)
import { tooltip, removeTooltip } from './tooltip'

class Html extends HTMLElement {
    constructor(html, css, replace, links) {
        super()
        const template = document.createElement('template')
        let _html = html.toString()
        if (replace) _html = this.replace(replace, _html)
        if (links) _html = this.createLinks(links, _html)
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
            html = html.replaceAll(`{links.${k}}`,
                links[k].href ? `<a id="${k}_${i++}" name="${k}" href="${links[k].href}">${links[k].text}</a>`
                    : `<span class="link" id="${k}_${i++}" name="${k}">${links[k].text}</span>`)
        })
        return html
    }
    watchLinks = (links) => {
        Object.keys(links).forEach(n => {
            const ls = this.shadowRoot.querySelectorAll(`[name=${n}]`)
            if (ls) ls.forEach(l => {
                debug({ watchLinks: { n, l } })
                l.addEventListener('mouseenter', () => tooltip(l, links[n]))
                l.addEventListener('mouseleave', () => removeTooltip())
            })
        })
    }
}
export default Html