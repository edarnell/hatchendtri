import { debug, nav } from './Html'
import { ajax } from './ajax'
import { unzip } from './unzip'

class Data {
    constructor() {
        this.data = {}
        this.dates = {}
    }
    check = async (req) => {
        if (Array.isArray(req.data)) return req.every(r => this.data[r])
        else return this.data[req && req.data]
    }
    get = (files) => {
        files.forEach(n => this.loadZip(n))
        return new Promise((s, f) => {
            ajax({ req: 'dates', files }).then(r => {
                const load = []
                files.forEach(n => {
                    const date = this.dates[n]
                    if (r.date[n] !== date) {
                        debug({ stale: n, ndate: r.date[n], date })
                        localStorage.removeItem('HE' + n)
                        load.push(n)
                    }
                })
                if (load.length) this.load(load).then(r => s(r)).catch(e => f(e))
                else s(false)
            }).catch(e => f(e))
        })
    }
    load = (files) => {
        return new Promise((s, f) => {
            return ajax({ req: 'files', files }).then(r => {
                const dates = {}
                files.forEach(n => {
                    if (r.zips[n]) dates[n] = this.saveZip(n, r.zips[n])
                })
                s(dates)
            }).catch(e => f(e))
        })
    }
    saveZip = (f, z) => {
        if (!z && typeof f === 'object') {
            z = Object.values(f)[0]
            f = Object.keys(f)[0]
        }
        if (z) {
            if (f.charAt(0) !== '_') localStorage.setItem('HE' + f, JSON.stringify(z))
            this.data[f] = unzip(z.data)
            this.dates[f] = z.date
        }
        return z ? this.dates[f] : false
    }
    saveCsv = (f, c) => {
        if (c) {
            this.data[f] = c.data
            this.dates[f] = c.date
        }
        return c ? this.dates[f] : false
    }
    loadZip = (n) => {
        if (this.data[n]) return this.dates[n]
        const z = n && localStorage.getItem('HE' + n)
        if (z) {
            const { date, data: d } = JSON.parse(z)
            this.data[n] = unzip(d)
            this.dates[n] = date
        }
        return z ? this.dates[n] : false
    }
}
export default Data