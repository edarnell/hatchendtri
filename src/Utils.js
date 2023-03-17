import pako from 'pako'


let debugs = {}
function debug(func, arg) {
  if (typeof func === 'object' && func.name) func = func.name
  if (func === true) return debugs[arg] && debugs[arg].show
  else if (arg || (func === 'error' && arg === undefined)) return console.log.bind(console, func)
  if (debugs[func]) debugs[func].n++
  else {
    debugs[func] = { n: 1 }
    Object.keys(debugs).forEach(k => {
      if (k !== func && func.startsWith(k) && debugs[k].show) debugs[func].show = true
    })
  }
  if (debugs[func].show) {
    return console.log.bind(console, func)//console.log.bind(window.console)
  }
  else return function () { }
}

function copy(x) {
  return x === Object(x) ? JSON.parse(JSON.stringify(x)) : x
}

function zip(json) {
  let ret = btoa(pako.deflate(JSON.stringify(json), { to: 'string' }))
  debug('zip')({ json, unzip: JSON.stringify(json).length, zip: ret.length })
  return ret
}

function unzip(data) {
  debug('unzip')({ unzip: data })
  const json = data ? JSON.parse(pako.inflate(atob(data), { to: 'string' })) : null
  //debug('unzip')({ json, zip: JSON.stringify(json).length, unzip: data.length })
  return json
}

const het = {}

export { copy, debug, zip, unzip, het }
