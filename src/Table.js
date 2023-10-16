const debug = console.log.bind(console)
const error = console.error.bind(console)

class Table {
    constructor(p, name, param) {
        Object.assign(this, { p, name, param })
        this.page = p.page
    }
    html = () => {
        const table = this.rows()
        let html
        if (table) html = this.render_table(table)
        else debug({ table: "ths=>{},trs=>()", p: this.p })
        return html
    }
    rows = () => {
        const { page, name, param } = this, ths = this.p._p('ths'), trs = this.p._p('trs')
        return { ths: ths(name, param), trs: trs(name, param) }
    }
    render_table = (table) => {
        const { ths, trs } = table
        if (trs && trs.length === 0) return '' // could have option to return header only
        if (ths && trs) {
            //debug({ ths, trs })
            return `<table><thead>${this.head(ths)}</thead><tbody>${this.body(trs)}</tbody></table>`
        }
        else {
            debug({ Table: "Table ths=(o)=> trs=(o)=>" })
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