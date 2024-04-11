import AdminResults from './AdminResults.mjs'
import AdminEmail from './AdminEmail.mjs'

function apage(name) {
    switch (name) {
        case 'email': return new AdminEmail()
        default: return null
    }
}

export { apage }