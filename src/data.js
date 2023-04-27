import { page, debug } from './Html'
import { ajax } from './ajax'
import { unzip } from './unzip'


function data(req) {
    // can imrove to cache with local storage
    return new Promise((s, f) => {
        if (page[req]) s(page[req])
        else ajax({ req: 'files', files: [req] }).then(r => {
            if (r.zips && r.zips[req]) {
                debug({ zips: r.zips })
                if (req === '2023C') page[req] = r.zips[req]
                else {
                    page[req] = unzip(r.zips[req].data)
                    debug({ date: r.zips[req].date })
                    page[req + '_date'] = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' })
                        .format(new Date(r.zips[req].date)).replace(",", " at ")
                }
                s(page[req])
            }
            else f(r)
        }).catch(e => f(e))
    })
}

function req(p) {
    return new Promise((s, f) => {
        if (p.req) ajax(p).then(r => {
            if (r.vs) {
                page.vs = unzip(r.vs.data)
                if (page._update) page._update.setAttribute('param', 'update')
            }
            s(r)
        }).catch(e => f(e))
        else f({ error: "no req" })
    })
}

function save(data) {
    return new Promise((s, f) => {
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

function vs(r) {
    const vs = page.vs = unzip(r.vs.data)
    const emails = page.emails2 = unzip(r.emails.data)
    page.ids = Object.fromEntries(Object.entries(page.emails2).map(([email, id]) => [id, email]))
    const files = page.emails = unzip(r.files.data)
    debug({ emails })
    page.v2023 = unzip(r.v2023.data)
    page.emails_date = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' })
        .format(new Date(r.emails.date)).replace(",", " at ")
    return { vs, emails }
}

export { data, save, req }