import Html, { debug } from './Html'
import { page } from './Page.js'

class Table extends Html {
    constructor() {
        super()
    }
    connectedCallback() {
        // Add code to run when the element is added to the DOM
        //debug('Table connectedCallback', this)
        this.innerHTML = this.render(this.render_table())

    }
    form = () => {
        const root = nav.page, page = root && root.firstChild,
            { ths, trs } = page
        let r = {}
        if (typeof ths === 'function' && typeof trs === 'function') return { ths: ths(this), trs: trs(this) }
        else debug({ ths, trs, page, root })
    }
    render_table = () => {
        const p = this.parentNode, data = p.data, { ths, trs } = this.form()
        if (ths && trs) {
            return `<table><thead>${this.head(ths)}</thead><tbody>${this.body(trs)}</tbody></table>`
        }
        else {
            debug({ error: 'no table', parent: p.id, data, cols, rows })
            return ''
        }
    }
    head = (cols) => {
        //debug({ head: cols })
        return `<tr>${cols.map(th => `<th>${th}</th>`).join('')}</tr>`
    }
    body = (rows) => {
        //debug({ body: rows })
        return rows.map(tr => `<tr>${tr.map(td => `<td>${td}</td>`).join('')}</tr>`).join('')
    }
}

export default Table