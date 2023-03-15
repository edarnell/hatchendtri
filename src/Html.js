const debug = console.log.bind(console)
import { tooltip, removeTooltip } from './tooltip'
import { navlinks, nav } from './Nav'

class Html extends HTMLElement {
    constructor(html, css, replace, links) {
        super()
        const template = document.createElement('template')
        let _html = html.toString()
        if (replace) _html = this.replace(replace, _html)
        if (links) _html = this.createLinks(links, _html)
        if (navlinks) _html = this.navLinks(_html)
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
                links[k].href ? `<a id="${k}_${i++}" class="${links[k].class}" name="${k}" href="${links[k].href}">${links[k].text}</a>`
                    : `<span class="link" id="${k}_${i++}" name="${k}">${links[k].text}</span>`)
        })
        return html
    }
    navLinks(html) {
        let i = 0
        Object.keys(navlinks).forEach(k => {
            html = html.replaceAll(`{nav.${k}}`,
                `<a id="nav.${k}_${i++}" name="nav_${k}" href="${navlinks[k].href}">${k}</a>`)
        })
        return html
    }
    watchLinks = (links) => {
        Object.keys(links).forEach(n => {
            if (!links[n].tip) return
            const ls = this.shadowRoot.querySelectorAll(`[name=${n}]`)
            if (ls) ls.forEach(l => {
                // debug({ watchLinks: { n, l } })
                l.addEventListener('mouseenter', () => tooltip(l, links[n]))
                l.addEventListener('mouseleave', () => removeTooltip())
            })
        })
        Object.keys(navlinks).forEach(n => {
            const ls = this.shadowRoot.querySelectorAll(`[name=nav_${n}]`)
            if (ls) ls.forEach(l => {
                l.addEventListener('click', () => nav(n))
                if (navlinks[n].tip) {
                    l.addEventListener('mouseenter', () => tooltip(l, navlinks[n]))
                    l.addEventListener('mouseleave', () => removeTooltip())
                }
            })
        })
    }
}
export default Html