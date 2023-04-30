// credentials in config.json
import { STSClient, GetSessionTokenCommand } from '@aws-sdk/client-sts'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { f } from './zip.mjs'
import jwt from 'jsonwebtoken'
import { log } from './hatchend.mjs'

const config = f('config.json', true)
const mail = f('mail.html', true)
const aws = config.aws

function send_list(list, subject, message, live) {
    const length = list.length
    log.info({ sending: length })
    return new Promise((s, f) => {
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
            for (var i = 0; i < length; i += n) {
                const { sent, failed } = await send_batch(n, list, i, ses, subject, message, live)
                if (i === n) s({ sending: { sent, failed, length } })
                log.info({ sent, failed })
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        }).catch(e => f(e))
    })
}

async function send_batch(n, list, i, ses, subject, message, live) {
    const emails = list.slice(i, i + n)
    const promises = emails.map(async r => {
        return ses.send(new SendEmailCommand(email({ to: r.to.name, email: live && r.to.email, subject, message })))
            .then(r => r.MessageId)
            .catch(e => {
                log.info({ error: e, email: live && r.to.email })
                return false
            })
    })
    const results = await Promise.all(promises)
    const sent = results.filter(r => r).length
    const failed = emails.length - sent
    return { sent, failed }
}

function html_text(html) {
    return html.replace(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*?>(.*?)<\/a>/gi, '$3 ($2)').replace(/<br\s*\/?>/gi, '\n');
}

const _footer = '<a href="{host}">Hatch End Triathlon</a> is organised and run by '
    + '<a href="https://jetstreamtri.com">Jetstream Triathlon Club</a><br/>'
/*
+ 'You can <a href="{host}/update{token}">update</a> your details '
+ 'or <a href="{host}/unsubscribe{token}">unsubscribe</a> at any time.'*/
function email(p) {
    var html = mail.slice()
    const m = {}
    const token = (p.email) ? jwt.sign({ email: p.email, ts: Date.now() }, config.key) : ''
    m.to = p.to || "Race Organiser"
    m.footer = (p.footer || _footer)
    m.from = p.from || 'Ed darnell<br>Race Organiser'
    m.message = p.message && p.message.replace(/\n/g, "<br />\r\n") || ''
        ;['to', 'message', 'from', 'footer'].forEach(k => {
            const re = new RegExp('{{' + k + '}}', 'g')
            html = html.replace(re, m[k])
        })
    html = html.replace(/\{(volunteer|competitor|home|contact|details|results)(?:\.([^\s}]+))?\}/g, (match, page, link) => {
        return `<a href="{host}/${page}{token}">${link || page}</a>`
    })
    html = html.replace(/\{token\}/g, '#' + token)
    html = html.replace(/\{host\}/g, config.host)
    const text = "Dear " + m.to + "\r\n"
        + html_text(m.message) + "\r\n"
        + html_text(m.from) + "\r\n"
        + html_text(m.footer) + "\r\n"
    const ps = {
        Destination: {
            ToAddresses: [p.email || config.admin_to],
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
        Source: config.admin_to,
        ReplyToAddresses: [p.from_email || config.admin_to],
    }
    return ps
}

function send(p) {
    return new Promise((s, f) => {
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
            ses.send(new SendEmailCommand(email(p))).then(r => s(r)).catch(e => f(e))
        }).catch(e => f(e))
    })
}

export { send_list, send }