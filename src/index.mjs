import Html, { nav } from '../_Html/Html.mjs'
import { _user } from '../_Html/User.mjs'
import css from '../html/_html.css'
import { _html } from './_html.mjs'
import { _link } from './_link.mjs'
import { _img } from './_img.mjs'
import { _form } from './_form.mjs'
import { _popup } from './_popup.mjs'
import { _var } from './_var.mjs'
new Html(null, 'nav', { css, _html, _link, _img, _form, _user, _popup, _var })
nav.page('home')