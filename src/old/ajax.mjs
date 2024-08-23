import { debug } from './Html.mjs'
import { nav } from './Nav.mjs'
import { ajx } from './ajx.mjs'

function ajax(req) {
  return ajx(req, nav.cI)
}

export { ajax }
