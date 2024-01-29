import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import path from 'path'
import jwt from 'jsonwebtoken'

const debug = console.log.bind(console)
const url = 'http:localhost:3000',
    dir = path.join(__dirname, 'html'),
    cssDir = path.join(__dirname, '..', 'src', 'css'),
    nodeDir = path.join(__dirname, '..', 'node', 'test'),
    confDir = path.join(__dirname, '..', 'node')
let config
async function conf() {
    if (!config) {
        const cf = await fs.readFile(path.join(confDir, 'config.json'), 'utf-8')
        config = JSON.parse(cf)
    }
}

describe('HTML Fragment Test', () => {
    let browser, page
    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: "new" })
        page = await browser.newPage()
        /*page.on('console', async m => {
            const a = await Promise.all(m.args().map(a => a.jsonValue()))
            const f = a.map(a => typeof a === 'object' ? JSON.stringify(a) : a)
            console.log(`Page log: ${f.join(' ')}`)
        })*/
        await page.evaluateOnNewDocument(() => {
            Math.random = () => 0.5
        }) // make background image predictable
    })
    afterAll(async () => {
        jest.restoreAllMocks()
        await browser.close()
    })

    function tok(s) {
        const r = s.replace(/href=\\"([^#]+)#([^\\]+)\\"/g, 'href=\\"$1#{token}\\"').replace(/\r\n/g, '\n')
        return r
    }
    async function scp(name, s, t) {
        const n = name + (t ? t : '.html'),
            c = (t ? '' : '<link rel="stylesheet" href="combined.css"></link>')
                + (t === '.email' ? tok(s) : s)
        try {
            const old = await fs.readFile(path.join(dir, n), 'utf-8')
            if (old !== c) await fs.writeFile(path.join(dir, '_' + n), c)
            expect(c).toBe(old) // This will fail the test
        } catch (e) {
            if (e.code === 'ENOENT') await fs.writeFile(path.join(dir, n), c)
            else throw e
        }
    }

    test('Home', async () => {
        const css = await fs.readFile(path.join(cssDir, 'combined.css'), 'utf-8')
        await scp('combined', css, '.css')
        await page.goto(url)
        const home = await page.$eval('#root', h => h.innerHTML)
        await scp('home', home)
    })

    function uc1(s) {
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    test('Pages', async () => {
        await page.goto(url)
        const nav = ['details', 'results', 'home']
        for (const link of nav) {
            await page.click(`a[href="${link}"]`)
            await page.waitForFunction(() => !document.querySelector('#loading'))
            await page.waitForFunction(v => document.querySelector('#nav_page').innerText === v, {}, uc1(link))
            const pg = await page.$eval('#root', h => h.innerHTML)
            await scp(link, pg)
        }
    })

    async function hover(id, t, c) {
        const sel = `[id^="${id}"]`, tt = `[id^="tip_${id}"]`
        await page.hover(sel)
        const txt = await page.$eval(tt, el => el.textContent)
        expect(txt).toBe(t)
        await page.mouse.move(0, 0)
        if (c) {
            const cl = await page.$eval(sel, (b, c) => b.classList.contains(c), c)
            expect(cl).toBe(true)
        }
    }

    test('Contact', async () => {
        rm(path.join(nodeDir, 'Contact.email'))
        await page.goto(url)
        await hover('TT_contact', 'contact us')
        await page.click('[id^="TT_contact"]')
        await page.waitForSelector('#contact_form')
        const pg = await page.$eval('[id^="popup_TT_contact"]', h => h.innerHTML)
        await scp('contact', pg)
        await hover('IN_send', 'complete the form', 'disabled')

        await page.type('[id^="IN_name"]', 'Puppeteer Pages')
        await page.type('[id^="IN_email"]', 'epdarnell+test@gmail.com')
        await page.type('[id^="IN_subject"]', 'Contact')
        await page.type('[id^="IN_message"]', 'Test message')
        await hover('IN_send', 'please tick the middle box', 'disabled')

        await page.click('[id^="IN_spam2"]')
        await hover('IN_send', 'send message', 'primary')
        await page.click('[id^="IN_send"]')
        await page.waitForSelector('[id^="tip_TT_contact"]')
        const txt = await page.$eval('[id^="tip_TT_contact"]', el => el.textContent)
        expect(txt).toBe('Message sent.')
        const email = await waitForFile(path.join(nodeDir, 'Contact.email'))
        await scp('Contact', email, '.email')
    })

    test('Login', async () => {
        rm(path.join(nodeDir, 'Login.email'))
        await page.goto(url)
        await hover('TT_user', 'login or register')
        await page.click('[id^="TT_user"]')
        await page.waitForSelector('#login_form')
        await hover('TT_close', 'close')
        await page.click('[id^="TT_close"]')
        await page.waitForFunction(() => !document.querySelector('#login_form'));
        await page.click('[id^="TT_user"]')
        await page.waitForSelector('#login_form')
        const pg = await page.$eval('[id^="popup_TT_user"]', h => h.innerHTML)
        await scp('login', pg)
        await hover('IN_send', 'enter your email', 'disabled')
        await page.type('[id^="IN_email"]', 'epdarnell+test@gmail.com')
        await hover('IN_send', 'please tick the middle box', 'disabled')
        await page.click('[id^="IN_spam2"]')
        await hover('IN_send', 'login by email', 'primary')
        await page.click('[id^="IN_send"]')
        await page.waitForSelector('[id^="tip_TT_user"]')
        const txt = await page.$eval('[id^="tip_TT_user"]', el => el.textContent)
        expect(txt).toBe('Login link emailed.')
        const email = await waitForFile(path.join(nodeDir, 'Login.email'))
        await scp('Login', email, '.email')
    })

    test('LoginU', async () => {
        rm(path.join(nodeDir, 'Login.email'))
        rm(path.join(nodeDir, 'LoginU.email'))
        await page.goto(url)
        await page.click('[id^="TT_user"]')
        await page.waitForSelector('#login_form')
        await page.type('[id^="IN_email"]', 'epdarnell+anon@gmail.com')
        await page.click('[id^="IN_spam2"]')
        await page.click('[id^="IN_send"]')
        await page.waitForSelector('[id^="tip_TT_user"]')
        const txt = await page.$eval('[id^="tip_TT_user"]', el => el.textContent)
        expect(txt).toBe('Login link emailed.')
        const email = await waitForFile(path.join(nodeDir, 'Login.email'))
        await fs.rename(path.join(nodeDir, 'Login.email'), path.join(nodeDir, 'LoginU.email'));
        await scp('LoginU', email, '.email')
    })

    test('Unsub', async () => {
        if (!config) await conf()
        const email = 'epdarnell+test@gmail.com',
            tok = jwt.sign({ email }, config.key)
        rm(path.join(nodeDir, 'Unsubscribe.email'))
        await page.goto(url + '/unsubscribe#' + tok)
        await page.waitForSelector('#unsub')
        await hover('IN_unsub', 'Confirm Unsubscribe', 'primary')
        await page.type('[id^="IN_reason"]', 'Pupeteer test')
        await page.click('[id^="IN_unsub"]')
        await page.waitForSelector('[id^="tip_TT_user"]')
        const txt = await page.$eval('[id^="tip_TT_user"]', el => el.textContent)
        expect(txt).toBe('Unsubscribed.')
        const unsub = await waitForFile(path.join(nodeDir, 'Unsubscribe.email'))
        await scp('Unsubscribe', unsub, '.email')
    })
})

async function rm(f) {
    try {
        await fs.unlink(f)
    } catch (e) {
        if (e.code !== 'ENOENT') throw e // Rethrow if it's an error other than "No such file or directory"
    }
}

function waitForFile(fn, i = 100, t = 1000) {
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