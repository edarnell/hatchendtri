import Html, { debug, page, _s } from './Html'
import { zip } from './unzip'
import { req } from './data'
import html from './html/Admin.html'

const form = { // section and options populated on load
    filter: { placeholder: 'name filter', width: '50rem' },
    C: { class: 'hidden form red bold', tip: 'clear name', submit: true },
    Save: { class: 'form red', tip: 'save ids' },
}

class Admin extends Html {
    constructor() {
        super()
        this.data = 'volunteers'
        form.Save.click = this.save
    }
    listen = () => {
        debug({ v: page.volunteers, v2023: page.v2023 })
        let vs = { ...page.volunteers }
        Object.keys(vs).forEach(id => {
            const v = vs[id], e = v.email && page.emails[v.email], v2 = page.v2023[id]
            v.year = {}
            if (v.adult) delete v.adult
            if (v.junior) delete v.junior
            if (v.key) delete v.key
            if (e) {
                ['2022', '2019', '2018', '2017'].forEach(y => {
                    const f = y + 'V', d = e[f], rs = d && (d.length ? d : [d]),
                        compete = e[y + 'C']
                    if (rs) rs.forEach(r => {
                        if (r.name.trim().toLowerCase() === v.name.trim().toLowerCase()) {
                            if ((!r.adult || r.adult.toLowerCase() === 'none') && compete) r.adult = 'competitor'
                            v.year[y] = { adult: r.adult, junior: r.junior }
                        }
                    })
                })
                if (e['MCu']) v.unsub = true
                if (e['MCc']) v.bounce = true
            }
            if (v2) {
                v.year[2023] = {}
                const vo = v.year[2023]
                if (v2.year === false) vo = { n: true }
                else {
                    if (v2.a2023) vo.adult = true
                    if (v2.j2023) vo.junior = true
                        ;['asection', 'arole', 'jsection', 'jrole'].forEach(k => {
                            if (v2[k]) vo[k] = v2[k]
                        })
                }
            }
        })
        debug({ vs })
        req({ req: 'save', files: { volunteers: vs } }).then(r => debug({ r }))
    }
    html = (o) => {
        const p = o && o.attr(), name = p && p.name
        if (!o) return html
    }
    link = (o) => {
        const { name, param } = o.attr(), id = name.substring(1)
        if (param) {
            debug({ param, f: this.fs[id] })
        }
        return { tip: page.ids[id] }
    }
    ths = (o) => {
        const { name, param } = o.attr()
        if (name === 'users') return ['name', 'id', 'file']
    }
    row = (r, names, id, f, i) => {
        const nm = r.first ? r.first + ' ' + r.last : r.name,
            name = nm.trim().toLowerCase()
        if (!names[name]) names[name] = {}
        if (!names[name][id]) names[name][id] = { name: nm.trim(), f: [] }
        names[name][id].f.push({ f, i })
    }
    trs = (o) => {
        const { name, param } = o.attr(), names = {}, fids = []
    }
    save = (e, o) => {
        //req({ req: 'save', files: { emails: this.emails } }).then(r => debug({ r }))
    }
    form = (o) => {
        const { name, param } = o.attr()
        if (form[name]) return form[name]
    }
    filter = (id) => {
    }
    update = (e, o) => {
        const { name, param } = o.attr()
        debug({ 'update': this.rows, o: o.attr(), e })
    }

}

export default Admin