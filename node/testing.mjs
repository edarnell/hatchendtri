import { saveF, d } from './files.mjs'

function rmV(m, rm) {
    for (const id in d._vs) {
        if (d._vs[id].email === m) {
            rm.push(id)
            delete d._vs[id]
            if (d.vr[id]) delete d.vr[id]
        }
    }
}

function rmU(m, rm, vrm) {
    const u = d._es[m]
    if (u) {
        rm.push(u.i)
        delete d._es[m]
        rmV(m, vrm)
    }
}


function testF(j) {
    const cmds = ['unsub', 'sub', 'rm', 'reg'],
        f = cmds.find(cmd => j[cmd]),
        p = f && j[f],
        a = typeof p === 'string' && p.includes('epdarnell+'),
        u = a && d._es[p]
    if (j.rm && (u || p === 'epdarnell+')) {
        let i = [], vrm = []
        if (p === 'epdarnell+') {
            for (const k in d._es) {
                if (k.includes('epdarnell+')) rmU(k, i, vrm)
            }
        }
        else rmU(p, i, vrm)
        if (i.length) saveF('es')
        if (vrm.length) saveF('vs')
        return { rm: i, vrm }
    }
    if (j.reg && p) {
        let u // beware of shadowing
        const { first, last, email, vol } = p,
            c = first && last && email && email.includes('epdarnell+')
        u = c && d._es[email]
        const added = !u && c ? true : false
        if (added) u = saveF('es', p)
        let vrm = []
        if (vol === 'rm') rmV(email, vrm)
        if (vrm.length) saveF('vs')
        return { reg: email, i: u && u.i, added, vrm }
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