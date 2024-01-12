import Html, { debug, nav, _s } from './Html'
import html from './html/Competitor.html'
import greet from './html/comp_greet.html'

const cmap = {
  'Adult - novice': 'An',
  'Adult - experienced': 'Ae',
  'Youths: 15-16 yrs': 'Youth',
  'Tristar 3: 13-14 yrs': 'T3',
  'Tristar 2: 11-12 yrs': 'T2',
  'Tristar 1:  9-10 yrs': 'T1',
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
    this.data = ['cs']
    this.id = 'competitor'
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
    if (name === 'greet') return `<p>Entries last updated ${this.upd()}. See {nav.results} for previous years.</p>`
    else if (name === 'entries') return '<div id="entries">{table.entries}</div>'
    else if (!name) return `<div id='competitor'>${html}</div>`
    else error({ html: name })
  }
  upd = () => {
    const s = nav.d.dates.cs, date = s && new Date(s), d = date && date.toLocaleString('en-GB')
    return d || '...'
  }
  loaded = (r) => {
    if (r) this.reload()
  }
  ths = (name) => {
    if (name === 'entries') return ['First', 'Last', 'Age Group', 'M/F', 'Club']
  }
  trs = (name) => {
    if (name === 'entries') {
      return this.comp2024()
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
    else if (name === 'Entries') return `${this.rows} rows selected`
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
      r = [c.first.toLowerCase(), c.last.toLowerCase(), (c.club || '').toLowerCase()],
      cs = cat === 'Adult' ? ['An', 'Ae'] : cat === 'Junior' ? ['TS', 'T1', 'T2', 'T3', 'Youth'] : [cat]
    if (cat && cat !== 'Cat' && !cs.includes(cmap[c.cat])) return false
    if (mf && mf !== 'M/F' && c.mf !== mf) return false
    if (f && !r.join(',').includes(f)) return false
    return true
  }
  comp2024 = () => {
    const cs = nav.d.data.cs, ret = cs ? Object.values(cs).filter(this.filter)
      .map(c => [c.first, c.last,
      cmap[c.cat] ? `{link.cat.${cmap[c.cat]}}` : c.cat,
      mfmap[c.mf] ? `{link.mf.${mfmap[c.mf]}}` : c.mf, c.club || ''])
      .sort((a, b) => a[1] > b[1] ? 1 : -1)
      : []
    this.rows = ret.length
    return ret
  }
}

export default Competitor
