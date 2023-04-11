import Html, { debug } from './Html'
import html from './html/Results.html'
import photo from './icon/photo.svg'
import { ajax } from './ajax'
import { unzip } from './unzip'

const form = {
  filter: { placeholder: 'name,name,...', width: '50rem' },
  mf: { options: ['M/F', 'M', 'F'] },
  cat: { options: ['Cat', 'Junior', 'TS', 'T1', 'T2', 'T3', 'Y', 'Adult', 'S*', 'SY', 'S1', 'S2', 'S3', 'S4', 'V*', 'V1', 'V2', 'V3', 'V4'] },
  year: { options: ['Year', '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2017', '2018', '2019', '2022'] },
  n: { options: ['N', '1', '3', '5', '10', '20'] },
  c: { class: 'form red bold hidden', tip: 'clear all filters' },
}

class Results extends Html {
  constructor() {
    super()
    this.data = { form, update: this.update }
  }
  connectedCallback() {
    //debug({ connectedCallback: this })
    if (!this.r) ajax({ req: 'results' }).then(this.res)
    else this.innerHTML = this.render(html)
  }
  disconnectedCallback() {
    // Add code to run when the element is removed from the DOM
    debug({ disconnectedCallback: this.id })
  }
  res = (r) => {
    this.r = unzip(r.results.data)
    this.form_data = this.getForm()
    this.innerHTML = this.render(html)
  }
  update = (e) => {
    if (e && e.target.name === 'c') this.setForm({ filter: '', mf: 'M/F', cat: 'Cat', year: 'Year', n: 'N' })
    this.form_data = this.getForm()
    const blank = Object.keys(form).filter(k => this.form_data[k]).length
    const c = this.querySelector(`button[name=c]`)
    c && c.classList[blank ? 'remove' : 'add']('hidden')
    const el = this.querySelector("ed-div[name=results_all]"), res = this.results_all()
    el.innerHTML = this.render(res.html)
  }
  yearClick = (l) => {
    const year = l.innerHTML
    if (year !== this.form.data.year) this.setForm(this.form.i, { year })
    else this.setForm(this.form.i, { year: 'Year' })
    this.render()
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
      { year, cat, mf, filter, n } = this.form_data
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
  /*
  const links={}
  const th = ['Pos', 'Name', 'MF', 'Cat', 'Total', 'Swim', 'T1', 'Bike', 'T2', 'Run', 'Club'],
  const cs = this.cols(year), 
  ths = th.filter(x => cs[x] !== undefined), 
  ns = ths.map(th => cs[th]),
  rows = n < 100 ? this.filter(year) : []
    ret.push(`{div.results_year.${year}}`) id=results_table_${year} class=results_table}`) //${i ? year : this.years(years)}
      ret.push(`<h5>{links.year.${year}}</h5>`)
      ret.push(`<ed-table></ed-table>`)
    
    <table name="${year}">
      <thead>${ths.map(h => `<th>${h === 'MF' ? 'M/F' : h}</th>`).join('')}</thead>
      <tbody>${rows.map(row => `<tr>${ns.map(n => `<td class='rselect' name="${n}">${row[n]}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>`)
    i++
    //debug({ year, ths, ns, rows })
  })
  return ret.join('')
*/
  cols(year) {
    const r = this.r
    let c = {}, cn = 0
    r[year][0].forEach(n => { c[n] = cn++ })
    return c
  }
  results_year = (year) => {
    const th = ['Pos', 'Name', 'MF', 'Cat', 'Total', 'Swim', 'T1', 'Bike', 'T2', 'Run', 'Club'],
      cs = this.cols(year),
      ths = th.filter(x => cs[x] !== undefined),
      ns = ths.map(th => cs[th]),
      cols = ths.map(h => h === 'MF' ? 'M/F' : h),
      rs = this.filter(year),
      rows = rs.map(r => ns.map((n, i) => i === 1 ? `{link.name.${r[n].replace(/\s+/g, '_')}}` : r[n]))
    return {
      links: {
        year: { tip: `${year} all results`, click: this.setYear },
        name: { f: this.name_filter, click: this.setName }
      },
      cols, rows,
      html: `<h5>{link.year.${year}}</h5>{table.results_year.${year}}`
    }
  }
  results_all = () => {
    debug({ results_all: this.form_data })
    const years = Object.keys(this.r).reverse()
    return {
      html: years.map((year, n) => {
        let rows = n < 100 ? this.filter(year) : []
        n += rows.length
        return (rows.length > 0) ? `{this.results_year.${year}}` : ''
      }).join('')
    }
  }
}

export default Results
