import { debug } from './Html.mjs'

function lists(r, es) {
    const mapM = { first: '"First Name"', last: '"Last Name"', email: '"Email Address"' }
    const map = {
        first: 'Forename', last: 'Surname', gender: 'Gender', cat: 'EventName', eid: 'UniqueID', club: 'Club', email: 'email', phone: 'phone',
        swim400: 'Estimated_400m_swim_time',
    }
    const ret = {}
    Object.keys(r.zips).forEach(k => {
        const ent = r.zips[k]
        const cs = csv(ent, k.charAt(0) === 'M' ? mapM : map)
        ret[k] = es ? emails(cs) : cs
    })
    return ret
}

function emails(l) {
    const ret = {}
    Object.values(l).forEach(c => {
        const e = c.email.toLowerCase()
        if (c.email) ret[e] = ret[e] ? ret[e].concat(c) : [c]
    })
    return ret
}

function merge(done, l) {
    const d1 = Object.keys(done).length, l1 = Object.keys(l).length
    let r = {}, nr = {}
    Object.keys(l).forEach(k => {
        if (!done[k]) {
            done[k] = k
            r[k] = l[k]
        }
        else nr[k] = l[k]
    })
    const d2 = Object.keys(done).length, r2 = Object.keys(r).length
    debug({ r2, l1, d1, d2, nr })
    return r
}
export { lists, merge }