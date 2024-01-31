import fs from 'fs/promises'
import path from 'path'
import jwt from 'jsonwebtoken'

const debug = console.log.bind(console),
    url = 'http:localhost:3000',
    dir = path.join(__dirname, 'html'),
    cssDir = path.join(__dirname, '..', 'src', 'css'),
    nodeDir = path.join(__dirname, '..', 'node', 'test'),
    confDir = path.join(__dirname, '..', 'node')

let page, dbg = false, _e = false
function setDebug(s) {
    expect(_e).toBe(false)
    dbg = s, _e = false
}
function setPage(p) {
    page = p
    page.on('console', async m => {
        const a = await Promise.all(m.args().map(a => rC(a).catch(() => '?')))
        const f = a.map(a => typeof a === 'object' ? JSON.stringify(a) : a).filter(x => x)
        const t = m.type() === 'error' && f.length ? _e = 'Error' : dbg && 'Debug'
        if (t) console.log(`${t}: ${f.join(' ')}`)
    })
}

async function rC(a) { // remove circular references
    const r = await a.evaluate(o => {
        const s = new WeakSet()
        return JSON.stringify(o, (k, v) => {
            if (typeof v === 'object' && v !== null) {
                if (s.has(v)) {
                    return
                }
                s.add(v)
            }
            return v
        })
    })
    return r
}

async function conf() {
    if (!config) {
        const cf = await fs.readFile(path.join(confDir, 'config.json'), 'utf-8')
        config = JSON.parse(cf)
    }
}

let config
async function token(email) {
    if (!config) await conf()
    const tok = jwt.sign({ email }, config.key)
    return tok
}

async function unsub(email, uns) {
    const d = dbg
    let c = false
    dbg = false
    await page.goto(url + '#' + await token(email))
    await page.waitForSelector('[id^="TT_user"]')
    await hover('TT_user', 'EdTest Test')
    await page.click('[id^="TT_user"]')
    await page.waitForSelector('[id^="popup_TT_user"]')
    const un = await page.$('#subscribe')
    if (un && !uns) {
        await page.click('[id^="IN_sub"]')
        await tt('user', 'Subscribed.', 'success')
        await page.click('[id^="TT_user"]')
        await page.waitForSelector('[id^="popup_TT_user"]')
        await page.click('[id^="TT_logout"]')
        c = true
    }
    else if (!un && uns) {
        await page.click('[id^="TT_unsubscribe"]')
        await page.waitForSelector('#unsub')
        await page.type('[id^="IN_reason"]', 'Puppeteer unsub()')
        await page.click('[id^="IN_unsub"]')
        await tt('user', 'Unsubscribed.')
        c = true
    }
    else {
        await page.click('[id^="TT_logout"]')
    }
    await page.goto('about:blank')
    if (c) debug({ unsub: `${uns}=>${!uns}` })
    dbg = d
}


function tok(s) {
    const r = s.replace(/href=\\"([^#]+)#([^\\]+)\\"/g, 'href=\\"$1#{token}\\"').replace(/\r\n/g, '\n')
    return r
}

async function scp(name, s, t, n2) {
    if (n2) {
        rm(name + n2 + '.email')
        mv(name + '.email', name + n2 + '.email')
        name = name + n2
    }
    const n = name + (t ? t : '.html'),
        c = (t ? '' : '<link rel="stylesheet" href="combined.css"></link>')
            + (t === '.email' ? tok(s) : s)
    try {
        const old = await fs.readFile(path.join(dir, n), 'utf-8')
        if (old !== c) await fs.writeFile(path.join(dir, '_' + n), c)
        if (dbg) debug('line ' + lnum(), old === c, { scp: name })
        expect(c).toBe(old) // This will fail the test
    } catch (e) {
        if (e.code === 'ENOENT') await fs.writeFile(path.join(dir, n), c)
        else throw e
    }
}

function uc1(s) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

async function hover(id, t, c) {
    const sel = `[id^="${id}"]`, tt = `[id^="tip_${id}"]`
    await page.hover(sel)
    const txt = await page.$eval(tt, el => el.textContent)
    await page.mouse.move(0, 0)
    const cl = c ? await page.$eval(sel, (b, c) => b.classList.contains(c) ? c : false, c) : ''
    if (dbg) debug('line ' + lnum(), { hover: { txt, cl } })
    expect(txt).toBe(t)
    if (c) expect(cl).toBe(c)
}
async function tt(id, t, c) {
    const tt = `[id^="tip_TT_${id}"]`
    await page.waitForSelector(tt)
    const r = await page.$eval(tt, (el, c) => {
        const txt = el.textContent
        let cl = false
        if (c) {
            const d = el.firstElementChild
            cl = d ? d.classList.contains(c) ? c : 'one' : 'two'
        }
        return { txt, cl }
    }, c)
    if (dbg) debug('line ' + lnum(), { tt: r })
    expect(r.txt).toBe(t)
    if (c) expect(r.cl).toBe(c)
}

async function rm(fn) {
    if (!fn.endsWith('.email')) fn = path.join(nodeDir, fn)
    try {
        await fs.unlink(fn)
    } catch (e) {
        if (e.code !== 'ENOENT') throw e // Rethrow if it's an error other than "No such file or directory"
    }
}

async function mv(fn, f2) {
    if (!fn.endsWith('.email')) fn = path.join(nodeDir, fn)
    if (!f2.endsWith('.email')) f2 = path.join(nodeDir, f2)
    try {
        await fs.rename(fn, f2)
    } catch (e) {
        if (e.code !== 'ENOENT') throw e // Rethrow if it's an error other than "No such file or directory"
    }
}

function lnum() {
    const e = new Error()
    const l = e.stack.split('\n').pop()  // Get the last line
    const m = l.match(/pages\.mjs:(\d+)/)
    return m ? m[1] : '?'
}

function waitForFile(fn, i = 100, t = 1000) {
    if (fn.endsWith('.css')) fn = path.join(cssDir, fn)
    else if (fn.endsWith('.email')) fn = path.join(nodeDir, fn)
    return new Promise((s, f) => {
        let to
        const ti = setInterval(() => {
            fs.access(fn).then(() => {
                clearTimeout(to)
                clearInterval(ti)
                fs.readFile(fn, 'utf-8').then(r => {
                    s(r)
                }).catch(e => f(e))
            }
            ).catch(e => debug(`waiting: ${fn}`))
        }, i)
        to = setTimeout(() => {
            clearInterval(ti)
            f(new Error(`File timeout: ${f} ${t}ms`));
        }, t)
    })
}

export { setPage, setDebug, debug, token, scp, uc1, hover, tt, rm, mv, waitForFile, unsub, url }