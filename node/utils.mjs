import crypto from 'crypto'
import log4js from "log4js"
import { zip, unzip, f } from './zip.mjs'

const config = JSON.parse(f('config.json', true))
const { admin, url, port, host, admin_to, aws } = config
log4js.configure(config.log4js)
const log = log4js.getLogger()
log.info("Started")
log.info("Loaded data")

function update_ps(u, s, t) {
    Object.keys(s).forEach(p => {
        if (ps[t][p]) ps[t][p].push({ email: u.email, ts: Math.round(Date.now() / 1000) })
        else ps[t][p] = [{ email: u.email, ts: Math.round(Date.now() / 1000) }]
    })
    fs.writeFileSync('ps.gz', zip(ps))
}

function CSV(ent) {
    const rows = ent.split('\n')
    const ret = {}
    const head = rows[0].split(',').map(s => s.replace(/[\n\r]/g, '')), c = {}
    head.forEach(k => c[k] = head.indexOf(k))
    for (var i = 1; i < rows.length; i++) {
        if (!rows[i]) continue
        const row = rows[i].split(',').map(s => s.replace(/[\n\r]/g, '')), r = {}
        Object.keys(c).forEach(k => r[k] = row[c[k]])
        if (!r.email) log.debug('line error', r, rows[i])
        else if (r.Number * 1 >= 200) { // filter out adults
            if (!ret[r.email]) ret[r.email] = []
            ret[r.email].push(r)
        }
    }
    return ret
}

// can use openssl rand -base64 32 but then truncate to 32 bytes
function encrypt(json) {
    return new Promise((s, f) => {
        crypto.randomFill(new Uint8Array(16), (err, iv) => {
            if (err) f(err)
            const cipher = crypto.createCipheriv('AES-256-CBC', config.key, iv)
            let encrypted = cipher.update(JSON.stringify(json), 'utf8', 'base64');
            encrypted += cipher.final('base64')
            const iv64 = Buffer.from(iv).toString('base64'),
                r = iv64 + '_' + encrypted
            s(r)
        })
    })
}

function decrypt(m) {
    const p = m && m.split('_'),
        biv = p && Buffer.from(p[0], 'base64'),
        d = p && Buffer.from(p[1], 'base64'),
        dc = biv && crypto.createDecipheriv('AES-256-CBC', config.key, biv)
    if (dc && d) {
        let r = dc && d && dc.update(d, 'utf8', 'utf8')
        r += dc.final('utf8')
        return JSON.parse(r)
    }
    else return null
}

function get_user(token) {
    const d = decrypt(token)
    let r = null
    if (d) {
        const c = cs[d.email], ci = c ? c[0] : admin[d.email] ? { email: d.email, Forename: admin[d.email] } : null
        r = ci ? ci : null
    }
    //log.debug("user", r)
    return r
}

function get_photos(email, num) {
    const r = []
    if (admin[email]) {
        const ns = np[num]
        if (ns) ns.forEach(p => {
            if (!ps.delete[p.replace(', ', '%2C%20')]) r.push(photos[p])
        })
    }
    else if (email) {
        const comp = cs[email]
        if (comp) {
            comp.forEach(c => {
                const ns = np[c.Number]
                if (ns) ns.forEach(p => {
                    if (!ps.delete[p.replace(', ', '%2C%20')]) r.push(photos[p])
                })
            })
        }
    }
    return r
}

export { encrypt, get_photos, get_user, log, update_ps, admin, url, port, host, admin_to, aws }