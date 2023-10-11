
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
        if (pg !== this.id) {
            this.page = this.pages[pg] ?? this.create(pg)
            this.id = this.page.id
            if (this.page.data) this.getData(this.page.data)
                .then(r => this.render(this.page.html(), 'page'))
            //.catch(e => error({ load: pg, e }))
            else this.render(this.page.html(), 'page')
            history.pushState(null, null, `/${pg}`);
        }
        else debug({ load: pg })
    }
}
export default Page