// credentials in config.json
import { STSClient, GetSessionTokenCommand } from '@aws-sdk/client-sts'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import jwt from 'jsonwebtoken'
import { log } from './hatchend.mjs'
import { d, saveF } from './files.mjs'
import fs from 'fs' // for testing - write of email files

function send_list(m) {
    const aws = { ...d.config.aws },
        { subject, list } = m,
        length = list.length
    log.info({ sending: length })
    aws.clientDefault = { outputFormat: 'json' }
    const sts = new STSClient(aws)
    const stsCommand = new GetSessionTokenCommand({ DurationSeconds: 900 })
    sts.send(stsCommand).then(async r => {
        const ses = new SESClient({
            clientDefault: { outputFormat: 'json' },
            region: aws.region,
            credentials: {
                accessKeyId: r.Credentials.AccessKeyId,
                secretAccessKey: r.Credentials.SecretAccessKey,
                sessionToken: r.Credentials.SessionToken
            }
        })
        const n = 10
        let s_ = 0, f_ = 0
        for (var i = 0; i < length; i += n) {
            const { sent, failed } = await send_batch(ses, n, m, i)
            s_ += sent, f_ += failed
            log.info({ sent: s_, failed: f_ })
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
        send({
            subject: 'bulk send',
            message: `${subject}\nSent to ${s_} of ${length} recipients (${f_} failed)\n`
        })
    }).catch(e => log.error(e))
}

// should look to modify to bulk send
async function send_batch(ses, n, m, i) {
    const { subject, message, live, unsub, list } = m, emails = list.slice(i, i + n)
    const promises = emails.map(async r => {
        return ses.send(new SendEmailCommand(email({ to: r.to.name, email: d.ei[r.to.email], subject, message, live, unsub })))
            .then(r => r.MessageId)
            .catch(e => {
                log.error({ error: e, email: r.to.email })
                return false
            })
    })
    const results = await Promise.all(promises)
    const sent = results.filter(r => r).length
    const failed = emails.length - sent
    const log = { ...m }
    log.list = emails
    log.results = results
    saveF('mail', log)
    return { sent, failed }
}

function html_text(html) {
    return html.replace(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*?>(.*?)<\/a>/gi, '$3 ($2)').replace(/<br\s*\/?>/gi, '\n');
}

const _footer = '{het} is organised and run by {jet}<br/><br/>',
    _unsub = 'You are receiving this email because you previously entered or volunteered.<br/>'
        + 'You can reply to this email or {unsubscribe} at any time.',
    _reg = 'Your email is not currently registered. You can reply to this email, or {register} at any time.'
function email(p) {
    var html = d.mail // a copy as it is a string
    const m = {},
        to_email = p.to_email || (p.v ? d._vs[p.v].email : d.config.admin_to),
        u = p.i && d.es[p.i],
        from = p.email || (u ? d.ei[u.i] : d.config.admin_to),
        token = jwt.sign({ email: to_email }, d.config.key),
        test = from.includes('epdarnell+') || to_email.includes('epdarnell+')
    m.to = p.to || (p.v ? d.vs[p.v].first : "Race Organiser")
    m.footer = (p.footer || _footer) + (p.unsub ? _unsub : '') + (p.reg ? _reg : '')
    m.from = u ? u.first + ' ' + u.last : p.name || 'Ed Darnell<br>Race Organiser'
    m.message = p.message && p.message.replace(/\n/g, "<br />\r\n") || ''
        ;['to', 'message', 'from', 'footer'].forEach(k => {
            const re = new RegExp('{{' + k + '}}', 'g')
            html = html.replace(re, m[k])
        })
    html = html.replace(/\{(volunteer|competitor|home|details|results|register|unsubscribe|yes|no)(?:\.([^\s}]+))?\}/g, (match, page, link) => {
        return `<a href="{host}/${page}{token}">${(link && link.replace(/_/g, "&nbsp;")) || page}</a>`
    })
    html = html.replace(/\{jet\}/g, '<a href="https://jetstreamtri.com">Jetstream Triathlon Club</a>')
    html = html.replace(/\{het\}/g, '<a href="{host}">Hatch End Triathlon</a>')
    html = html.replace(/\{url\}/g, '<a href="{host}">hatchendtri.com</a>')
    html = html.replace(/\{atw\}/g, '<a href="https://www.atwevents.co.uk/e/hatch-end-harrow-triathlon-10671">ATW</a>')
    html = html.replace(/\{token\}/g, '#' + token)
    html = html.replace(/\{host\}/g, p.live ? 'https://hatchendtri.com' : d.config.host)
    const text = "Dear " + m.to + "\r\n"
        + html_text(m.message) + "\r\n"
        + html_text(m.from) + "\r\n"
        + html_text(m.footer) + "\r\n"
    const ps = {
        Destination: {
            ToAddresses: [((p.live || d.config.live || test) && to_email) || d.config.admin_to],
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: html,
                },
                Text: {
                    Charset: "UTF-8",
                    Data: text,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: "Hatch End Triathlon - " + (p.subject || "Message"),
            },
        },
        Source: d.config.admin_to,
        ReplyToAddresses: [from],
    }
    if (!d.config.live && test) fs.writeFileSync('test/' + p.subject + '.email', JSON.stringify(ps, null, 2))
    return ps
}

function send(m) {
    return new Promise((s, f) => {
        const aws = { ...d.config.aws },
            l = saveF('ml', m)
        aws.clientDefault = { outputFormat: 'json' }
        const sts = new STSClient(aws)
        const stsCommand = new GetSessionTokenCommand({ DurationSeconds: 900 })
        sts.send(stsCommand).then(r => {
            const ses = new SESClient({
                clientDefault: { outputFormat: 'json' },
                region: aws.region,
                credentials: {
                    accessKeyId: r.Credentials.AccessKeyId,
                    secretAccessKey: r.Credentials.SecretAccessKey,
                    sessionToken: r.Credentials.SessionToken
                }
            })
            ses.send(new SendEmailCommand(email(m))).then(r => {
                saveF('ml', l, r)
                s(r)
            }).catch(e => {
                log.error({ e })
                saveF('ml', l, e)
                f(e)
            })
        }).catch(e => {
            log.error({ e })
            saveF('ml', l, e)
            f(e)
        })
    })
}

export { send_list, send }