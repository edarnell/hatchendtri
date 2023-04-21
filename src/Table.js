import Html, { debug } from './Html'

class Table extends Html {
    constructor() {
        super()
    }
    html = () => {
        const table = this.rows()
        let html
        if (table) html = this.render_table(table)
        else debug({ table: "ths=>{},trs=>()", o: this.debug() })
        return html
    }
    rows = () => {
        const ths = this.parent('ths') || this.page('ths'), trs = this.parent('trs') || this.page('trs')
        if (typeof ths === 'function' && typeof trs === 'function') return { ths: ths(this), trs: trs(this) }
    }
    render_table = (table) => {
        const { ths, trs } = table
        if (trs && trs.length === 0) return '' // could have option to return header only
        if (ths && trs) {
            //debug({ ths, trs })
            return `<table><thead>${this.head(ths)}</thead><tbody>${this.body(trs)}</tbody></table>`
        }
        else {
            debug({ Table: "Table ths=(o)=> trs=(o)=>", o: this.o() })
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