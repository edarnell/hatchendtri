// npm install @aws-sdk/client-ses
import express from 'express'
import { port, log, url } from './utils.mjs'
import { f } from './zip.mjs'
//import { send_list } from './mail.mjs'

const app = express()
app.use(express.json())

function resp(req, r, json, status) {
    if (status) {
        log.error('resp->' + req, status)
        r.status(status).json(json)
    }
    else {
        log.info('resp->' + req)
        r.json(json)
    }
}

app.post(url, (m, r) => {
    const json = m.body, { req } = json
    log.info('req->' + req)
    if (req) {
        if (req === 'results') {
            const results = f('gz/results.gz')
            resp(req, r, { results })
        }
        /*else if (req === 'send') {
            const { name, email, subject, message } = json
            if (name && email && subject && message) send_m({ name, email, subject, message }).then(s => resp(req, r, { sent: s }))
            else resp(req, r, { message: 'no data' }, 400)
        }*/
        else if (req === 'send_list') {
            const { emails } = json
            //if (emails) send_list(emails)
            resp(req, r, { sending: Object.keys(emails).length })
            //else resp(req, r, { message: 'no data' }, 400)
        }
        else if (req === 'volunteers') {
            const volunteers = f('gz/vs.gz'), roles = f('gz/roles.gz'), v2023 = f('lists/2023V.txt')
            resp(req, r, { volunteers, roles, v2023 })
        }
        else if (req === 'emails') {
            const emails = f('gz/emails.gz')
            resp(req, r, { emails })
        }
        else resp(req, r, { message: 'Invalid request' }, 404)
    }
    else resp(req, r, { message: 'No Request' }, 400)
})


app.listen(port, () => {
    log.info(`listening on ${url} port ${port}`)
})

function start() {
    log.info('start')
    app.listen(port, () => {
        log.info(`listening on ${url} port ${port}`)
    })
}

export default start
