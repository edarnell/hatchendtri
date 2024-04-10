import { error, debug, page } from './Html'
import { nav } from './Nav'

function ajax(req) // token used when state not yet set
{
  return new Promise((s, f) => {
    let ok
    fetch('/ajax', params(req)).then(res => {
      ok = res.ok
      return res.json()
    }).then(r => {
      if (ok) s(r)
      else if (r.reload) {
        const v_ts = nav.cI.ts,
          now = new Date()
        if (!v_ts || now.getTime() - new Date(v_ts).getTime() > 60000) location.reload(true)
        else f(r)
      }
      else f(r)
    }).catch(e => f(e))
  })
}
function params(data) {
  const ret = {
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'cI': JSON.stringify(nav.cI)
    },
    method: 'post',
    cache: 'no-cache',
    body: JSON.stringify(data)
  }
  return ret
}

export { ajax }
