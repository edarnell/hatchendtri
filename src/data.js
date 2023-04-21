import { page, debug } from './Html'
import { ajax } from './ajax'
import { unzip } from './unzip'

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
        }).catch(e => f(e))
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
            if (r.v2023) {
                const vs = page.v2023 = unzip(r.v2023.data)
                debug({ vs })
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
    return { vs, emails }
}

export { data, save, req }