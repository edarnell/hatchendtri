import Html, { debug, page } from './Html'
import html from './html/Competitor.html'

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
    this.data = 'cs'
    form.update = { class: 'form primary hidden', tip: this.formtip }
  }
  html = () => html
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
    if (name === 'date') return page.cs_date || ''
    else debug({ var: name, vars: this.vars })
  }
  tip = (e, o) => {
    const { name, param } = o.attr()
    if (name === 'mf') return param === 'F' ? "Female" : "Open/Male"
    else if (name === 'cat') return rCat[param]
    else if (name === 'Entries') return `${this.rows} rows selected`
  }
  link = (o) => {
    const { name } = o.attr()
    const tt = {
      cat: { tip: this.tip },
      mf: { tip: this.tip },
      Entries: { tip: this.tip }
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
  }
  filter = (c, m) => {
    const { cat, mf } = this.form_data || {},
      cs = cat === 'Adult' ? ['An', 'Ae'] : cat === 'Junior' ? ['TS', 'T1', 'T2', 'T3', 'Youth'] : [cat]
    if (cat && cat !== 'Cat' && cs.indexOf(c) === -1) return false
    if (mf && mf !== 'M/F' && m !== mf) return false
    return true
  }
  comp2023 = () => {
    const cs = page.cs, ret = []
    cs.forEach(c => {
      if (this.filter(cat[c.cat], mf[c.gender])) ret.push([c.first, c.last, `{link.cat.${cat[c.cat]}}`, `{link.mf.${mf[c.gender]}}`, c.club || ''])
    })
    this.rows = ret.length
    return ret.sort((a, b) => a[1] > b[1] ? 1 : -1)
  }
}

export default Competitor
