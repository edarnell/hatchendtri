import pako from 'pako'
const debug = console.log.bind(console)

function unzip(file) {
    return new Promise((s, f) => {
        fetch(file)
            .then(r => {
                return r.text() // has had btoa to make into string - not encourgaed!!
            })
            .then(data => {
                s(JSON.parse(pako.inflate(atob(data), { to: 'string' })))
            })
            .catch(e => f(e))
    })
}
export { unzip, debug }