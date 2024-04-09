import { error, debug, page } from './Html'
const v_client = 'v2024.04.09a'

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
        const v_ts = localStorage.getItem('HEv_ts'),
          now = new Date()
        if (!v_ts || now.getTime() - new Date(v_ts).getTime() > 60000) {
          localStorage.setItem('HEv_ts', now.toISOString())
          location.reload(true)
        }
        else {
          error({ reloaded: v_ts })
          f(r)
        }
      }
      else f(r)
    }).catch(e => f(e))
  })
}
function params(data) {
  const v = localStorage.getItem('HEv_client')
  if (v !== v_client) {
    const now = new Date()
    localStorage.setItem('HEv_client', v_client)
    localStorage.setItem('HEv_ts', now.toISOString())
  }
  const ret = {
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'v_client': v_client,
      'v_ts': localStorage.getItem('HEv_ts')
    },
    method: 'post',
    cache: 'no-cache',
    body: JSON.stringify(data)
  }
  const token = localStorage.getItem('HEtoken')
  if (token) ret.headers.Authorization = 'Bearer ' + token
  return ret
}

export { ajax }
