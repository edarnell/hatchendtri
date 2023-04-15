import Html, { debug } from './Html'

class Table extends Html {
    constructor() {
        super()
    }
    connectedCallback() {
        // Add code to run when the element is added to the DOM
        //debug('Table connectedCallback', this)
        this.innerHTML = this.render(this.render_table())

    }
    rows = () => {
        const ths = this.page('ths'), trs = this.page('trs')
        if (typeof ths === 'function' && typeof trs === 'function') return { ths: ths(this), trs: trs(this) }
    }
    render_table = () => {
        const { ths, trs } = this.rows()
        if (trs.length === 0) return '' // could have option to return header only
        if (ths && trs) {
            return `<table><thead>${this.head(ths)}</thead><tbody>${this.body(trs)}</tbody></table>`
        }
        else {
            this.error("Table ths=(o)=> trs=(o)=>")
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