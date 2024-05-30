const debug = console.log.bind(console),
    error = console.error.bind(console)
import { saveF, d } from './files.mjs'

function rmV(i, rm) {
    const vs = d.ev[i]
    if (vs) vs.forEach(id => {
        rm[i].vs = rm[i].vs || []
        rm[i].vs.push(id)
        delete d._vs[id]
        if (d.vr[id]) delete d.vr[id]
    })
}

function rmU(email, rm) {
    const u = d._es[email], { i, first, last } = u
    if (u) {
        rm[i] = { i, first, last, email }
        rmV(i, rm)
        delete d._es[email]
    }
}

function testF(j) {
    const cmds = ['unsub', 'sub', 'rm', 'reg', 'debug', 'vol'],
        f = cmds.find(cmd => j[cmd]), // only 1 command
        p = f && j[f],
        a = typeof p === 'string' && p.includes('epdarnell+'),
        u = a && d._es[p]
    if (j.debug) {
        saveF('debug', j.debug)
        debug({ debug: j.debug })
        return { debug: d.debug }
    }
    else if (j.rm && (u || p === 'epdarnell+')) {
        const rm = {}
        if (p === 'epdarnell+') {
            for (const k in d._es) {
                if (k.includes('epdarnell+')) rmU(k, rm)
            }
        }
        else rmU(p, rm)
        if (Object.keys(rm).length) {
            saveF('es')
            if (Object.values(rm).some(m => m.hasOwnProperty('vs'))) saveF('vs')
        }
        debug({ rm: p })
        Object.values(rm).forEach(m => {
            debug(`${m.i}: ${m.first} ${m.last} ${m.email} ${m.vs ? `vs:[${m.vs}]` : ''}`)
        })
        return { rm }
    }
    if (j.reg && p) {
        let u, v // beware of shadowing
        const { first, last, email, vol } = p,
            c = first && last && email && email.includes('epdarnell+')
        u = c && d._es[email]
        const added = !u && c ? true : false
        if (added) u = saveF('es', p)
        let rm = {}
        if (vol === 'rm' && u) rmV(u.i, rm)
        if (vol === 'lead') {
            const vid = u && u.vs && u.vs[0], vr = vid && d.vr[vid]
            if (!vr || !vr.arole || vr.arole !== 'Lead') {
                v = saveF('vs', u, { adult: true, asection: 'Race Control', junior: true, arole: 'Lead', jsection: 'Race Control', jrole: 'Lead' })
            }
        }
        if (rm.vs) saveF('vs')
        debug(`reg: ${email} ${first} ${last} ${vol || ''} ${added ? 'added' : 'exists'} ${u.vs || ''}`)
        return { u }
    }
    else if (u && j.unsub) {
        const { first, last, i } = u,
            un = u.fi.unsub ? null : { i, first, last, reason: 'test', date: new Date().toISOString() }
        if (un) saveF('unsub', un)
        debug(`unsub: ${first} ${last} ${i} ${un ? 'changed' : 'unchanged'}`)
        return { unsub: i, changed: un ? true : false }
    }
    else if (u && j.sub) {
        const { first, last, i } = u, un = u.fi.unsub
        if (un) saveF('unsub', u, 'sub')
        debug(`sub: ${first} ${last} ${i} ${un ? 'changed' : 'unchanged'}`)
        return { sub: u.i, changed: u.fi.unsub ? true : false }
    }
    else if (j.vol) {
        const u = d._es[p],
            vs = u && d.ev && d.ev[u.i]
        debug(`vol: ${p} ${u && u.first} ${u && u.last} ${vs ? `vs:[${vs}]` : ''}`)
        return { i: u.i, vs, id: vs && vs[0] }
    }
    else {
        error({ f, p, u })
        return { f, p, u }
    }
}

export { testF }