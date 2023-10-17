import { debug } from './Html'
import { ajax } from './ajax'
import { unzip } from './unzip'

class Data {
    constructor(nav) {
        this.data = {}
        this.nav = nav
    }
    user = () => {
        return new Promise((s, f) => {
            const token = localStorage.getItem('token')
            if (token) ajax({ req: 'user' }).then(r => {
                const user = (r.vol || r.comp) ? {} : null
                if (r.vol) user.vol = r.vol.reduce((a, u) => {
                    a[u.id] = u
                    return a
                }, {})
                if (r.comp) user.comp = r.comp.reduce((a, u) => {
                    a[u.id] = u
                    return a
                }, {})
                s(user) // user or null (no vol or comp)
            })
            else s(false) // undefined (no token)
        })
    }
    admin = (ed) => {
        const u = this.nav._user, vs = u && u.vol
        let ret
        if (vs) ret = Object.values(vs).some(u => u.admin === true)
        if (ret && ed) ret = Object.values(vs).some(u => u.email === 'ed@darnell.org.uk')
        return ret
    }
    name = () => {
        const u = this.nav._user
        if (u && (u.vol || u.comp)) {
            if (this.nav.page.id === 'competitor' && u.comp) return Object.values(u.comp).map(c => `${c.first} ${c.last}`).join(', ')
            else if (u.vol) return Object.values(u.vol).map(v => `${v.name}`).join(', ')
            else if (u.comp) return Object.values(u.comp).map(c => `${c.first} ${c.last}`).join(', ')
        }
        else return null
    }
    check = (req) => {
        if (Array.isArray(req)) return req.every(r => this.data[r])
        else return this.data[req]
    }
    get = (req) => {
        if (Array.isArray(req)) return Promise.all(req.map(r => r && this.get(r)))
        else return new Promise((s, f) => {
            if (this.data[req]) s(this)
            else if (localStorage.getItem(req) && !req.endsWith('.csv')) {
                const { date, data: d } = JSON.parse(localStorage.getItem(req))
                debug({ storage:req})
                this.data[req] = req.endsWith('.csv')?d:unzip(d)
                this.data[req + '_date'] = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' })
                    .format(new Date(date)).replace(",", " at ")
                debug({ req, date: this.data[req + '_date'], data: this.data[req] })
                ajax({ req: 'dates', files: [req] }).then(r => {
                    if (r.date[req] === date) {
                        debug({ storage: req, date: r.date[req] })
                        s(this)
                    }
                    else {
                        debug({ stale: req, odate: r.date[req], date })
                        localStorage.removeItem(req)
                        this.get(req).then(r => s(r)).catch(e => f(e))
                    }
                }).catch(e => f(e))
            }
            else ajax({ req: 'files', files: [req] }).then(r => {
                if (r.zips && r.zips[req]) {
                    debug({ req:r })
                    if (req.endsWith('.csv')) this.data[req] = r.zips[req]
                    else {
                        localStorage.setItem(req, JSON.stringify(r.zips[req]))
                        this.data[req] = unzip(r.zips[req].data)
                        this.data[req + '_date'] = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' })
                        .format(new Date(r.zips[req].date)).replace(",", " at ")
                    }
                    s(this)
                }
                else f(r)
            }).catch(e => f(e))
        })
    }
}
export default Data

/*
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
*/
/*listen = () => {
    const hash = window.location.hash, token = hash && hash.substring(1)
    if (token && token.length > 10) {
        localStorage.setItem('token', token)
        window.location.hash = ''
    }
    const p = window.location.pathname.replace('/', '')
    this.user()
    if (token && p === 'yes' || p === 'no') {
        this.reply = p
        this.nav('volunteer')
    }
    else this.nav(p)
}

name = (c_v) => {
let r
c_v = c_v || 'vol'
if (this._user && this._user[c_v]) r = Object.values(this._user[c_v]).map(u =>
    `{link.u_${u.id}.${c_v === 'vol' ? _s(u.name) : _s(u.first + ' ' + u.last)}}`).join(', ')
else r = 'Volunteer'
return r
}
uid = (id, c_v) => {
c_v = c_v || 'comp'
const cs = this._user && this._user[c_v]
let ret = false
if (id && cs) Object.values(cs).forEach(u => { if (u.id * 1 === id * 1) ret = true })
return ret
}
users = (c_v) => {
c_v = c_v || 'vol'
if (this._user && this._user[c_v]) return Object.values(this._user[c_v])
}
admin = (ed) => {
const u = this._user, vs = u && u.vol
let ret
if (vs) ret = Object.values(vs).some(u => u.admin === true)
if (ret && ed) ret = Object.values(vs).some(u => u.email === 'ed@darnell.org.uk')
return ret
}
user = (p) => {
const token = localStorage.getItem('token')
if (this._token !== token) {
    this._token = token
    this._user = { vol: null, comp: null }
    if (token) req({ req: 'user' }).then(r => {
        if (r.vol) this._user.vol = r.vol.reduce((a, u) => {
            a[u.id] = u
            return a
        }, {})
        if (r.comp) this._user.comp = r.comp.reduce((a, u) => {
            a[u.id] = u
            return a
        }, {})
    })
    const l = this.querySelector(`.nav li img[name="user"]`)
    l.src = (token) ? icons['user'].active : l.src = icons['user'].default
}
const ui = this.querySelector(`ed-tt[name="user"]`)
if (p) ui.close()
}
*/
