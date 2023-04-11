import { debug } from './Html'
//import 'whatwg-fetch'

function ajax(req) // token used when state not yet set
{
  //debug({ req })
  return new Promise((resolve, reject) => {
    let ok = true
    fetch('/ajax', params(req))
      .then(res => {
        ok = res.ok
        //debug({ req, res })
        return req.gz ? res.text() : res.json()
      })
      .then(json => {
        //debug({ req_req: req.req, json })
        if (!ok) {
          console.error('ajax', json)
          reject(json)
        }
        else resolve(json)
      })
      .catch(e => {
        console.error('ajax', req, e)
        reject({ error: e.message })
      })
  })
}

function params(data) {
  const ret = {
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'X-hatchend': '20230521'
    },
    method: 'post',
    cache: 'no-cache',
    body: JSON.stringify(data)
  }
  const token = window.localStorage.getItem('token')
  if (token) ret.headers.Token = token
  //console.log('params',data,ret.body)
  return ret
}

export { ajax }
