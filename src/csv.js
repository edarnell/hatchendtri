import Html, { debug, nav } from './Html'

function str2csv(ent) { // could add code to map first line.
    const rows = ent.split('\n')
    if (/^\s*$/.test(rows[rows.length - 1])) rows.pop() // remove last line if blank
    const rs = rows.map(r => r.split(',').map(s => s.replace(/[\n\r]/g, '')))
    return rs
}

class CSV extends Html {
    constructor(p) {
        super(p.p, p.name, p.param)
        this.csv = {}
        this.close = () => p.close()
        this.data = this.name + '.csv'
    }
    loaded = () => {
        this.csv[this.name] = str2csv(nav.d.data[this.name + '.csv'])
        //debug({ csv: this, csv: this.csv[this.name] })
    }
    html = (p, n) => {
        debug({ csv: this, p, n })
        return `<div class="card fit">
            <div class="card-header">
            {link.close.×}
                <span class="title">${this.name}</span>
            </div>
            <div class="card-body">
            <div class='scroll wide resize'>{table.${this.name}}</div>
            </div>
            </div>`
    }
    ths = (n) => {
        //debug({ ths: n })
        if (this.csv[n]) return this.csv[n][0]
    }
    trs = (n) => {
        //debug({ trs: n })
        if (this.csv[n]) return this.csv[n].slice(1)
    }
}
/*
csv = (ent, map) => {
    //const map = { first: '"First Name"', last: '"Last Name"', email: '"Email Address"' }
    const cmap = {
        first: 'Forename', last: 'Surname', gender: 'Gender',
        swim400: 'Estimated_400m_swim_time',
        cat: 'EventName',
        eid: 'UniqueID',
        club: 'Club',
        email: 'email',
        phone: 'phone'
    }
    const rows = ent.split('\n')
    const cs = {}
    const head = rows[0].split(',').map(s => s.replace(/[\n\r]/g, ''))
        , c = {}
    head.forEach(k => c[k] = head.indexOf(k))
    if (map === 0) {
        debug({ head, c })
        return c
    }
    else map = map || cmap
    for (var i = 1; i < rows.length; i++) {
        if (!rows[i]) continue
        const row = rows[i].split(',').map(s => s.replace(/[\n\r]/g, '')), r = {}
        Object.keys(map).forEach(k => r[k] = row[c[map[k]]])
        r.id = i
        if (!r.email) debug('line error', r, rows[i])
        else cs[i] = r
    }
    //debug({ cs })
    return cs
}
csvE = (ent) => {
    //const map = { first: '"First Name"', last: '"Last Name"', email: '"Email Address"' }
    const rows = ent.split('\n')
    const cs = {}
    const head = rows[0].split(',').map(s => s.replace(/[\n\r]/g, '')), c = {}
    head.forEach(k => c[k] = head.indexOf(k))
    cs[0] = c
    for (var i = 1; i < rows.length; i++) {
        if (!rows[i]) continue
        const row = rows[i].split(',').map(s => s.replace(/[\n\r]/g, '')), r = {}
        Object.keys(c).forEach(k => r[k] = row[c[k]])
        cs[r['UniqueID']] = r
    }
    //debug({ cs })
    return cs
}*/

export { str2csv }
export default CSV 