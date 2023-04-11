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
    render_table = () => {
        const p = this.parentNode, data = p.data, cols = data.cols, rows = data.rows
        this.data = { links: data.links }
        if (cols && rows) {
            return `<table><thead>${this.head(cols)}</thead><tbody>${this.body(rows)}</tbody></table>`
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