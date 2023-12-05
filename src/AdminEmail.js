import Html, { debug, nav } from './Html.js'
class AdminEmail extends Html {
    constructor(p, name) {
        super(p, name)
        this.data = ['emails']
    }
    loaded = (r) => {
        if (r.some(f => f === true)) this.reload("emails")
    }
    html = () => {
        return '<div id="emails">{table.emails}</div>'
    }
    ths = (n) => {
        if (n === 'emails') return ['first', 'firsts', 'lasts', 'email', 'unsub', 'bounce', 'files']
        else return ''
    }
    link = (n, p) => {
        if (n.charAt(0) === 'f') {
            const i = n.substring(3), d = nav.d.data, emails = d && d.emails, ks = emails && Object.keys(emails),
                k = ks[i], e = emails && emails[k],
                color = { f0: 'amber', fE: 'red', fn: 'green', fe: 'blue' }
            return { tip: JSON.stringify(e), class: color[n.substring(0, 2)] }
        }
    }
    trs = (n) => {
        const d = nav.d.data, emails = d.emails
        let ret = []
        if (n === 'emails' && emails) {
            ret = Object.keys(emails).map((email, i) => {
                let fn = '', efn = '', ef0 = '?'
                const e = emails[email], fi = {}, fs = [], ls = [], efs = []
                Object.keys(e).filter(f => f !== 'unsub' && f !== 'bounce').forEach(f => {
                    const emf = (e[f].eName || '').split(' ')
                    if (emf && ef0 === '?') ef0 = emf
                    if (!e[f].first) debug({ email, e, f })
                    else if (!fn && email.indexOf(e[f].first.toLowerCase()) !== -1) fn = e[f].first
                    else if (!fn && emf && email.indexOf(emf.toLowerCase()) !== -1) efn = emf
                    fs.push(e[f].first)
                    ls.push(e[f].last)
                    if (e[f].file) e[f].file.forEach(n => fi[n] = n)
                    else debug({ email, e, f })
                })
                const first = fn ? `{link.fn_${i}.${fn}}`
                    : efn ? `{link.fe_${i}.${efn}}`
                        : fs.length === 1 ? `{link.f0_${i}.${fs[0]}}` : `{link.fE_${i}.${ef0}}`
                return [first, fs.join(', '), ls.join(', '), email, e.unsub || '', e.bounce || '', Object.keys(fi).join(', ')]
            })
        }
        debug({ emails, ret })
        return ret.sort((a, b) => a[1].toLowerCase().localeCompare(b[1].toLowerCase()))
    }

}

export default AdminEmail