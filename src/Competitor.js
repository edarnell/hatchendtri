import Html, { debug } from './Html'
import html from './html/Competitor.html'
import { ajax } from './ajax'
import { unzip } from './unzip'

class Competitor extends Html {
  constructor() {
    super()
    this.vars = { update: [] }
  }
  connectedCallback() {
    if (!this.fs) ajax({ req: 'emails' }).then(this.data)
    else this.update()
  }
  ths = (o) => {
    const { name } = o.attr()
    if (name === 'entries') return ['First', 'Last', 'Category', 'O/F']
  }
  trs = (o) => {
    const { name } = o.attr()
    if (name === 'entries') return this.comp2023()
  }
  var = (o) => {
    const { name, param } = o.attr()
    if (param === 'update') {
      this.vars.update.push(o)
      return '...'
    }
    else if (typeof this.vars[name] === 'string') return this.vars[name]
    else debug({ var: name, vars: this.vars })
  }
  form = (o) => {
    const { name } = o.attr(), k = name && name.toLowerCase(), form = {
      filter: { placeholder: 'name or email', width: '50rem' },
      cat: { options: ['Cat', 'Adult', 'AN', 'AE', 'Junior', 'TS', 'T1', 'T2', 'T3', 'Youth'] },
      mf: { options: ['O/F', 'Open', 'Female'] },
      update: { class: 'form primary disabled', submit: true, tip: 'update your details or swim time' },
    }
    if (form[k]) return form[k]
  }
  update = () => {
    this.innerHTML = this.render(html)
    this.vars.update.forEach(o => o.setAttribute('param', ''))
    this.vars.update = []
  }
  data = (r) => {
    debug({ r })
    this.vars.date = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' })
      .format(new Date(r.emails.date)).replace(",", " at ")
    this.emails = unzip(r.emails.data)
    let fs = {}
    Object.keys(this.emails).forEach(e => {
      Object.keys(this.emails[e]).forEach(k => {
        if (!fs[k]) fs[k] = []
        fs[k].push(e)
      })
    })
    this.fs = fs
    debug({ fs, emails: this.emails })
    this.update()
  }
  form_e = (e) => {
    e.preventDefault()
    if (e.target.name === 'filter') {
      const el = this.root.querySelector('#email_table')
      this.elist = this.filter(e.target.value)
      el.innerHTML = this.table(this.elist)
    }
    else if (e.target.name === 'send') {
      const data = { req: 'send_list', emails: this.elist }
      ajax(data)
    }
  }
  first_last = (e) => {
    let ret
    const c = this.emails[e]
      ;['2023', '2022', '2019', '2018', '2017'].forEach(y => {
        if (!ret && (c[y + 'C'] || c[y + 'W'] || c[y + 'D'])) {
          const u = c[y + 'C'] || c[y + 'W'] || c[y + 'D']
          let first = '', last = ''
          u.forEach(n => {
            if (!first) first = n.first
            else if (first.indexOf(n.first) == -1) first += `, ${n.first}`
            if (!last) last = n.last
            else if (last.indexOf(n.last) == -1) last += `, ${n.last}`
          })
          //debug({ c, y, first, last })
          ret = { first, last }
        }
        else if (!ret && c[y + 'V'] && (c[y + 'V'].name || (c[y + 'V'][0] && c[y + 'V'][0].name))) {
          const name = c[y + 'V'].name || c[y + 'V'][0].name,
            first = name && name.substring(0, name.lastIndexOf(' ')),
            last = name && name.substring(name.lastIndexOf(' '))
          //debug({ c, y, name, first, last })
          ret = { first, last }
        }
      })
    if (ret) return ret
    else if (c.vs) {
      const name = c.vs.name,
        first = name.substring(0, name.lastIndexOf(' ')),
        last = name.substring(name.lastIndexOf(' '))
      //debug({ c, name, first, last })
      return { first, last }
    }
    else if (c.MCs) {
      const mc = c.MCs[0]
        , first = mc.first, last = mc.last
      //debug({ c, first, last })
      return { first, last }
    }
    else return { first: '', last: '' }
  }
  filter = (t) => {
    let l = {}, emails = Object.keys(this.emails).filter(e => this.emails[e]['2023C'])
    debug({ emails })
    emails.forEach(e => {
      const n = this.first_last(e)
      if (n.first.toLowerCase().indexOf(t) > -1 || n.last.toLowerCase().indexOf(t) > -1) l[e] = n
    })
    return l
  }
  comp2023 = () => {
    const emails = Object.keys(this.emails).filter(e => this.emails[e]['2023C'])
    let ret = []
    emails.forEach(e => {
      const cs = this.emails[e]['2023C']
      cs.forEach(c => ret.push([c.first, c.last, c.cat, c.gender]))
    })
    this.vars.n = ret.length.toString()
    return ret.sort((a, b) => a[1] > b[1] ? 1 : -1)
  }
  files = () => {
    const fs = {
      C: ['2023', '2022', '2019', '2018', '2017'] //+C
      , W: ['2023', '2022'] //+W
      , D: ['2023', '2022'] //+D
      , V: ['2023', '2022', '2019', '2018', '2017'] // +V
      , M: ['MCs', 'MCu', 'MCc', 'vs']
    }
    let form = {}, html = ''
    Object.keys(fs).forEach(k => {
      html += `<div>${k} `
      fs[k].forEach(y => {
        if (this.fs[y + k] || this.fs[k]) {
          html += `${y}{checkbox.${k + y}} `
          form[k + y] = {}
        }
      })
      html += '</div>'
    })
    return { html, form }
  }
  n = (e) => {
    debug({ e })
  }
  tt = (email, f) => {
    const i = Object.keys(this.lks).length,
      html = `<span name="email_${i}" class="link">${email}</span>`
    this.lks[`email_${i}`] = { tip: email, click: this.n }
    return html
  }
  table = (l) => {
    const es = Object.keys(l)
    return `<table><thead><tr><th>Email (${es.length})</th><th>First</th><th>Last</th><th>Adult</th><th>Junior</th></tr></thead>
      <tbody>
      ${es.map(e => {
      const c = l[e]
      return `<tr><td>${e}</td><td>${l[e].first || ''}</td><td>${l[e].last || ''}</td><td>${c.adult || ''}</td><td>${c.junior || ''}</td></tr>`
    }).join('')}
      </tbody>
      </table>`
  }
  change = (e) => {
    this.all()
  }
}

export default Competitor
