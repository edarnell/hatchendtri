import { debug } from './Html'
function csv(ent, map) {
    //const map = { first: '"First Name"', last: '"Last Name"', email: '"Email Address"' }
    const cmap = { first: 'Forename', last: 'Surname', gender: 'Gender', cat: 'EventName', eid: 'UniqueID', club: 'Club', email: 'email', phone: 'phone' }
    const rows = ent.split('\n')
    const cs = {}
    const head = rows[0].split(',').map(s => s.replace(/[\n\r]/g, '')), c = {}
    head.forEach(k => c[k] = head.indexOf(k))
    map = map || cmap
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
export { csv }