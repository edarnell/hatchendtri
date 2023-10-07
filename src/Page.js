
import { Html, debug, error } from './Dom'
import { ajax } from './ajax'
import { unzip } from './unzip'
import Home from './Home'
import Details from './Details'
import Results from './Results'
import Volunteer from './Volunteer'
import Vol from './Vol'
import User from './User'
import Comp from './Comp'
import Admin from './Admin'
import Competitor from './Competitor'
import Contact from './Contact'
import Vselect from './Vselect'

class Page extends Html {
    constructor(nav) {
        super()
        this.nav = nav
        this.pages = {}
        this.data = {}
    }
    // Add code to run when the element is added to the DOM
    connectedCallback() {
        //debug({ page: nav.page })
        if (nav) this.load(nav._page)
    }
    create(pg) {
        switch (pg) {
            case 'home': return this.pages[pg] = new Home(this)
            case 'details': return this.pages[pg] = new Details(this)
            case 'results': return this.pages[pg] = new Results(this)
            case 'volunteer': this.pages[pg] = new Volunteer(this); break
            case 'vol': this.pages[pg] = new Vol(this); break
            case 'user': this.pages[pg] = new User(this); break
            case 'comp': this.pages[pg] = new Comp(this); break
            case 'admin': this.pages[pg] = new Admin(this); break
            case 'competitor': this.pages[pg] = new Competitor(this); break
            case 'contact': this.pages[pg] = new Contact(this); break
            case 'vselect': this.pages[pg] = new Vselect(this); break
            default: error({ create: { page: pg } })
        }
    }
    html = (div, param) => this.page.html(div, param)
    load = (pg) => {
        if (!this.page || pg !== this.page.id) {
            this.page = this.pages[pg] ?? this.create(pg)
            if (this.page.data) this.getData(this.page.data)
                .then(r => this.render(this.page.html(), 'page'))
            //.catch(e => error({ load: pg, e }))
            else this.render(this.page.html(), 'page')
            history.pushState(null, null, `/${pg}`);
        }
        else debug({ load: pg })
    }
    getData = (req) => {
        return new Promise((s, f) => {
            if (this.data[req]) s(this.data[req])
            else if (localStorage.getItem(req)) {
                const { date, data: d } = JSON.parse(localStorage.getItem(req))
                this.data[req] = unzip(d)
                this.data[req + '_date'] = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' })
                    .format(new Date(date)).replace(",", " at ")
                //debug({ req, date: this.data[req + '_date'], data: this.data[req] })
                ajax({ req: 'dates', files: [req] }).then(r => {
                    if (r.date[req] === date) {
                        debug({ storage: req, date: r.date[req] })
                        s(this.data[req])
                    }
                    else {
                        debug({ stale: req, odate: r.date[req], date })
                        localStorage.removeItem(req)
                        this.getData(req).then(r => s(r)).catch(e => f(e))
                    }
                }).catch(e => f(e))
            }
            else ajax({ req: 'files', files: [req] }).then(r => {
                if (r.zips && r.zips[req]) {
                    debug({ req, date: r.date })
                    if (req === '2023C') page[req] = r.zips[req]
                    else {
                        localStorage.setItem(req, JSON.stringify(r.zips[req]))
                        this.data[req] = unzip(r.zips[req].data)
                        debug({ date: r.zips[req].date })
                        this.data[req + '_date'] = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' })
                            .format(new Date(r.zips[req].date)).replace(",", " at ")
                    }
                    s(this.data[req])
                }
                else f(r)
            }).catch(e => f(e))
        })
    }
    setForm = (e, o) => {
        if (vs) Object.keys(vs).filter(k => !form || form[k]).forEach(k => {
            const fe = this.querySelector(`ed-form[name=${k}]`),
                l = fe && fe.querySelector('input, select, textarea')
            if (l) {
                if (l.type === 'checkbox' || l.type === 'radio') l.checked = vs[k]
                else l.value = vs[k]
            }
            else debug({ setForm: this.o(), k })
        })
        else debug({ setForm: this.o(), vs })
    }
    getForm = (form) => {
        let ret = {}
        if (form) Object.keys(form).forEach(name => {
            const fe = this.querySelector(`ed-form[name=${name}]`),
                l = fe && fe.querySelector('input, select, textarea')
            if (l) ret[name] = l.type === 'checkbox' || l.type === 'radio' ? l.checked : l.value
        })
        else debug({ getForm: form })
        return ret
    }
}
export default Page