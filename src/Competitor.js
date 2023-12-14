import Html, { debug, nav, _s } from './Html'
import html from './html/Competitor.html'
import greet from './html/comp_greet.html'

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

}

class Competitor extends Html {
  constructor() {
    super()
    //this.data = ['cs']
    this.id = 'cometitor'
    //       class: 'form primary hidden', tip: this.formtip
  }
  form = () => {
    return {
      filter: { placeholder: 'name, club or email', width: '50rem' },
      cat: { options: ['Cat', 'Adult', 'An', 'Ae', 'Junior', 'TS', 'T1', 'T2', 'T3', 'Youth'] },
      mf: { options: ['M/F', 'Open', 'Male', 'Female'] },
      C: { class: 'hidden form red bold', tip: 'clear name', click: 'submit' },
    }
  }
  html = (name) => {
    if (name === 'greet') return '<p>Entries open 15 December 2023. See {nav.results} for previous years.</p>'//this.greet()
    else if (name === 'entries') return '<div id="entries"></div>'//`<div id='entries'>{table.entries}</div>`
    else if (!name) return html
    else error({ html: name })
  }
  ths = (name) => {
    if (name === 'entries') return ['#', 'Briefing', 'Start', 'First', 'Last', 'Age Group', 'M/F', 'Club']
  }
  trs = (name) => {
    if (name === 'entries') {
      return this.comp2023()
    }
  }
  greet = () => {
    const u = nav._user, cs = u && u.comp
    if (cs) return greet
    else return ''
  }
  comptip = (id) => {
    const c = page.cs[id]
    return `Briefing ${c.brief}, Start ${c.start}<br />Register and rack your bike before the briefing.` // TODO: add link to update
  }
  tip = (e, o) => {
    const { name, param } = o
    if (name === 'mf') return param === 'F' ? "Female" : "Open/Male"
    else if (name === 'cat') return rCat[param]
    else if (name === 'Entries') return 'opens 12 December 2023'//`${this.rows} rows selected`
  }
  link = (name) => {
    if (name.startsWith('u_')) {
      const id = name.substring(2), comp = page.cs[id], _id = name.substring(1)
      return { tip: () => this.comptip(id) }
    }
    const tt = {
      cat: { tip: this.tip },
      mf: { tip: this.tip },
      Entries: { tip: this.tip }
    }
    return tt[name]
  }
  input = (e, o) => {
    const name = o && o.name
    if (name === 'C') this.setForm({ filter: '', cat: 'Cat', mf: 'M/F' })
    const f = this.form_data = this.getForm(),
      C = this.fe('C'),
      blank = f.filter === '' && f.cat === 'Cat' && f.mf === 'M/F'
    C.classList[blank ? 'add' : 'remove']('hidden')
    this.reload('entries')
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
    const user = nav._user && nav._user.comp,
      cs = nav.d.data['cs'], ret = cs && Object.values(cs).filter(this.filter)
        .map(c => [c.n, c.brief, c.start, c.first, c.last,
        c.ageGroup,
        `{link.mf.${mfmap[c.gender]}}`, c.club || ''])
        .sort((a, b) => a[4] > b[4] ? 1 : -1)
    this.rows = ret.length
    return ret
  }
}

export default Competitor
