import Html from './Html'
import results from './html/Results.html'
import css from './css/Home.css'
import rgz from './res/results.gz'
import npz from './res/np.gz'
import { unzip, debug } from './unzip'
import photo from './res/photo.svg'

const form = {
  filter: { placeholder: 'name,name,...', width: '50rem' },
  mf: { options: ['M/F', 'M', 'F'] },
  cat: { options: ['Cat', 'Junior', 'TS', 'T1', 'T2', 'T3', 'Y', 'Adult', 'S*', 'SY', 'S1', 'S2', 'S3', 'S4', 'V*', 'V1', 'V2', 'V3', 'V4'] },
  year: { options: ['Year', '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2017', '2018', '2019', '2022'] },
  n: { options: ['N', '1', '3', '5', '10', '20'] },
  c: { class: 'red bold hidden', tip: 'clear all filters' },
}

class Results extends Html {
  constructor() {
    super(results, css, null, form)
    unzip(npz).then(np => {
      this.np = np
      unzip(rgz).then(r => {
        this.r = r
        this.render()
      })
    })
    const i = this.watchLinks(form, this.change)
    this.form = { i, data: this.getForm(i) }
  }
  change = (e) => {
    if (e.target.name === 'c') this.setForm(this.form.i, { filter: '', mf: 'M/F', cat: 'Cat', year: 'Year', n: 'N' })
    this.update()
  }
  update = () => {
    this.form.data = this.getForm(this.form.i)
    const blank = Object.keys(this.form.data).filter(k => this.form.data[k]).length
    this.shadowRoot.querySelector(`[name=c]`).classList[blank ? 'remove' : 'add']('hidden')
    // debug({ change: { name, value, blank, data: this.form.data } })
    this.render()
  }
  yearClick = (l) => {
    const year = l.innerHTML
    if (year !== this.form.data.year) this.setForm(this.form.i, { year })
    else this.setForm(this.form.i, { year: 'Year' })
    this.update()
  }
  render = () => {
    if (this.li) this.removeLinks(this.li)
    const root = this.shadowRoot, el = root.querySelector('.results'),
      results = this.results(), links = { year: { f: this.yearTip, click: this.yearClick, class: 'link' } }
    el.innerHTML = this.createLinks(links, results)
    this.li = this.watchLinks(links)
  }
  yearTip = (l) => {
    const year = l.innerHTML
    return this.form.data.year === year ? 'all years summary' : `${year} all results`
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
    const results = this.r, c = this.cols(yr),
      { year, cat, mf, filter, n } = this.form.data
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
  cols(year) {
    const r = this.r
    let c = {}, cn = 0
    r[year][0].forEach(n => { c[n] = cn++ })
    return c
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
  results() {
    const th = ['Pos', 'Name', 'MF', 'Cat', 'Total', 'Swim', 'T1', 'Bike', 'T2', 'Run', 'Club'],
      years = Object.keys(this.r).reverse()
    let n = 0, ret = [], i = 0
    years.map(year => {
      const cs = this.cols(year), ths = th.filter(x => cs[x] !== undefined), ns = ths.map(th => cs[th])
      let rows = n < 100 ? this.filter(year) : []
      n += rows.length
      //${i ? year : this.years(years)}
      if (rows.length > 0) ret.push(`<h5>{links.year.${year}}</h5><table name="${year}">
        <thead>${ths.map(h => `<th>${h === 'MF' ? 'M/F' : h}</th>`).join('')}</thead>
        <tbody>${rows.map(row => `<tr>${ns.map(n => `<td class='rselect' name="${n}">${row[n]}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>`)
      i++
      //debug({ year, ths, ns, rows })
    })
    return ret.join('')
  }
}

export default Results
