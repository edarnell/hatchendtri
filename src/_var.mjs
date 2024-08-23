import {nav} from '../_Html/Html.mjs'
import {_img} from './_img.mjs'
var pg=nav?nav.pg:'Home'
var sbr = `<div id="background" class="background-image" style="background-image: url('${_img.bike}');'"></div>`

const _var = {
        pg,
        sbr
    }
export { _var }