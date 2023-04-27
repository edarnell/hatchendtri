import { debug } from './Html'
function csv(ent) {
    const map = { first: 'Forename', last: 'Surname', gender: 'Gender', cat: 'EventName', id: 'UniqueID', club: 'Club' }
    const rows = ent.split('\n')
    const ret = []
    const head = rows[0].split(',').map(s => s.replace(/[\n\r]/g, '')), c = {}
    head.forEach(k => c[k] = head.indexOf(k))
    for (var i = 1; i < rows.length; i++) {
        if (!rows[i]) continue
        const row = rows[i].split(',').map(s => s.replace(/[\n\r]/g, '')), r = {}
        Object.keys(c).forEach(k => r[k] = row[c[k]])
        if (!r.email) debug('line error', r, rows[i])
        else ret.push(Object.fromEntries(Object.entries(map).map(([key, value]) => [key, r[value]])))
    }
    return ret
}

export { csv }