import { debug } from './Html'
function csv(ent) {
    // can add more but check anon function
    const map = { first: '"First Name"', last: '"Last Name"', email: '"Email Address"' }
    const rows = ent.split('\n')
    const cs = {}
    const head = rows[0].split(',').map(s => s.replace(/[\n\r]/g, '')), c = {}
    head.forEach(k => c[k] = head.indexOf(k))
    //debug({ c })
    //return
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
function unsub(r) {
    const u = csv(r.zips['MCu.csv']), c = csv(r.zips['MCc.csv']),
        unsub = {}
    Object.values(u).forEach(v => unsub[v.email.toLowerCase()] = v.email)
    Object.values(c).forEach(v => unsub[v.email.toLowerCase()] = v.email)
    debug({ unsub })
    return { unsub }
}
export { unsub }