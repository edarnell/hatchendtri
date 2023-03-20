const debug = console.log.bind(console)
import { createPopper } from '@popperjs/core'
import { nav } from './Nav'
import { links as lnks } from './links'
import icons from './icons'

class Html extends HTMLElement {
    constructor(html, css, replace, forms) {
        super()
        const template = document.createElement('template')
        let _html = html.toString()
        if (replace) _html = this.replace(replace, _html)
        if (lnks) _html = this.createLinks(lnks, _html)
        if (forms) _html = this.forms(forms, _html)
        if (replace) _html = this.replace(replace, _html) // replace again incase used in lnks or forms
        template.innerHTML = _html
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        const style = document.createElement('style')
        style.innerHTML = css;
        this.shadowRoot.appendChild(style)
        if (lnks) this.watchLinks(lnks)
    }
    replace(replace, html) {
        Object.keys(replace).forEach(k => html = html.replaceAll(`{${k}}`, replace[k]))
        return html
    }
    createLinks(links, html) {
        let i = 0
        Object.keys(links).forEach(k => {
            const p = `\\{links\\.(_)?(${k})(?:\\.([^}]*))?\\}`, regex = new RegExp(p, 'gi'),
                link = links[k]
            html = html.replace(regex, (m, _u, k1, k2) => {
                //console.log({ m, k1, k2 })
                const t = k2 ? k2.replaceAll('_', ' ') : k1.replaceAll('_', ' ')
                if (link.icon) {
                    const src = icons[k].default
                    return `<img name="${k}" src="${src}" class="icon" />`
                }
                else if (link.href) {
                    if (_u || link.nav) return `<a name="${k}" href="${link.href}" ${link.class ? `class="${link.class}` : ''}">${t}</a>`
                    else return `<a name="${k}" href="${links[k].href}" target="_blank" rel="noreferrer"  ${link.class ? `class="${link.class}` : ''}">${t}</a>`
                }
                else return `<span name="${k}" ${link.class ? `class="${link.class}` : ''}">${t}</span>`
            })
        })
        return html
    }
    forms(forms, html) {
        let i = 0
        Object.keys(forms).forEach(k => {
            const p = `\\{(input||select||button)\\.(${k})}`, regex = new RegExp(p, 'gi'),
                form = forms[k]
            html = html.replace(regex, (m, t, k1) => {
                //console.log({ m, t, form })
                switch (t) {
                    case 'input':
                        return `<input  
                type="${form.type || 'text'}" 
                name="${k}"
                ${form.placeholder ? `placeholder="${form.placeholder}"` : ''} />`
                    case 'select':
                        return `<select name="${k}">${form.options.map(o => `<option>${o}</option>`).join('')}</select>`
                    case 'button':
                        return `<button name="${k}" ${form.class ? `class="${form.class}"` : ''}>${k1}</button>`
                }
            })
        })
        return html
    }
    setForm = (i, data) => {
        const form = this.links[i]
        if (form && form.change && form.ls) form.ls.forEach(el => {
            const name = el.getAttribute('name')
            if (el.tagName !== "BUTTON" && data[name] !== undefined) el.value = data[name]
        })
        else debug({ error: { i, data, links: this.links } })
    }
    getForm = (i) => {
        const data = {}, form = this.links[i]
        if (form && form.change && form.ls) form.ls.forEach(el => {
            const name = el.getAttribute('name'), opts = form.links[name].options
            if (el.tagName !== "BUTTON") data[name] = opts && el.value === opts[0] ? '' : el.value
        })
        return data
    }
    handle = (e) => {
        const l = e.target, n = l.getAttribute('name'), i = l.getAttribute('data-links'),
            ev = e.type, links = this.links[i].links,
            link = links[n]
        //debug({ ev, n, i, link, links: this.links })
        switch (ev) {
            case 'mouseenter':
                this.tooltip(l, link)
                break
            case 'mouseleave':
                this.removeTooltip()
                break;
            case 'click':
                if (link.nav) nav(link.href)
                else if (link.click) link.click(l, link)
                break
            default:
                debug({ error: { n, ev, link } })
        }
    }
    watchLinks = (links = lnks, change) => {
        if (!this.links) this.links = [{ links, ls: [], change }]
        else this.links.push({ links, ls: [], change })
        const i = this.links.length - 1, ls = this.links[i].ls
        Object.keys(links).forEach(n => {
            const els = this.shadowRoot.querySelectorAll(`[name=${n}]`)
            if (els) els.forEach(l => {
                l.setAttribute('data-links', i)
                if (l.tagName === "INPUT" || l.tagName === "SELECT") {
                    //debug({ change: n, l })
                    if (change) {
                        if (l.tagName === "INPUT") l.addEventListener('input', change)
                        else l.addEventListener('change', change)
                        ls.push(l)
                    }
                }
                else {
                    if (links[n].nav || links[n].click) l.addEventListener('click', this.handle)
                    else if (l.tagName === "BUTTON") l.addEventListener('click', change)
                    l.addEventListener('mouseenter', this.handle)
                    l.addEventListener('mouseleave', this.handle)
                    ls.push(l)
                }
            })
        })
        return i
    }
    remove = (lk) => {
        lk.ls.forEach(l => {
            if (lk.form) {
                if (l.tagName === 'INPUT') l.removeEventListener('input', lk.change)
                else if (l.tagName === "BUTTON") {
                    l.removeEventListener('click', lk.change)
                    l.removeEventListener('mouseenter', this.handle)
                    l.removeEventListener('mouseleave', this.handle)
                }
                else if (l.tagName === "SELECT") l.removeEventListener('change', lk.change)
                else debug({ error: { l } })
            }
            else {
                const name = l.getAttribute('name')
                if (lk.links[name].nav || lk.links[name].click) l.removeEventListener('click', this.handle)
                l.removeEventListener('mouseenter', this.handle)
                l.removeEventListener('mouseleave', this.handle)
            }
        })
    }
    removeLinks = (i) => {
        //debug({ removeLinks: i, links: this.links })
        // this.removeTooltip() - safe to leave tooltip
        if (i) {
            const ls = this.links[i]
            if (ls) this.remove(ls)
            this.links[i] = null
        }
        else {
            if (this.links) this.links.forEach(ls => {
                if (ls) this.remove(ls)
            })
            this.links = null
        }
    }
    tooltip(l, link) {
        this.removeTooltip()
        const tt = document.createElement('div'),
            arrow = document.createElement('div')
        tt.id = 'tooltip'
        arrow.id = 'arrow'
        tt.name = arrow.name = l.id
        tt.innerHTML = (link.f ? link.f(l, link) : link.tip)
        tt.setAttribute('data-theme', link.theme || 'dark')
        arrow.setAttribute('data-popper-arrow', true)
        tt.appendChild(arrow)
        document.body.appendChild(tt)
        const pop = createPopper(l, tt, {
            placement: link.placement || 'top',
            modifiers: [{ name: 'offset', options: { offset: [0, 8], }, },],
        })
        // debug({ Tooltip: { l, link, tt, pop } })
        tt.setAttribute('data-show', '')
        tt.setAttribute('data-timeout', setTimeout(this.removeTooltip, 2000))
    }

    removeTooltip() {
        const tt = document.getElementById('tooltip'),
            a = document.getElementById('arrow')
        if (a && tt && a.name === tt.name) {
            const timeout = tt.getAttribute('data-hide')
            if (timeout) clearTimeout(timeout)
            a.remove()
            tt.remove()
        }
    }
}
export default Html