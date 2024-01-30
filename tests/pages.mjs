import puppeteer from 'puppeteer'
const url = 'http:localhost:3000'
import { setPage, setDebug, scp, rm, mv, waitForFile, uc1, tt, hover, token } from './utils.mjs'

let browser, page
beforeAll(async () => {
    //browser = await puppeteer.launch({ headless: false })
    browser = await puppeteer.launch({ headless: "new" })
    page = await browser.newPage()
    setPage(page)
    //setDebug(true)
    await page.evaluateOnNewDocument(() => {
        // make anti-spam and background image predictable
        Math.random = () => 0.5
    })
})

afterAll(async () => {
    jest.restoreAllMocks()
    await browser.close()
})

describe('LoggedOut', () => {
    // beforeEach(async () => {})
    // afterEach(async () => {})
    test('Home', async () => {
        const css = await waitForFile('combined.css')
        await scp('combined', css, '.css')
        await page.goto(url)
        const home = await page.$eval('#root', h => h.innerHTML)
        await scp('home', home)
    })
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

    test('Contact', async () => {
        rm('Contact.email')
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
        await hover('IN_send', 'send', 'primary')
        await page.click('[id^="IN_send"]')
        await tt('contact', 'Message sent.', 'success')
        const m = await waitForFile('Contact.email')
        await scp('Contact', m, '.email')
    })

    test('Login', async () => {
        rm('Login.email')
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
        await hover('IN_login', 'enter your email', 'disabled')
        await page.type('[id^="IN_email"]', 'epdarnell+test@gmail.com')
        await hover('IN_login', 'please tick the middle box', 'disabled')
        await page.click('[id^="IN_spam2"]')
        await hover('IN_login', 'login by email', 'primary')
        await page.click('[id^="IN_login"]')
        await tt('user', 'Login link emailed.', 'success')
        const m = await waitForFile('Login.email')
        await scp('Login', m, '.email')
    })

    test('LoginU', async () => {
        await rm('Login.email')
        rm('LoginU.email')
        await page.goto(url)
        await page.click('[id^="TT_user"]')
        await page.waitForSelector('#login_form')
        await page.type('[id^="IN_email"]', 'epdarnell+anon@gmail.com')
        await page.click('[id^="IN_spam2"]')
        await page.click('[id^="IN_login"]')
        await tt('user', 'Login link emailed.', 'success')
        const m = await waitForFile('Login.email')
        await mv('Login.email', 'LoginU.email')
        await scp('LoginU', m, '.email')
    })
})

describe('LoggedIn', () => {
    // beforeEach(async () => {})
    // afterEach(async () => {})
    test('Unsub', async () => {
        await page.goto('about:blank')
        const tok = await token('epdarnell+test@gmail.com')
        rm('Unsubscribe.email')
        await page.goto(url + '/unsubscribe#' + tok)
        await page.waitForSelector('#unsub')
        await hover('IN_unsub', 'Confirm Unsubscribe', 'primary')
        await page.type('[id^="IN_reason"]', 'Pupeteer test')
        await page.click('[id^="IN_unsub"]')
        await tt('user', 'Unsubscribed.')
        const unsub = await waitForFile('Unsubscribe.email')
        await scp('Unsubscribe', unsub, '.email')
        await page.goto('about:blank')
        await page.goto(url + '#' + tok)
        await page.waitForSelector('[id^="TT_user"]')
        await hover('TT_user', 'EdTest Test')
        await page.click('[id^="TT_user"]')
        // TODO - work out what calls close - also why contact hover causes close
        await page.click('[id^="TT_user"]')
        await page.waitForSelector('#subscribe')
        await page.click('[id^="IN_sub"]')
        await tt('user', 'Subscribed.', 'success')
    })
    test('ContactU', async () => {
        rm('ContactU.email')
        await page.goto('about:blank')
        const tok = await token('epdarnell+test@gmail.com')
        await page.goto(url + '#' + tok)
        await page.waitForSelector('[id^="TT_contact"]')
        await hover('TT_user', 'EdTest Test')
        await hover('TT_contact', 'contact us')
        await page.click('[id^="TT_contact"]')
        await page.waitForSelector('[id^="popup_TT_contact"]')
        await hover('IN_send', 'complete the form', 'disabled')
        await page.type('[id^="IN_subject"]', 'ContactU')
        await hover('IN_send', 'complete the form', 'disabled')
        await page.type('[id^="IN_message"]', 'Test User message')
        await hover('IN_send', 'send', 'primary')
        await page.click('[id^="IN_send"]')
        await tt('contact', 'Message sent.', 'success')
        const m = await waitForFile('ContactU.email')
        await scp('ContactU', m, '.email')
    })
    test('User', async () => {
        const tok = await token('epdarnell+test@gmail.com')
        await page.goto('about:blank')
        await page.goto(url + '#' + tok)
        await page.waitForSelector('[id^="TT_user"]')
        await hover('TT_user', 'EdTest Test')
        await page.click('[id^="TT_user"]')
        await page.click('[id^="TT_user"]')
        await page.waitForSelector('[id^="popup_TT_user"]')
    })
})
