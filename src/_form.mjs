import { register, login } from '../_Html/User.mjs'
import {_link} from './_link.mjs'
const _linkF= {
    _login: { text:'login', tip: 'login', click: 'login' },
    _register: { text:'register', tip: 'login', click: 'login' }
}
Object.assign(_link, _linkF)
const _form = {
    first: { placeholder: 'First name', type: 'text', required: 'first name' },
    last: { placeholder: 'Last name', type: 'text', required: 'last name' },
    email: { placeholder: 'email', type: 'email', required: 'valid email' },
    mobile: { placeholder: 'mobile', type: 'mobile', required: 'valid mobile' },
    dob: { placeholder: 'Birthday dd/mm/yy', type: 'text', required: 'valid DOB' },
    register_: { tip: 'spamtt', class: 'form primary', type: 'submit', click: register },
    spam: {
        spam1: { tip: 'spamtt' }, spam2: { tip: 'spamtt' }, spam3: { tip: 'spamtt' }
    }
}
export { _form}