import puppeteer from 'puppeteer'
import {
    url, setPage, setDebug, scp, rm, waitForFile, waitSel, sleep,
    uc1, tt, hover, token, unsub, logout, login, ajax, debug, name
} from './utils.mjs'

const user = { first: 'User', last: 'Test', email: 'epdarnell+user@gmail.com' },
    anon = 'epdarnell+anon@gmail.com'

let browser, page
beforeAll(async () => {
    //browser = await puppeteer.launch({ headless: false })
    browser = await puppeteer.launch({ headless: "new" })
    page = await browser.newPage()
    setPage(page)
    setDebug(false)
    await ajax({ req: 'test', debug: { email: true } })
    await ajax({ req: 'test', rm: 'epdarnell+' })
    await ajax({ req: 'test', reg: user })
    await page.evaluateOnNewDocument(() => {
        // make anti-spam and background image predictable
        Math.random = () => 0.5
        window._test = true
    })
})
afterAll(async () => {
    await ajax({ req: 'test', rm: 'epdarnell+' })
    await ajax({ req: 'test', debug: {} })
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
        await page.type('[id^="IN_email"]', user.email)
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
        await ajax({ req: 'test', sub: user.email })
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
        await page.type('[id^="IN_email"]', user.email)
        await hover('IN_login', 'please tick the middle box', 'disabled')
        await page.click('[id^="IN_spam2"]')
        await hover('IN_login', 'login by email', 'primary')
        await page.click('[id^="IN_login"]')
        await tt('user', 'Login link emailed.', 'success')
        const m = await waitForFile('Login.email')
        await scp('Login', m, '.email')
    })
    test('Unsub', async () => {
        await ajax({ req: 'test', sub: user.email })
        rm('Unsubscribe.email')
        rm('Unsub.email')
        await page.goto(url + '/unsubscribe#' + await token(user.email))
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
        await ajax({ req: 'test', unsub: user.email })
        await page.goto(url + '#' + await token(user.email))
        await page.waitForSelector('[id^="TT_user"]')
        await hover('TT_user', name(user, ' '))
        await page.click('[id^="TT_user"]')
        await page.waitForSelector('#subscribe')
        await page.click('[id^="IN_sub"]')
        await tt('user', 'Subscribed.', 'success')
        const m = await waitForFile('Subscribe.email')
        await scp('Subscribe', m, '.email')
        const am = await waitForFile('Sub.email')
        await scp('Sub', am, '.email')
        expect(await logout()).toBe('logout')
    })
    test('UsubU', async () => {
        await ajax({ req: 'test', sub: user.email })
        await page.goto(url + '#' + await token(user.email))
        await page.waitForSelector('[id^="TT_user"]')
        await hover('TT_user', name(user, ' '))
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
        await ajax({ req: 'test', unsub: user.email })
        await page.goto(url + '/subscribe#' + await token(user.email))
        await page.waitForSelector('#subscribe')
        await page.click('[id^="IN_sub"]')
        await tt('user', 'Subscribed.', 'success')
        const m = await waitForFile('Subscribe.email')
        await scp('Subscribe', m, '.email')
        const am = await waitForFile('Sub.email')
        await scp('Sub', am, '.email')
        expect(await logout()).toBe('logout')
    })
    test('SubU2', async () => {
        await ajax({ req: 'test', sub: user.email })
        await page.goto(url + '/subscribe#' + await token(user.email))
        await tt('user', 'Subscribed.', 'success')
        expect(await logout()).toBe('logout')
    })
})

describe('Register', () => {
    const reg = { first: 'Reg', last: 'Test', email: 'epdarnell+reg@gmail.com' }
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
        // add tests for logged in user and switch user
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
    const vol = { first: 'Vol', last: 'Test', email: 'epdarnell+vol@gmail.com', vol: 'rm' },
        lead = { first: 'Lead', last: 'Test', email: 'epdarnell+lead@gmail.com', vol: 'lead', admin: true },
        coord = { first: 'Coord', last: 'Test', email: 'epdarnell+coord@gmail.com', vol: 'coord' },
        va = { first: 'Va', last: 'Test', email: 'epdarnell+va@gmail.com', vol: 'a' },
        vaj = { first: 'Vaj', last: 'Test', email: 'epdarnell+vaj@gmail.com', vol: 'aj' },
        vn = { first: 'Vn', last: 'Test', email: 'epdarnell+vn@gmail.com', vol: 'n' }

    beforeEach(async () => await logout())
    afterEach(async () => setDebug(false, true))

    test('Volunteer', async () => {
        //setDebug(true)
        await ajax({ req: 'test', reg: vol })
        await page.goto(url + '/volunteer#' + await token(vol.email))
        expect(await waitSel('[id^="TT_u_greet"]', name(vol), 'grey')).toBeTruthy()
        expect(await waitSel('[id^="greet"]', 'please confirm availability')).toBeTruthy()
        expect(await waitSel(('[id^="popup_TT_u_greet"]'), l => l)).toBeTruthy()
        expect(await page.$eval('[id^="IN_adult"]', l => l.checked)).toBe(false)
        await hover('IN_adult', 'available for adult race')
        expect(await page.$eval('[id^="IN_junior"]', l => l.checked)).toBe(false)
        await hover('IN_junior', 'available for junior race')
        expect(await page.$eval('[id^="IN_none"]', l => l.checked)).toBe(false)
        await hover('IN_none', 'not available in 2024')
        await page.click('[id^="TT_close"]')

        await sleep(100)
        expect(await waitSel('[id^="TT_u_greet"]', name(vol), 'grey')).toBeTruthy()
        await page.click('[id^="TT_u_greet"]')
        expect(await waitSel(('[id^="popup_TT_u_greet"]'), l => l)).toBeTruthy()
        expect(await page.$eval('[id^="IN_adult"]', l => l.checked)).toBe(false)
        expect(await page.$eval('[id^="IN_junior"]', l => l.checked)).toBe(false)
        expect(await page.$eval('[id^="IN_none"]', l => l.checked)).toBe(false)
        await page.click('[id^="IN_adult"]')
        await page.click('[id^="TT_close"]')

        await sleep(200)
        expect(await waitSel('[id^="TT_u_greet"]', name(vol), 'blue')).toBeTruthy()
        expect(await waitSel('[id^="greet"]', 'thank you for volunteering')).toBeTruthy()
        await page.click('[id^="TT_u_greet"]')
        expect(await waitSel(('[id^="popup_TT_u_greet"]'), l => l)).toBeTruthy()
        expect(await page.$eval('[id^="IN_adult"]', l => l.checked)).toBe(true)
        expect(await page.$eval('[id^="IN_junior"]', l => l.checked)).toBe(false)
        expect(await page.$eval('[id^="IN_none"]', l => l.checked)).toBe(false)
        await page.click('[id^="IN_junior"]')
        await page.click('[id^="TT_close"]')

        await sleep(200)
        expect(await waitSel('[id^="TT_u_greet"]', name(vol), 'blue')).toBeTruthy()
        expect(await waitSel('[id^="greet"]', 'thank you for volunteering')).toBeTruthy()
        await page.click('[id^="TT_u_greet"]')
        expect(await waitSel(('[id^="popup_TT_u_greet"]'), l => l)).toBeTruthy()
        expect(await page.$eval('[id^="IN_adult"]', l => l.checked)).toBe(true)
        expect(await page.$eval('[id^="IN_junior"]', l => l.checked)).toBe(true)
        expect(await page.$eval('[id^="IN_none"]', l => l.checked)).toBe(false)
        await page.click('[id^="IN_none"]')
        await page.click('[id^="TT_close"]')

        await sleep(100)
        expect(await waitSel('[id^="TT_u_greet"]', name(vol), 'red')).toBeTruthy()
        expect(await waitSel('[id^="greet"]', 'thank you for confirming you are unable to help this year')).toBeTruthy()
        await page.click('[id^="TT_u_greet"]')
        expect(await waitSel(('[id^="popup_TT_u_greet"]'), l => l)).toBeTruthy()
        expect(await page.$eval('[id^="IN_adult"]', l => l.checked)).toBe(false)
        expect(await page.$eval('[id^="IN_junior"]', l => l.checked)).toBe(false)
        expect(await page.$eval('[id^="IN_none"]', l => l.checked)).toBe(true)
        await page.click('[id^="IN_none"]')
        await page.click('[id^="TT_close"]')

        await sleep(100)
        expect(await waitSel('[id^="TT_u_greet"]', name(vol), 'grey')).toBeTruthy()
        expect(await waitSel('[id^="greet"]', 'please confirm availability')).toBeTruthy()
    })

    test('Lead', async () => {
        //setDebug(true)
        await ajax({ req: 'test', reg: lead })
        await page.goto(url + '/volunteer#' + await token(lead.email))
        expect(await waitSel('[id^="TT_u_greet"]', name(lead), 'green')).toBeTruthy()
    })
})
