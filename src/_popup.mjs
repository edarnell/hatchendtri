import {nav} from '../_Html/Html.mjs'
const _user=nav&&nav._user
import {_link} from './_link.mjs'
const _linkP= {
    x: {} // enable popup close
}
Object.assign(_link, _linkP)
const _popup = {
    friendlink: {
        tip: _user ? 'Share your journey and view friends' : 'Share your life journey with friends',
        class: 'black',
        popup: 'register'
    },
    uk: {
        tip: _user ? 'view friends' : 'register to connect',
        popup: 'register',
        class: _user ? 'green' : 'red'
    },
    tick: {
        img: 'tick',
        height: 32, width: 32,
        tip: 'register to connect',
        popup: 'register'
    },
    i: {
        popup: 'about',
        tip: 'Information about Friendlink',
        class: 'info'
    }
}
export { _popup }