import Html, { debug, page, nav, _s } from './Html'
import html from './html/Competitor.html'
import greet from './html/comp_greet.html'
import { cleanse } from './data'

const cmap = {
  'Adult Experienced (17yrs+)': 'Ae',
  'Adult Novice (17yrs+)': 'An',
  'Youths : 15-16 yrs': 'Youth',
  'Tristar 3: 13-14 yrs': 'T3',
  'Tristar 2: 11-12 yrs': 'T2',
  'Tristar 1: 9-10 yrs': 'T1',
  'Tristart: 8 yrs': 'TS'
}
const rCat = Object.entries(cmap).reduce((acc, [key, value]) => {
  acc[value] = key
  return acc
}, {})

const mfmap = {
  'Open': 'M',
  'Male': 'M',
  'Female': 'F'
}

const form = {
  filter: { placeholder: 'name, club or email', width: '50rem' },
  cat: { options: ['Cat', 'Adult', 'An', 'Ae', 'Junior', 'TS', 'T1', 'T2', 'T3', 'Youth'] },
  mf: { options: ['M/F', 'Open', 'Male', 'Female'] },
  C: { class: 'hidden form red bold', tip: 'clear name', submit: true },
}

class Competitor extends Html {
  constructor() {
    super()
    this.data = 'cs'
    form.update = { class: 'form primary hidden', tip: this.formtip }
  }
  html = (o) => {
    if (!o) return html
    else if (o.attr().name === 'greet') return this.greet(o)
  }
  ths = (o) => {
    const { name } = o.attr()
    if (name === 'entries') return ['#', 'Briefing', 'Start', 'First', 'Last', 'Age Group', 'M/F', 'Club']
  }
  trs = (o) => {
    const { name } = o.attr()
    if (name === 'entries') {
      this.entries = o
      return this.comp2023()
    }
  }
  greet = (o) => {
    const u = nav._user, cs = u && u.comp
    if (cs) return greet
    else return ''
  }
  comptip = (id) => {
    const c = page.cs[id]
    if (c.swim400) return `Swim 400m ${cleanse(c.swim400) || '? not given'}` // TODO: add link to update
    return "Junior times/preferences not required in advance"
  }
  tip = (e, o) => {
    const { name, param } = o.attr()
    if (name === 'mf') return param === 'F' ? "Female" : "Open/Male"
    else if (name === 'cat') return rCat[param]
    else if (name === 'Entries') return `${this.rows} rows selected`
  }
  link = (o) => {
    const { name, param } = o.attr(), user = nav._user && nav._user.comp
    if (name.startsWith('u_')) {
      const id = name.substring(2), comp = page.cs[id], _id = name.substring(1)
      return { tip: () => this.comptip(id), theme: 'light' }
    }
    const tt = {
      cat: { tip: this.tip },
      mf: { tip: this.tip },
      Entries: { tip: this.tip }
    }
    return tt[name]
  }
  form = (o) => {
    const { name } = o.attr()
    if (form[name]) return form[name]
  }
  update = (e, o) => {
    const { name } = o.attr()
    if (name === 'C') this.setForm({ filter: '', cat: 'Cat', mf: 'M/F' }, form)
    const f = this.form_data = this.getForm(form),
      C = this.querySelector(`button[name=C]`),
      blank = f.filter === '' && f.cat === 'Cat' && f.mf === 'M/F'
    C.classList[blank ? 'add' : 'remove']('hidden')
    this.entries.setAttribute('param', 'update')
  }
  filter = (c) => {
    const { cat, mf, filter } = this.form_data || {},
      f = filter && filter.toLowerCase(),
      r = [c.first.toLowerCase(), c.last.toLowerCase(), c.club.toLowerCase()],
      cs = cat === 'Adult' ? ['An', 'Ae'] : cat === 'Junior' ? ['TS', 'T1', 'T2', 'T3', 'Youth'] : [cat]
    if (cat && cat !== 'Cat' && !cs.includes(cmap[c.cat])) return false
    if (mf && mf !== 'M/F' && c.gender !== mf) return false
    if (f && !r.join(',').includes(f)) return false
    return true
  }
  comp2023 = () => {
    const user = nav._user && nav._user.comp, ret = Object.values(page.cs).filter(this.filter)
      .map(c => [c.n, c.brief, c.start, c.first, c.last,
      c.ageGroup,
      `{link.mf.${mfmap[c.gender]}}`, c.club || ''])
      .sort((a, b) => a[4] > b[4] ? 1 : -1)
    this.rows = ret.length
    return ret
  }
}

export default Competitor
