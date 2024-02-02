import { saveF, d } from './files.mjs'

function testF(j) {
    const cmds = ['unsub', 'sub', 'rm', 'reg'],
        f = cmds.find(cmd => j[cmd]),
        p = f && j[f],
        a = typeof p === 'string' && p.includes('epdarnell+'),
        u = a && d._es[p]
    if (j.rm && (u || p === 'epdarnell+')) {
        let i = []
        if (p === 'epdarnell+') {
            for (const k in d._es) {
                if (k.includes('epdarnell+')) {
                    i.push(d._es[k].i)
                    delete d._es[k]
                }
            }
        }
        else {
            i.push(u.i)
            delete d._es[p]
        }
        saveF('es')
        return { rm: i }
    }
    if (j.reg && p) {
        let u // beware of shadowing
        const { first, last, email } = p,
            c = first && last && email && email.includes('epdarnell+')
        u = c && d._es[email]
        const added = !u && c ? true : false
        if (added) u = saveF('es', p)
        return { reg: email, i: u && u.i, added }
    }
    else if (u && j.unsub) {
        const { first, last, i } = u,
            un = u.fi.unsub ? null : { i, first, last, reason: 'test', date: new Date().toISOString() }
        if (un) saveF('unsub', un)
        return { unsub: i, changed: un ? true : false }
    }
    else if (u && j.sub) {
        if (u.fi.unsub) saveF('unsub', u, 'sub')
        return { sub: u.i, changed: u.fi.unsub ? true : false }
    }
    else return { f, p, u }
}

export { testF }