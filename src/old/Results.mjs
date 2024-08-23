import Html, { debug, error, _s, nav } from './Html.mjs'
import html from './html/Results.html'

class Results extends Html {
  constructor(p, name) {
    super(p, name)
    this.id = 'results'
    this.data = ['results', 'ps']
  }
  loaded = (r) => {
    debug({ loaded: r, data: nav.d.data })
    if (r) this.refresh()
  }
  updated = (r) => {
    //debug({ updated: r, data: nav.d.data })
    if (r) this.refresh()
  }
  rendered = () => {
    this.form_data = this.getForm()
  }
  form = () => {
    const form = {
      filter: { tip: 'filter by name or club', placeholder: 'name,name,...', width: '50rem' },
      mf: { tip: 'select Male/Open or Female', options: ['M/F', 'M', 'F'] },
      cat: { tip: 'select category', options: ['Cat', 'Junior', 'TS', 'T1', 'T2', 'T3', 'Y', 'Adult', 'S*', 'SY', 'S1', 'S2', 'S3', 'S4', 'V*', 'V1', 'V2', 'V3', 'V4'] },
      year: {
        tip: 'select year',
        options: ['Year', '2024', '2023', '2022', '2019', '2018', '2017', '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007', '2006', '2005', '2004', '2003', '2002', '2001', '2000']
      },
      n: { tip: 'show first N results', options: ['N', '1', '3', '5', '10', '20'] },
      C: { tip: 'clear all filters', class: 'form red bold hidden', click: this.C },
    }
    return form
  }
  C = () => {
    this.form_data = this.setForm({ filter: '', mf: 'M/F', cat: 'Cat', year: 'Year', n: 'N' })
    this.refresh()
  }
  input = (e, o) => {
    this.form_data = this.getForm()
    this.refresh()
  }
  html = (n) => {
    if (n === 'results_all') return `<div id="results_all">${this.results_all()}</div>`
    else if (typeof n === 'string' && n.startsWith('results_')) return this.results_year(n.split('_')[1])
    else return html
  }
  own = (y, n) => {
    const u = nav._user, ns = u && u.ns, l = ns && ns[y], a = l ? l.includes(n + '') : false
    return a
  }
  link = (n, k) => {
    if (n === 'year') return { tip: `${k.replace(/_/g, " ")} all results`, click: this.year }
    else if (n === 'name') return { tip: `${k.replace(/_/g, " ")} all results`, click: this.name }
    else if (n === 'photos') {
      const [y, n] = k.split('_'), ps = nav.d.data.ps, yp = ps && ps[y], p = yp && yp[n],
        u = nav._user, o = this.own(y, n) || u.admin,
        r = {
          id: `TT_photos_${k}`, active: p.p, placement: 'auto', icon: 'photo', tip: `${p.p} public of ${p.t} photos`,
          ...(o ? { drag: `{Photos.${y}.${n}}` } : u && p.p ? { drag: `{Photos.${y}.${n}}` } : { popup: 'Switch' })
        }
      return r
    }
    //else if (['close', 'Pinner_Camera_Club'].indexOf(n) === -1) debug({ link: { n, param } })
  }
  ths = (n, p) => {
    if (n === 'results_year') {
      const year = p, th = ['Pos', 'Name', 'MF', 'Cat', 'Total', 'Swim', 'T1', 'Bike', 'T2', 'Run', 'Club'],
        cs = this.cols(year),
        ths = th.filter(x => cs[x] !== undefined)
      return ths
    } else debug({ ths: { n, p } })
  }
  trs = (n, p) => {
    if (n === 'results_year') {
      const year = p, th = ['Pos', 'Name', 'MF', 'Cat', 'Total', 'Swim', 'T1', 'Bike', 'T2', 'Run', 'Club'],
        cs = this.cols(year),
        ths = th.filter(x => cs[x] !== undefined),
        ns = ths.map(th => cs[th]),
        rs = this.filter(year),
        trs = rs.map(r => ns.map((n, i) => i === 1 ? `{link.name.${r[n].replace(/\s+/g, '_')}}` : r[n]))
      return trs
    } else debug({ trs: { n, p } })
  }
  toggle = (o) => {
    const { name, type, param } = o && o.attr(),
      f = this.form_data = this.getForm(form),
      clear = { filter: '', mf: 'M/F', cat: 'Cat', year: 'Year', n: 'N' },
      val = name === 'name' ? f['filter'] : f[name]
    return (param && val === param.replace(/_/g, " ")) ? clear[name] || '' : param.replace(/_/g, " ")
  }
  form_vals = () => {
    const f = this.form_data,
      C = { filter: '', mf: 'M/F', cat: 'Cat', year: 'Year', n: 'N' }
    let ret = {}
    Object.keys(C).forEach(k => ret[k] = (!f || (f[k] === C[k]) ? '' : f[k]))
    return ret
  }
  refresh = () => {
    const f = this.form_vals(),
      blank = Object.keys(f).filter(k => f[k] !== '').length,
      c = this.fe('C')
    c && c.classList[blank ? 'remove' : 'add']('hidden')
    this.reload('results_all')
  }
  year = (e, o) => {
    const f = this.form_data, year = f.year === o.param ? 'Year' : o.param
    this.form_data = this.setForm({ year })
    this.refresh()
  }
  name = (e, o) => {
    const { param } = o, n = _s(param, true), f = _s(this.form_data.filter, true)
    if (n !== f) this.form_data = this.setForm({ filter: _s(param, false) })
    else this.form_data = this.setForm({ filter: '' })
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
    return secs || ''
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
    const results = nav.d.data['results'], c = this.cols(yr),
      { year, cat, mf, filter, n } = this.form_vals()
    let ret = []
    for (var i = 1; i < results[yr].length; i++) {
      let r = results[yr][i]
      if (!r
        || r[c.Pos] === ''
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
        const ps = nav.d.data.ps, y = ps && ps[yr], nm = r[c['#']], p = y && y[nm]
        if (p) r[c.Pos] = `${_n} {link.photos.${yr}_${nm}}`
        rr = rr.map(x => x && x.length && x.includes(':') ? x.replace(/^0+:?0?/, '') : x || '')
        filtered.push(rr)
      }
    })
    return filtered
  }
  years = (years) => {
    const year = this.year || years[0]
    return `<select class="years">
          ${years.map(y => `<option ${y === year ? 'selected' : ''}>${y}</option>`).join('')}
        </select></div>`
  }
  cols(year) {
    const r = nav.d.data.results, c = {}
    r[year][0].forEach((n, i) => { c[n] = i })
    return c
  }
  results_year = (year) => {
    return `<div id="results_${year}"><h5>{link.year.${year}}</h5>{table.results_year.${year}}</div>`
  }
  results_all = () => {
    const r = nav.d.data.results, ps = nav.d.data.ps, years = r && Object.keys(r).reverse()
    let n = 0
    if (r && ps) return years.map(year => {
      let rows = n < 100 ? this.filter(year) : []
      n += rows.length
      return (rows.length > 0) ? `{div.results_${year}}` : ''
    }).join('')
    else return '<div id="loading">Loading...</div>'
  }
}

export default Results
