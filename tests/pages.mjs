import puppeteer from 'puppeteer'
const email = 'epdarnell+test@gmail.com', name = 'EdTest Test',
    anon = 'epdarnell+anon@gmail.com',
    reg = { first: 'EdReg', last: 'Test', email: 'epdarnell+reg@gmail.com' },
    vol = { first: 'EdVol', last: 'Test', email: 'epdarnell+vol@gmail.com' }

import { url, setPage, setDebug, scp, rm, waitForFile, uc1, tt, hover, token, unsub, logout, ajax, debug } from './utils.mjs'

let browser, page
beforeAll(async () => {
    //browser = await puppeteer.launch({ headless: false })
    browser = await puppeteer.launch({ headless: "new" })
    page = await browser.newPage()
    setPage(page)
    setDebug(false)
    await page.evaluateOnNewDocument(() => {
        // make anti-spam and background image predictable
        Math.random = () => 0.5
        window._test = true
    })
})

afterAll(async () => {
    await jest.restoreAllMocks()
    await browser.close()
})

describe('LoggedOut', () => {
    //beforeEach(async () => await page.goto('about:blank'))
    afterEach(async () => setDebug(false, true))
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
        await page.type('[id^="IN_email"]', email)
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

    test('LoginU', async () => {
        await rm('Login.email')
        await page.goto(url)
        await page.click('[id^="TT_user"]')
        await page.waitForSelector('#login_form')
        await page.type('[id^="IN_email"]', anon)
        await page.click('[id^="IN_spam2"]')
        await page.click('[id^="IN_login"]')
        await tt('user', 'Login link emailed.', 'success')
        const m = await waitForFile('Login.email')
        await scp('Login', m, '.email', 'U')
    })
})

describe('Subscribe', () => {
    beforeEach(async () => await logout())
    afterEach(async () => setDebug(false, true))

    test('Login', async () => {
        await ajax({ req: 'test', sub: email })
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
        await scp('Login', pg)
        await hover('IN_login', 'enter your email', 'disabled')
        await page.type('[id^="IN_email"]', email)
        await hover('IN_login', 'please tick the middle box', 'disabled')
        await page.click('[id^="IN_spam2"]')
        await hover('IN_login', 'login by email', 'primary')
        await page.click('[id^="IN_login"]')
        await tt('user', 'Login link emailed.', 'success')
        const m = await waitForFile('Login.email')
        await scp('Login', m, '.email')
    })

    test('Unsub', async () => {
        await ajax({ req: 'test', sub: email })
        rm('Unsubscribe.email')
        rm('Unsub.email')
        await page.goto(url + '/unsubscribe#' + await token(email))
        await page.waitForSelector('#unsub')
        await hover('IN_unsub', 'Confirm Unsubscribe', 'primary')
        await page.type('[id^="IN_reason"]', 'Pupeteer test')
        await page.click('[id^="IN_unsub"]')
        await tt('user', 'Unsubscribed.')
        const un = await waitForFile('Unsubscribe.email')
        await scp('Unsubscribe', un, '.email')
        const ua = await waitForFile('Unsub.email')
        await scp('Unsub', ua, '.email')
    })
    test('Sub', async () => {
        rm('Subscribe.email')
        rm('Sub.email')
        await ajax({ req: 'test', unsub: email })
        await page.goto(url + '#' + await token(email))
        await page.waitForSelector('[id^="TT_user"]')
        await hover('TT_user', name)
        await page.click('[id^="TT_user"]')
        await page.waitForSelector('#subscribe')
        await page.click('[id^="IN_sub"]')
        await tt('user', 'Subscribed.', 'success')
        const m = await waitForFile('Subscribe.email')
        await scp('Subscribe', m, '.email')
        const am = await waitForFile('Sub.email')
        await scp('Sub', am, '.email')
        await logout(true)
    })
    test('UsubU', async () => {
        await ajax({ req: 'test', sub: email })
        await page.goto(url + '#' + await token(email))
        await page.waitForSelector('[id^="TT_user"]')
        await hover('TT_user', name)
        await page.click('[id^="TT_user"]')
        await page.waitForSelector('[id^="popup_TT_user"]')
        await hover('TT_unsubscribe', 'unsubscribe')
        await page.click('[id^="TT_unsubscribe"]')
        await page.waitForSelector('#unsub')
        await hover('IN_unsub', 'Confirm Unsubscribe', 'primary')
        await page.type('[id^="IN_reason"]', 'Puppeteer User')
        await page.click('[id^="IN_unsub"]')
        await tt('user', 'Unsubscribed.')
    })
    test('SubU', async () => {
        rm('Subscribe.email')
        rm('Sub.email')
        await ajax({ req: 'test', unsub: email })
        await page.goto(url + '/subscribe#' + await token(email))
        await page.waitForSelector('#subscribe')
        await page.click('[id^="IN_sub"]')
        await tt('user', 'Subscribed.', 'success')
        const m = await waitForFile('Subscribe.email')
        await scp('Subscribe', m, '.email')
        const am = await waitForFile('Sub.email')
        await scp('Sub', am, '.email')
        await logout(true)
    })
    test('SubU2', async () => {
        await ajax({ req: 'test', sub: email })
        await page.goto(url + '/subscribe#' + await token(email))
        await tt('user', 'Subscribed.', 'success')
        await logout(true)
    })
})

describe('Register', () => {
    beforeEach(async () => await logout())
    afterEach(async () => setDebug(false, true))

    test('Register', async () => {
        rm('Registered.email')
        rm('Reg.email')
        await ajax({ req: 'test', rm: reg.email })
        await page.goto(url)
        await page.click('[id^="TT_user"]')
        await page.waitForSelector('#login_form')
        await hover('TT_register', 'register')
        await page.click('[id^="TT_register"]')
        await page.waitForSelector('#register_form')
        await page.type('[id^="IN_first"]', reg.first)
        await hover('IN_register', 'complete the form', 'disabled')
        await page.type('[id^="IN_last"]', reg.last)
        await hover('IN_register', 'complete the form', 'disabled')
        await page.type('[id^="IN_email"]', reg.email)
        await hover('IN_register', 'please tick the middle box', 'disabled')
        await page.click('[id^="IN_spam2"]')
        await hover('IN_register', 'register', 'primary')
        await page.click('[id^="IN_register"]')
        await tt('user', 'Registered - email sent.', 'success')
        const m = await waitForFile('Registered.email')
        await scp('Registered', m, '.email')
        const ma = await waitForFile('Reg.email')
        await scp('Reg', ma, '.email')
    })

    test('Reg Form', async () => {
        // depends on previous test to create user
        await page.goto(url + '/register')
        await page.waitForSelector('#register_form')
        const reg = await page.$eval('[id^="popup_TT_user"]', h => h.innerHTML)
        await scp('register', reg)
        await page.click('[id^="TT_login"]')
        await page.waitForSelector('#login_form')
        const l = await page.$eval('[id^="popup_TT_user"]', h => h.innerHTML)
        await scp('login', l)
    })

    test('Reg Login', async () => {
        // depends on previous test to create user
        rm('Login.email')
        await page.goto(url)
        await page.waitForSelector('[id^="TT_user"]')
        await page.click('[id^="TT_user"]')
        await page.waitForSelector('#login_form')
        await page.click('[id^="TT_register"]')
        await page.waitForSelector('#register_form')
        await page.type('[id^="IN_first"]', reg.first)
        await page.type('[id^="IN_last"]', reg.last)
        await page.type('[id^="IN_email"]', reg.email)
        await page.click('[id^="IN_spam2"]')
        await page.click('[id^="IN_register"]')
        const m = await waitForFile('Login.email')
        await scp('Login', m, '.email', 'R')
    })

    // TODO - could test switch user functionality
})

describe('Volunteer', () => {
    beforeEach(async () => await logout())
    afterEach(async () => setDebug(false, true))

    test.only('Volunteer', async () => {
        await ajax({ req: 'test', reg: vol })

    })
    /*
        test('ContactUn', async () => {
            rm('Contact.email')
            await ajax({ req: 'test', unsub: email })
            await page.goto(url + '#' + await token(email))
            await page.waitForSelector('[id^="TT_contact"]')
            await hover('TT_user', name)
            await hover('TT_contact', 'contact us')
            await page.click('[id^="TT_contact"]')
            await page.waitForSelector('[id^="popup_TT_contact"]')
            await hover('IN_send', 'complete the form', 'disabled')
            await page.type('[id^="IN_subject"]', 'Contact')
            await hover('IN_send', 'complete the form', 'disabled')
            await page.type('[id^="IN_message"]', 'Test User message')
            await hover('IN_send', 'send', 'primary')
            await page.click('[id^="IN_send"]')
            await tt('contact', 'Error Sending (unsubscribed).', 'error')
            await logout(true)
        })
            test('ContactU', async () => {
            rm('Contact.email')
            await ajax({ req: 'test', sub: email })
            await page.goto(url + '#' + await token(email))
            await page.waitForSelector('[id^="TT_contact"]')
            await hover('TT_user', name)
            await hover('TT_contact', 'contact us')
            await page.click('[id^="TT_contact"]')
            await page.waitForSelector('[id^="popup_TT_contact"]')
            await hover('IN_send', 'complete the form', 'disabled')
            await page.type('[id^="IN_subject"]', 'Contact')
            await hover('IN_send', 'complete the form', 'disabled')
            await page.type('[id^="IN_message"]', 'Test User message')
            await hover('IN_send', 'send', 'primary')
            await page.click('[id^="IN_send"]')
            await tt('contact', 'Message sent.', 'success')
            const m = await waitForFile('Contact.email')
            await scp('Contact', m, '.email', 'U')
            await logout(true)
        })
        */

})
