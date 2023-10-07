import { debug } from './Dom'

class Table {
    constructor(parent, name, param) {
        Object.assign(this, { parent, name, param })
    }
    html = () => {
        const table = this.rows()
        let html
        if (table) html = this.render_table(table)
        else debug({ table: "ths=>{},trs=>()", o: this.o() })
        return html
    }
    rows = () => {
        const { name, param } = this, p = this.parent.page
        return { ths: p.ths(name, param), trs: p.trs(name, param) }
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