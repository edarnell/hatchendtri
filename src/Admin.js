import AdminResults from './AdminResults'
import AdminEmail from './AdminEmail'

function apage(name) {
    switch (name) {
        case 'email': return new AdminEmail()
        default: return null
    }
}

export { apage }