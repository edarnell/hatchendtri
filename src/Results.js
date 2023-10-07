import { debug, _s } from './Dom'
import html from './html/Results.html'
import photo from './icon/photo.svg'
import { req } from './data'
import { str2csv } from './csv'

class Results {
  constructor(page) {
    this.page = page
    this.id = 'results'
    this.data = 'results'
    this.form = {
      filter: { placeholder: 'name,name,...', width: '50rem' },
      mf: { options: ['M/F', 'M', 'F'] },
      cat: { options: ['Cat', 'Junior', 'TS', 'T1', 'T2', 'T3', 'Y', 'Adult', 'S*', 'SY', 'S1', 'S2', 'S3', 'S4', 'V*', 'V1', 'V2', 'V3', 'V4'] },
      year: {
        options: ['Year', '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2017', '2018', '2019', '2022', '2023']
      },
      n: { options: ['N', '1', '3', '5', '10', '20'] },
      C: { class: 'form red bold hidden', tip: 'clear all filters', submit: true },
    }
  }
  html = (name, param) => {
    if (name === 'results_all') return this.results_all()
    else if (name === 'results_year') return this.results_year(param)
    else return html
  }
  link = (name, param) => {
    if (name === 'year') return { tip: `${param.replace(/_/g, " ")} all results`, click: this.year }
    else if (name === 'name') return { tip: `${param.replace(/_/g, " ")} all results`, click: this.name }
    else debug({ link: { name, param } })
  }
  ths = (name, param) => {
    if (name === 'results_year') {
      const year = param, th = ['Pos', 'Name', 'MF', 'Cat', 'Total', 'Swim', 'T1', 'Bike', 'T2', 'Run', 'Club'],
        cs = this.cols(year),
        ths = th.filter(x => cs[x] !== undefined)
      return ths
    } else debug({ ths: { name, param } })
  }
  trs = (name, param) => {
    if (name === 'results_year') {
      const year = param, th = ['Pos', 'Name', 'MF', 'Cat', 'Total', 'Swim', 'T1', 'Bike', 'T2', 'Run', 'Club'],
        cs = this.cols(year),
        ths = th.filter(x => cs[x] !== undefined),
        ns = ths.map(th => cs[th]),
        rs = this.filter(year),
        trs = rs.map(r => ns.map((n, i) => i === 1 ? `{link.name.${r[n].replace(/\s+/g, '_')}}` : r[n]))
      return trs
    } else debug({ trs: { name, param } })
  }
  toggle = (o) => {
    const { name, type, param } = o && o.attr(),
      f = this.form_data = this.getForm(form),
      clear = { filter: '', mf: 'M/F', cat: 'Cat', year: 'Year', n: 'N' },
      val = name === 'name' ? f['filter'] : f[name]
    return (param && val === param.replace(/_/g, " ")) ? clear[name] || '' : param.replace(/_/g, " ")
  }
  form_vals = () => {
    const f = this.form_data = this.page.getForm(this.form),
      C = { filter: '', mf: 'M/F', cat: 'Cat', year: 'Year', n: 'N' }
    let ret = {}
    Object.keys(f).forEach(k => ret[k] = f[k] === C[k] ? '' : f[k])
    return ret
  }
  update = (e, o) => {
    const p = o && o.attr(), name = p && p.name
    if (name === 'C') this.setForm({ filter: '', mf: 'M/F', cat: 'Cat', year: 'Year', n: 'N' }, form)
    this.refresh()
  }
  refresh = () => {
    const f = this.form_vals(),
      blank = Object.keys(f).filter(k => f[k] === '').length,
      c = this.querySelector(`button[name=C]`)
    c && c.classList[blank ? 'remove' : 'add']('hidden')
    this._results_all.setAttribute('param', 'update')
  }
  year = (e, o) => {
    const { name, param } = o
    debug({ name, param })
    //this.page.setForm(e, o)
  }
  name = (e, o) => {
    const { param } = o.attr(), n = _s(param, true), f = _s(this.form_data.filter, true)
    if (n !== f) this.setForm({ filter: _s(param, false) })
    else this.setForm({ filter: '' })
    this.refresh()
  }
  yearTip = (e, o) => {
    const { name, param } = o.attr(), year = param
    return this.form_data.year === year ? 'all years summary' : `${year} all results`
  }
  cnum = (a) => {
    const cs = { 'TS': 1, 'T1': 2, 'T2': 3, 'T3': 4, 'Y': 5 }
    let ret = cs[a[this.c.Cat]] ? cs[a[this.c.Cat]] : 6
    if (this.y < 2004 & ret < 5) ret = 4
    return ret
  }
  ts = (a) => {
    let hms = this.c[this.sort] ? a[this.c[this.sort]] : a[this.c.Total]
    if (!hms) return 9999999
    let [h, m, s] = hms.split(':')
    let secs = (h ? h * 3600 : 0) + m * 60 + s * 1
    if (!secs && hms !== 'DNF') console.log('ts', a, h, m, s)
    return secs
  }
  round(time) {
    let ret = time
    let [h, m, s] = time.split(':')
    if (s) ret = h + ':' + m + ':' + (s < 9.5 ? '0' : '') + Math.round(s)
    return ret
  }
  compare = (a, b) => {
    let ret
    ret = this.cnum(a) - this.cnum(b)
    if (ret === 0) ret = this.ts(a) - this.ts(b)
    return ret
  }
  filter = (yr) => {
    const results = this.page.data.results, c = this.cols(yr),
      { year, cat, mf, filter, n } = this.form_vals()
    let ret = []
    for (var i = 1; i < results[yr].length; i++) {
      let r = results[yr][i]
      if (!r
        || (year && year !== yr)
        || (mf && mf !== r[c.MF])
        || (cat && cat.indexOf('*') === -1 && cat !== r[c.Cat]
          && cat !== 'Adult' && cat !== 'Junior')
        || (cat === 'T*' && r[c.Cat][0] !== 'T')
        || (cat === 'Y*' && r[c.Cat][0] !== 'Y')
        || (cat === 'S*' && r[c.Cat][0] !== 'S')
        || (cat === 'V*' && r[c.Cat][0] !== 'V')
        || (cat === 'Adult' && r[c.Cat][0] !== 'S' && r[c.Cat][0] !== 'V')
        || (cat === 'Junior' && (r[c.Cat][0] === 'S' || r[c.Cat][0] === 'V'))
      ) r = false // header row
      //ret=this.number(ret)
      if (r) ret.push(r)
    }
    this.y = yr
    this.c = c // used by compare
    ret = ret.sort(this.compare)
    let _n, last, filtered = []
    ret.forEach(r => {
      let rr = null
      if (this.cnum(r) !== last) _n = 1
      else _n++
      if (r[c.Pos] !== 'DNF') r[c.Pos] = _n
      last = this.cnum(r)
      if (!filter && !year && !cat && !mf && !n) rr = r[c.Pos] * 1 === 1 ? r : null
      else if (filter) {
        filter.toLowerCase().split(',').forEach(n => {
          if (n.length > 0 && r[c.Name].toLowerCase().indexOf(n) !== -1) rr = r
          if (c.Club && n.length > 0 && r[c.Club].toLowerCase().indexOf(n) !== -1) rr = r
        })
      }
      else if (n) rr = r[c.Pos] * 1 <= n ? r : null
      else rr = r
      if (rr) {
        const photo = this.photos(year, r[c['#']])
        if (photo) r[c.Pos] = `${_n} ${photo}`
        filtered.push(rr)
      }
    })
    //debug({ filtered })
    return filtered
  }
  years = (years) => {
    const year = this.year || years[0]
    return `<select class="years">
          ${years.map(y => `<option ${y === year ? 'selected' : ''}>${y}</option>`).join('')}
        </select></div>`
  }
  photos = (year, num) => {
    return (this.np && year === '2022' && this.np[num]) ? `<image class="icon" name="${num}" src="${photo}">` : null
  }
  cols(year) {
    const r = this.page.data.results
    let c = {}, cn = 0
    r[year][0].forEach(n => { c[n] = cn++ })
    return c
  }
  results_year = (year) => {
    return `<h5>{link.year.${year}}</h5>{table.results_year.${year}}`
  }
  results_all = () => {
    const r = this.page.data.results, years = Object.keys(r).reverse()
    let n = 0
    //debug({ years, r })
    return years.map(year => {
      let rows = n < 100 ? this.filter(year) : []
      n += rows.length
      return (rows.length > 0) ? `{div.results_year.${year}}` : ''
    }).join('')
  }
}

export default Results
