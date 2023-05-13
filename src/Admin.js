import Html, { debug, page, _s } from './Html'
import { req, cleanse } from './data'
import { lists, merge } from './lists'
import { csv, csvE } from './csv'
import html from './html/Admin.html'
import { firstLast } from './roles'
import { unzip } from './unzip'

const form = { // section and options populated on load
    list: { options: ['cs', 'vs', 'v2023', 'm2023', 'c2023', 'prev', 'bounce', 'unsub'] },
    subject: { placeholder: 'subject' },
    message: { placeholder: 'message' },
    filter: { placeholder: 'name filter', width: '50rem' },
    cat: { options: ['Cat', 'Adult', 'An', 'Ae', 'Junior', 'TS', 'T1', 'T2', 'T3', 'Youth'] },
    mf: { options: ['M/F', 'M', 'F'] },
    C: { class: 'hidden form red bold', tip: 'clear name', submit: true },
    Save: { class: 'form red', tip: 'save cs' },
    Send: { class: 'form red' },
    Test: { class: 'form red' },
}

const cmap = {
    'Adult Experienced (17yrs+)': 'Ae',
    'Adult Novice (17yrs+)': 'An',
    'Youths : 15-16 yrs': 'Youth',
    'Tristar 3: 13-14 yrs': 'T3',
    'Tristar 2: 11-12 yrs': 'T2',
    'Tristar 1: 9-10 yrs': 'T1',
    'Tristart: 8 yrs': 'TS'
}

const mfmap = {
    'Open': 'M',
    'Male': 'M',
    'Female': 'F'
}

class Admin extends Html {
    constructor() {
        super()
        if (!nav.admin(true)) nav.nav('home')
        else this.data = 'cs_'
        form.Save.click = this.save
        form.Test.tip = form.Send.tip = this.tip
        form.Test.click = this.test
        form.Send.click = this.send
    }
    listen = () => {
        const f = this.getForm(form)
        if (f.list === 'cs') this.comp2023()
        else if (f.list === 'vs') {
            req({ req: 'files', files: ['vs_'] }).then(r => {
                debug({ r })
            })
        }
        else this.lists()
        /*
        else if (this._table) {
            req({ req: 'files', files: ['2023C.csv'] }).then(r => {
                this.cE = csvE(r.zips['2023C.csv'])
                //debug({ cE: this.cE })
                this._table._upd()
            })
        }
        */
    }
    tip = () => `${this._rows ? this._rows.length : 0} emails`
    lists = () => {
        const files = ['MCu.csv', 'MCc.csv', '2023C.csv', '2022C.csv', '2022W.csv', '2019C.csv', '2018C.csv', '2017C.csv']
        req({ req: 'files', files }).then(r => {
            const ls = lists(r, true), vs = page.vs_, done = {}
            this.unsub = merge(done, ls['MCu.csv'])
            this.bounce = merge(done, ls['MCc.csv'])
            const v2023 = {}, n2023 = {}, m2023 = {}
            Object.values(vs).forEach(v => {
                const e = v.year && v.email && v.email.toLowerCase(), y23 = e && !done[e] && v.year[2023],
                    vy = y23 && (y23.adult || y23.junior), vn = y23 && y23.none, ym = e && !done[e] && !vy && !vn
                if (vy) v2023[e] = v2023[e] ? v2023[e].concat(v) : [v]
                else if (ym) m2023[e] = m2023[e] ? m2023[e].concat(v) : [v]
            })
            this.v2023 = v2023
            this.m2023 = m2023
            page.cs = csv(r.zips['2023C.csv']) // for save
            this.c2023 = ls['2023C.csv']
            merge(done, ls['2023C.csv'])
            this.prev = merge(done, { ...ls['2017C.csv'], ...ls['2018C.csv'], ...ls['2019C.csv'], ...ls['2022W.csv'], ...ls['2022C.csv'] })
            this._table.setAttribute('param', 'update')
        })
    }
    test = (e, o) => {
        this.send(e, o, true)
    }
    send = (e, o, testing) => {
        const f = this.getForm(form), rows = testing ? this._rows.slice(0, 20) : this._rows,
            list = rows.map(r => ({ to: { name: r[0], email: r[1] } }))
        req({ req: 'bulksend', subject: f.subject, message: f.message, list, live: !testing }).then(r => {
            debug({ r })
        }).catch(e => this.error(e, o))
    }
    save = (e, o) => {
        if (page.cs_) req({ req: 'save', files: { cs: page.cs_ } }).then(r => {
            debug({ r })
        }).catch(e => this.error(e, o))
    }
    error = (e, o) => {
        debug({ e })
    }
    html = (o) => {
        const p = o && o.attr(), name = p && p.name
        if (!o) return html
    }
    ths = (o) => {
        const { name, param } = o.attr()
        const f = this.getForm(form)
        if (f.list === 'cs') return ['#', 'Brief', 'Start', 'first', 'last', 'AgeGrp', 'm/f', , 'E', 'L', 'B', 'D', 'mm:ss', 'club']
        else if (f.list === 'vs') return ['names', 'email']
        else if (name === 'users') return ['first', 'last', 'cat', 'm/f', 'club', 'email']
    }
    mergeNames = (rs) => {
        let first = '', last = ''
        rs.forEach(r => {
            const { first: f, last: l } = r.name ? firstLast(r.name) : r,
                firstL = first.toLowerCase(), fl = f && f.trim().toLowerCase()
            if (f && !firstL.includes(fl)) first += (first ? ', ' : '') + f.trim()
            if (l && !last) last = l.trim()
        })
        return { first, last }
    }
    trs = (o) => {
        const { name, param } = o.attr(), f = this.getForm(form),
            rs = this[f.list]
        this._table = o
        if (f.list === 'cs') return this._rows = this.comp2023()
        else if (f.list === 'vs') return this._rows = this.vol2023()
        else this._rows = []
        debug({ rs })
        if (rs) this._rows = Object.values(rs).map(r => {
            const { first, last } = this.mergeNames(r)
            return [first, last, cmap[r[0].cat] || '', mfmap[r[0].gender] || '', r[0].club || '', r[0].email]
        }).filter(r => this.filter(r, f)).sort((a, b) => a[1] > b[1] ? 1 : -1)
        return this._rows
    }
    filter = (r, fs) => {
        const { cat, mf, filter } = fs || {},
            f = filter && filter.toLowerCase(),
            t = [r[0].toLowerCase(), r[1].toLowerCase(), r[4].toLowerCase(), r[5].toLowerCase()],
            cs = cat === 'Adult' ? ['An', 'Ae'] : cat === 'Junior' ? ['TS', 'T1', 'T2', 'T3', 'Youth'] : [cat]
        if (cat && cat !== 'Cat' && !cs.includes(r[2])) return false
        if (mf && mf !== 'M/F' && r[3] !== mf) return false
        if (f && !t.join(',').includes(f)) return false
        return true
    }
    filterC = (c) => {
        const { cat, mf, filter } = this.getForm(form),
            f = filter && filter.toLowerCase(),
            r = [c.first.toLowerCase(), c.last.toLowerCase(), c.club.toLowerCase()],
            cs = cat === 'Adult' ? ['An', 'Ae'] : cat === 'Junior' ? ['TS', 'T1', 'T2', 'T3', 'Youth'] : [cat]
        if (cat && cat !== 'Cat' && !cs.includes(cmap[c.cat])) return false
        if (mf && mf !== 'M/F' && c.gender !== mf) return false
        if (f && !r.join(',').includes(f)) return false
        return true
    }
    filterV = (v) => {
        const { filter } = this.getForm(form),
            f = filter && filter.toLowerCase(),
            r = [(v && v.name && v.name.toLowerCase()) || '']
        if (f && !r.join(',').includes(f)) return false
        else return true
    }
    swim = (c, n) => {
        const sw = c.swim400 ? cleanse(c.swim400) : null,
            sa = sw || (sw === null && !n ? '' : '12:01')
        if (sa && n) {
            const [m, s] = sa.split(':')
            return m * 60 + s * 1
        }
        else return sa
    }
    sort = (a, b) => {
        if (['An', 'Ae'].includes(cmap[a.cat]) && (['An', 'Ae'].includes(cmap[b.cat]))) {
            const sa = this.swim(a, true), sb = this.swim(b, true)
            if (a.early || b.early) {
                if (!a.early) return 1
                else if (!b.early) return -1
                else return sa > sb ? 1 : -1
            }
            else if (a.late || b.late) {
                if (!a.late) return -1
                else if (!b.late) return 1
                else return sa > sb ? 1 : -1
            }
            else return sa > sb ? 1 : -1
        }
        else return cmap[a.cat] > cmap[b.cat] ? 1 : -1
    }
    number = (c, n, del) => {
        const cat = cmap[c.cat]
        if (this.cE) {
            if (c.eid === '2135156') c.eid = 2917348 // josh
            else if (c.eid === '2808624') {
                const fs = { first: 'Forename', last: 'Surname', gender: 'Gender', cat: 'EventName', eid: 'UniqueID', club: 'Club', email: 'email', phone: 'phone' }
                Object.keys(fs).forEach(k => c[k] = this.cE[c.eid][fs[k]])
            }
            else if (c.eid === '2899649') this.cE[c.eid].email
            if (!this.cE[c.eid] || c.email !== this.cE[c.eid].email) {
                del.push(c)
                return 0
            }
            else c.ageGroup = this.cE[c.eid].AgeGroup
        }
        if (cat == 'Ae' || cat == 'An') {
            return c.n = n['A']++
        }
        else return c.n = n[cat]++
    }
    start = (c, ln, i) => {
        const yts = {
            Youth: { brief: '8:55', start: '9:15' },
            TS: { brief: '11:10', start: '11:30' },
            T1: { brief: '11:20', start: '11:40' },
            T2: { brief: '11:40', start: '12:00' },
            T3: { brief: '12:10', start: '12:30' }
        }
        const cat = cmap[c.cat]
        if (cat == 'Ae' || cat == 'An') {
            const s = this.swim(c, true)
            let l, j = (i > 18) ? 5 : 6
            if (i < 6) l = 'r'
            else if (i < 12) l = 'l'
            else if (i < 18) l = 'm'
            else if (c.stroke) l = 'm'
            else if (s < 10 * 60) l = 'r'
            else if (s <= 12 * 60) l = 'l'
            else l = ln.m.n > ln.l.n ? 'l' : 'm'
            const k = ln[l].n++, t = ln[l].t
            if (ln[l].n % j === 0) {
                ln[l].t += (ln[l].t ? 10 : 5)
            }
            const h = 7 + Math.floor(t / 60), m = t % 60, mm = m < 10 ? '0' + m : m
            c.start = t > 105 ? '8:50' : `${h}:${mm}`
            c.brief = this.briefing(t)
        }
        else {
            c.start = yts[cat].start
            c.brief = yts[cat].brief
        }

    }
    fix = () => {
        delete page.cs_['202']
        const c = page.cs_['286']
        c.ageGroup = 'Tristars 3'
        c.cat = 'Tristar 3: 13-14 yrs'
        c.n = 162
        c.brief = '12:10'
        c.start = '12:30'
        c.swim400 = c.early = undefined
    }
    check = (c) => {
        if (!c.cat.startsWith('Adult') && !c.cat.includes(c.ageGroup.replace('Tristars', 'Tristar').replace('Tristar Start', 'Tristart'))) debug({ c, ageGroup: c.ageGroup, cat: c.cat })
    }
    comp2023 = () => {
        //let n = { A: 201, TS: 1, T1: 31, T2: 101, T3: 161, Youth: 21 }, ln = { l: { n: 0, t: 0 }, m: { n: 0, t: 0 }, r: { n: 0, t: 0 } }
        //let del = []
        //Object.values(page.cs_).sort((a, b) => this.swim(a, true) - this.swim(b, true)).forEach(c => this.number(c, n, del))
        //debug({ del })
        //del.forEach(c => delete page.cs_[c.id])
        //Object.values(page.cs_).sort(this.sort).forEach((c, i) => this.start(c, ln, i))
        //if (page.cs_['202']) this.fix()
        Object.values(page.cs_).forEach(c => this.check(c))
        const ret = Object.values(page.cs_).filter(this.filterC).sort(this.sort)
            .map(c => [c.n, c.brief, c.start, c.first, c.last, c.ageGroup, mfmap[c.gender], c.early ? 'Y' : '', c.late ? 'Y' : '', c.stroke ? 'Y' : '', c.deaf ? 'Y' : '', this.swim(c), c.club || ''])
        this.rows = ret.length
        return ret
    }
    vol2023 = () => {
        const es = {}
        Object.values(page.vs_).forEach(v => {
            const y = v.year, y23 = y && y[2023], vy = y23 && (y23.adult || y23.junior)
            if (vy && v.email) {
                if (this.filterV(v)) {
                    if (es[v.email.toLowerCase()]) es[v.email.toLowerCase()].push(v)
                    else es[v.email.toLowerCase()] = [v]
                }
            }
            else if (vy) debug({ v })
        })
        let ret = []
        Object.keys(es).forEach(e => {
            const vs = es[e], nm = []
            vs.forEach(v => {
                if (!v.name) debug({ v })
                else {
                    const first = v.name.split(' ')[0]
                    nm.push(first)
                }
            })
            ret.push([nm.join(', '), e])
        })
        return ret
    }
    briefing(s) {
        let b = 0
        const brief = ['6:40', '6:55', '7:10', '7:30', '7:50', '8:15']
        while (b < brief.length - 1) {
            const hm = brief[b + 1].split(':'), t = hm[0] * 60 + hm[1] * 1
            if (t + 15 > (s + 7 * 60)) break
            else b++;
        }
        return brief[b]
    }
    form = (o) => {
        const { name, param } = o.attr()
        if (form[name]) return form[name]
    }
    update = (e, o) => {
        const { name, param } = o.attr()
        const f = this.getForm(form)
        if (f.list === 'vs' && !page.vs_) {
            req({ req: 'files', files: ['vs_'] }).then(r => {
                page.vs_ = unzip(r.zips.vs_.data)
                this._table._upd()
            })
        }
        else this._table._upd()
    }

}

export default Admin