import { debug, page } from './Html'

function ajax(req) // token used when state not yet set
{
  return new Promise((s, f) => {
    fetch('/ajax', params(req))
      .then(res => {
        if (!res.ok) f({ res })
        else return req.gz ? res.text() : res.json()
      }).then(r => s(r))
      .catch(e => f(e))
  })
}

function params(data) {
  const ret = {
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'a_hatchend': '20230521'
    },
    method: 'post',
    cache: 'no-cache',
    body: JSON.stringify(data)
  }
  const token = localStorage.getItem('token')
  if (token) ret.headers.Authorization = 'Bearer ' + token
  return ret
}

export { ajax }
