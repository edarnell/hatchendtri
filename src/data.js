import { page, debug } from './Html'
import { ajax } from './ajax'
import { unzip } from './unzip'


function data(req) {
    // can imrove to cache with local storage
    return new Promise((s, f) => {
        if (page[req]) s(page[req])
        else if (localStorage.getItem(req)) {
            const { date, data: d } = JSON.parse(localStorage.getItem(req))
            page[req] = unzip(d)
            page[req + '_date'] = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' })
                .format(new Date(date)).replace(",", " at ")
            ajax({ req: 'dates', files: [req] }).then(r => {
                if (r.date[req] === date) {
                    debug({ storage: req, date: r.date[req] })
                    s(page[req])
                }
                else {
                    debug({ stale: req, odate: r.date[req], date })
                    localStorage.removeItem(req)
                    data(req).then(r => s(r)).catch(e => f(e))
                }
            }).catch(e => f(e))
        }
        else ajax({ req: 'files', files: [req] }).then(r => {
            if (r.zips && r.zips[req]) {
                debug({ req, date: r.date })
                if (req === '2023C') page[req] = r.zips[req]
                else {
                    localStorage.setItem(req, JSON.stringify(r.zips[req]))
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

function cleanse(swim) {
    // 400m freestyle world record as of 2021 03:40.07
    const s = swim && swim.match(/^(?:00:)?((?:0)?[4-9]|[1][0-9]):[0-5][0-9]$/)
    const r = s ? s[0].replace(/^00:/, '').replace(/^0/, '') : ''
    return r
}

export { data, save, req, cleanse }