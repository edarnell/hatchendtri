import Html, { debug } from './Html'
import html from './html/Competitor.html'
import { ajax } from './ajax'
import { unzip } from './unzip'

class Competitor extends Html {
  constructor() {
    super()
    ajax({ req: 'emails' }).then(this.data)
  }
  data = (r) => {
    debug({ r })
    this.emails = unzip(r.emails.data)
    let fs = {}
    Object.keys(this.emails).forEach(e => {
      Object.keys(this.emails[e]).forEach(k => {
        if (!fs[k]) fs[k] = []
        fs[k].push(e)
      })
    })
    this.fs = fs
    /*
    const p = this.files()
    debug({ p })
    this.form = p.form*/
    this.divs = { email_table: this.all() }
    this.form = {
      filter: { placeholder: 'name,name,...', width: '50rem' },
      send: { class: 'primary', submit: true },
    }
    this.init({ id: 'competitor_page', html })
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
  templates = (links) => {
    return 'hello'
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
  all = () => {
    let l = {}, emails = Object.keys(this.emails).filter(e => this.emails[e]['2023C'])
    debug({ emails })
    emails.forEach(e => {
      l[e] = this.first_last(e)
    })
    return this.table(l)
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
