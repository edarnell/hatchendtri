import Html, { debug } from './Html'
import html from './html/Competitor.html'
import { ajax } from './ajax'
import { unzip } from './unzip'

const cat = {
  'Adult Experienced (17yrs+)': 'Ae',
  'Adult Novice (17yrs+)': 'An',
  'Youths : 15-16 yrs': 'Youth',
  'Tristar 3: 13-14 yrs': 'T3',
  'Tristar 2: 11-12 yrs': 'T2',
  'Tristar 1: 9-10 yrs': 'T1',
  'Tristart: 8 yrs': 'TS'
}
const rCat = Object.entries(cat).reduce((acc, [key, value]) => {
  acc[value] = key
  return acc
}, {})

const mf = {
  'Open': 'M',
  'Male': 'M',
  'Female': 'F'
}

const form = {
  filter: { placeholder: 'name, club or email', width: '50rem' },
  cat: { options: ['Cat', 'Adult', 'An', 'Ae', 'Junior', 'TS', 'T1', 'T2', 'T3', 'Youth'] },
  mf: { options: ['M/F', 'Open', 'Male', 'Female'] },
}

class Competitor extends Html {
  constructor() {
    super()
  }
  connectedCallback() {
    if (!this.fs) ajax({ req: 'emails' }).then(this.data)
    else this.render(html, true)
  }
  ths = (o) => {
    const { name } = o.attr()
    if (name === 'entries') return ['First', 'Last', 'Cat', 'M/F', 'Club']
  }
  trs = (o) => {
    const { name } = o.attr()
    if (name === 'entries') {
      this.entries = o
      return this.comp2023()
    }
  }
  var = (o) => {
    const { name, param } = o.attr()
    if (param === 'update') {
      this.vars.update.push(o)
      if (name === 'n') this.n = o
      return '...'
    }
    else if (typeof this.vars[name] === 'string') return this.vars[name]
    else debug({ var: name, vars: this.vars })
  }
  tip = (n, p) => {
    if (n === 'mf') return p === 'F' ? "Female" : "Open/Male"
    else if (n === 'cat') return rCat[p]
  }
  link = (o) => {
    const { name, param } = o.attr()
    const tt = {
      cat: { f: () => this.tip(name, param) },
      mf: { f: () => this.tip(name, param) },
      update: { class: 'hidden', f: () => { } }
    }
    return tt[name]
  }
  form = (o) => {
    const { name } = o.attr(), k = name && name.toLowerCase()
    if (form[k]) return form[k]
  }
  update = (e, o) => {
    this.form_data = this.getForm(form)
    this.entries.setAttribute('param', 'update')
    this.n.setAttribute('param', this.var.n) // any value to force update
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
    this.render(html, true)
  }
  filter = (c, m) => {
    const { cat, mf } = this.form_data || {},
      cs = cat === 'Adult' ? ['An', 'Ae'] : cat === 'Junior' ? ['TS', 'T1', 'T2', 'T3', 'Youth'] : [cat]
    if (cat && cat !== 'Cat' && cs.indexOf(c) === -1) return false
    if (mf && mf !== 'M/F' && m !== mf) return false
    return true
  }
  comp2023 = () => {
    const emails = Object.keys(this.emails).filter(e => this.emails[e]['2023C'])
    let ret = []
    emails.forEach(e => {
      const cs = this.emails[e]['2023C']
      cs.forEach(c => {
        if (this.filter(cat[c.cat], mf[c.gender])) ret.push([c.first, c.last, `{link.cat.${cat[c.cat]}}`, `{link.mf.${mf[c.gender]}}`, c.club || ''])
      })
    })
    this.vars.n = ret.length.toString()
    return ret.sort((a, b) => a[1] > b[1] ? 1 : -1)
  }
}

export default Competitor
