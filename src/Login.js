import Html, { debug } from './Html'
import login from './html/login.html'
import { req } from './data'

const form = {
    name: { placeholder: 'name', width: '50rem' },
    Login: { class: 'form', tip: 'request login token', submit: true },
}

const link = {
    ed: { tip: 'ed testing', click: true },
}

class Login extends Html {
    constructor() {
        super()
    }
    //debug = (m) => debug({ Login: this.o(), m })
    html = (o) => {
        if (!o) return login
        const p = o.attr(), name = p && p.name
        if (name === 'names') return '{link.ed.Ed_Darnell}'
    }
    form = (o) => {
        const { name } = o.attr()
        return form[name]
    }
    login = () => {
        req({ req: 'login', uid: 1 })
        debug({ Login: 'login' })
    }
    link = (o) => {
        const { name } = o.attr()
        if (name === 'ed') return { tip: 'ed testing', click: this.login }
    }
}
export default Login