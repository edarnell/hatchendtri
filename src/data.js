import { page, debug } from './Html'
import { ajax } from './ajax'
import { unzip } from './unzip'
import { Buffer } from 'buffer'

function data(req) {
    return new Promise((s, f) => {
        if (page[req]) s(page[req])
        else ajax({ req }).then(r => {
            if (r.volunteers) s(volunteers(r))
            else if (r.results) {
                page.results = unzip(r.results.data)
                s(page.results)
            }
            else f(r)
        })
    })
}

function req(p) {
    return new Promise((s, f) => {
        debug({ req })
        if (p.req) ajax(p).then(r => {
            s(r)
        }).catch(e => f(e))
        else f({ error: "no req" })
    })
}

function save(data) {
    return new Promise((s, f) => {
        debug({ data })
        if (data.vol) ajax({ req: 'vol', data }).then(r => {
            debug({ r })
            if (r.v2023) {
                const vs = page.v2023 = unzip(r.v2023.data)
                s(vs)
            }
            else f(r)
        }).catch(e => f(e))
    })
}

function volunteers(r) {
    const vs = page.volunteers = unzip(r.volunteers.data)
    const emails = page.emails = unzip(r.emails.data)
    page.v2023 = unzip(r.v2023.data)
    page.emails_date = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' })
        .format(new Date(r.emails.date)).replace(",", " at ")
    const v2023 = Buffer.from(r.vtxt.data).toString()
    Object.keys(vs).forEach(v => {
        if (vs[v].email && v2023.indexOf(vs[v].email) > -1) vs[v].v2023 = true
    })
    return { vs, emails }
}

export { data, save, req }