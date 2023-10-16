const debug = console.log.bind(console)
const error = console.error.bind(console)
import Volunteer from './Volunteer'
// import Vol from './Vol'
import Admin from './Admin'
import Competitor from './Competitor'
//import Comp from './Comp'
//import Vselect from './Vselect'import Home from './Home'
import Details from './Details'
import Results from './Results'
import Contact from './Contact'
import User from './User'
import Home from './Home'
const cs = {
    Home,
    Volunteer,
    Competitor,
    Details,
    Results,
    Contact,
    User,
    Admin
}
class H {
    O = (n, ...args) => {
        const C = cs[n]
        if (!C) error({ O: { n, args } })
        return C ? new C(...args) : null
    }
}

export default H