const debug = console.log.bind(console)
const error = console.error.bind(console)
import Volunteer from './Volunteer'
// import Vol from './Vol'
import Competitor from './Competitor'
//import Comp from './Comp'
//import Vselect from './Vselect'import Home from './Home'
import Details from './Details'
import Results from './Results'
import Contact from './Contact'
import User, { Switch } from './User'
import Home from './Home'
import CSV from './CSV'
import Photos, { PhotosP } from './Photos'
import Vselect from './Vselect'
import Vol from './Vol'

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