const debug = console.log.bind(console)
const error = console.error.bind(console)
import Volunteer from './Volunteer.mjs'
// import Vol from './Vol.mjs'
import Competitor from './Competitor.mjs'
//import Comp from './Comp'
//import Vselect from './Vselect.mjs'import Home from './Home.mjs'
import Details from './Details.mjs'
import Results from './Results.mjs'
import Contact from './Contact.mjs'
import User, { Switch } from './User.mjs'
import Home from './Home.mjs'
import CSV from './CSV.mjs'
import Photos, { PhotosP } from './Photos.mjs'
import Vselect from './Vselect.mjs'
import Vol from './Vol.mjs'

const cs = {
    Home,
    Volunteer,
    Competitor,
    Details,
    Results,
    Contact,
    User,
    Switch,
    CSV,
    Photos,
    PhotosP,
    Vselect,
    Vol
}
class H {
    O = (n, ...args) => {
        let m = n.match(/^\{([\w_]+)(?:\.([^\s}.]+))?(?:\.([^\s}]+))?\}$/)
        if (m) return this.O(m[1], ...args, m[2], m[3])
        else {
            const C = cs[n]
            if (!C) error({ O: { n, args } })
            return C ? new C(...args) : null
        }
    }
    OP = (n, ...args) => {
        m = n.match(/\{(.*)\}/)
    }
}

export default H