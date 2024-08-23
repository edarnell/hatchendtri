import Html, { debug, nav, _s } from './Html.mjs'
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
  greet = () => {
    const u = nav._user
    debug({ greet: u })
    if (u.cs) {
      const cs = nav.d.data.cs
      return `<span>Welcome ${u.cs.map(c => `{link.c_${c}.${_s(cs[c].first)}}`).join(', ')} search or hover over your name for details.</span>`
    }
    else return ''
  }
  html = (name) => {
    if (name === 'greet') return this.greet() + `<p>Entries last updated ${this.upd()}. See {nav.results} for previous years.</p>`
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
    if (name === 'entries') return ['{link.num.#}', 'First', 'Last', 'Briefing', 'Start', 'Age Group', 'M/F', 'Club']
  }
  trs = (name) => {
    if (name === 'entries') {
      return this.comp2024()
    }
  }
  comptip = (id) => {
    const cs = nav.d.data.cs, c = cs[id]
    return `Number ${c.num}<br />Briefing ${c.brief}, Start ${c.start}<br />Register and rack your bike before the briefing.<br />Swim estimate ${c.swim}` // TODO: add link to update
  }
  tip = (e, o) => {
    const { name, param } = o
    if (name === 'mf') return param === 'F' ? "Female" : "Open/Male"
    else if (name === 'cat') return rCat[param]
    else if (name === 'Entries') return `${this.rows} rows selected`
  }
  link = (n) => {
    if (n.startsWith('c_')) {
      return { tip: () => this.comptip(n.substring(2)), theme: 'light' }
    }
    else {
      const tt = {
        num: {
          tip: this.n ? 'sort by name' : 'sort by number', click: () => {
            this.n = !this.n
            this.reload('entries')
          }
        },
        cat: { tip: this.tip },
        mf: { tip: this.tip },
        Entries: { tip: this.tip }
      }
      return tt[n]
    }
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
  sort = (a, b) => {
    if (this.n) return a[0] > b[0]
    else return a[2] > b[2] ? 1 : -1
  }
  comp2024 = () => {
    const cs = nav.d.data.cs, ret = cs ? Object.values(cs).filter(this.filter)
      .map(c => [c.num, c.first, c.last, c.brief, c.start,
      cmap[c.cat] ? `{link.cat.${cmap[c.cat]}}` : c.cat,
      mfmap[c.mf] ? `{link.mf.${mfmap[c.mf]}}` : c.mf, c.club || ''])
      .sort(this.sort)
      : []
    this.rows = ret.length
    return ret
  }
}

export default Competitor
