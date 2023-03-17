import Html from './Html'
import results from './html/Results.html'
import css from './css/Results.css'
import rgz from './res/results.gz'
import npz from './res/np.gz'
import pako from 'pako'
import photo from './res/photo.svg'
const debug = console.log.bind(console)

function Unzip(file) {
  return new Promise((s, f) => {
    fetch(file)
      .then(r => {
        return r.text() // has had btoa to make into string - not encourgaed!!
      })
      .then(data => {
        s(JSON.parse(pako.inflate(atob(data), { to: 'string' })))
      })
      .catch(e => f(e))
  })
}

class Results extends Html {
  constructor() {
    super(results, css)
    Unzip(npz).then(np => this.np = np)
    Unzip(rgz).then(r => {
      this.r = r
      const root = this.shadowRoot, el = root.getElementById('results'),
        results = this.results()
      el.innerHTML = results
    })
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
  filter = (year) => {
    const results = this.r, c = this.cols(year)
    let ret = []
    for (var i = 1; i < results[year].length; i++) {
      let r = results[year][i]
      if (!r
        || (this.year && this.year !== year)
        || (this.mf && this.mf !== r[c.MF])
        || (this.cat && this.cat.indexOf('*') === -1 && this.cat !== r[c.Cat]
          && this.cat !== 'Adult' && this.cat !== 'Junior')
        || (this.cat === 'T*' && r[c.Cat][0] !== 'T')
        || (this.cat === 'Y*' && r[c.Cat][0] !== 'Y')
        || (this.cat === 'S*' && r[c.Cat][0] !== 'S')
        || (this.cat === 'V*' && r[c.Cat][0] !== 'V')
        || (this.cat === 'Adult' && r[c.Cat][0] !== 'S' && r[c.Cat][0] !== 'V')
        || (this.cat === 'Junior' && (r[c.Cat][0] === 'S' || r[c.Cat][0] === 'V'))
      ) r = false // header row
      //ret=this.number(ret)
      if (r) ret.push(r)
    }
    this.y = year
    this.c = c // used by compare
    ret = ret.sort(this.compare)
    let n, last, filtered = []
    ret.forEach(r => {
      let rr = null
      if (this.cnum(r) !== last) n = 1
      else n++
      if (r[c.Pos] !== 'DNF') r[c.Pos] = n
      last = this.cnum(r)
      if (!this.name && !this.year && !this.cat && !this.mf && !this.n) rr = r[c.Pos] * 1 === 1 ? r : null
      else if (this.name) {
        this.name.toLowerCase().split(',').forEach(n => {
          if (n.length > 0 && r[c.Name].toLowerCase().indexOf(n) !== -1) rr = r
          if (c.Club && n.length > 0 && r[c.Club].toLowerCase().indexOf(n) !== -1) rr = r
        })
      }
      else if (this.n) rr = r[c.Pos] * 1 <= this.n ? r : null
      else rr = r
      if (rr) {
        const photo = this.photos(year, r[c['#']])
        if (photo) r[c.Pos] = `${n} ${photo}`
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
  photos = (year, num) => {
    return (this.np && year === '2022' && this.np[num]) ? `<image class='photo' name="${num}" src="${photo}" width="20">` : null
  }
  results() {
    const th = ['Pos', 'Name', 'M/F', 'Cat', 'Total', 'Swim', 'T1', 'Bike', 'T2', 'Run', 'Club']
    let n = 0, ret = []
    Object.keys(this.r).reverse().map(year => {
      const cs = this.cols(year), ths = th.filter(x => cs[x] !== undefined), ns = ths.map(th => cs[th])
      let rows = n < 100 ? this.filter(year) : []
      n += rows.length
      if (rows.length > 0) ret.push(`<h5>${year}</h5><table name="${year}">
        <thead>${ths.map(h => `<th name="${h}">${h}</th>`).join('')}</thead>
        <tbody>${rows.map(row => `<tr>${ns.map(n => `<td>${row[n]}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>`)
      debug({ year, ths, ns, rows })
    })
    return ret.join('')
  }
}

class TH {
  render() {
    const k = this.props.k, s = this.props.s, set = this.props.set
    /*return s === k ? <th scope="col" width="80"><span className='link-primary uh' onClick={() => set(k)}>{k}&nbsp;<i className="bi-sort-down-alt"></i></span></th>
      : <th scope="col"><span className='link-primary uh' onClick={() => set(k)}>{k}</span></th>
  */
  }
}
class Name {
  render() {
    /*return (<div className="col-sm-4 col-xs-8">
      <input type="text" size="10" placeholder="Name, ..." value={this.props.nm} className="form-control" onChange={(e) => this.props.set('name', e)} />
    </div>)*/
  }
}

class MF {
  render() {
    return /*(<div className="col-sm-2 col-xs-4"><select className="form-select" value={this.props.mf} onChange={(e) => this.props.set('mf', e)}>
      <option value=''>M/F</option>
      <option value='M'>M</option>
      <option value='F'>F</option>
    </select></div>)*/
  }
}

class Cat {
  render() {
    const cats = ['Junior', 'TS', 'T1', 'T2', 'T3', 'Y', 'Adult', 'S*', 'SY', 'S1', 'S2', 'S3', 'S4', 'V*', 'V1', 'V2', 'V3', 'V4']
    /*return (<div className="col-sm-2 col-xs-4"><select className="form-select" value={this.props.cat} onChange={(e) => this.props.set('cat', e)}>
      <option value=''>Cat</option>
      {cats.map(c => { return <option key={c} value={c}>{c}</option> })}
    </select></div>)*/
  }
}

class Year {
  render() {
    const years = ['2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2017', '2018', '2019', '2022']
    /*return (<div className="col-sm-2 col-xs-4"><select className="form-select" value={this.props.year} onChange={(e) => this.props.set('year', e)}>
      <option value=''>Year</option>
      {years.reverse().map(y => { return <option key={y} value={y}>{y}</option> })}
    </select></div>)*/
  }
}

class N {
  render() {
    const n = [1, 3, 5, 10, 20]
    /*return (<div className="col-sm-2 col-xs-4"><select className="form-select" value={this.props.n} onChange={(e) => this.props.set('n', e)}>
      <option value=''>#</option>
      {n.map(n => { return <option key={n} value={n}>{n}</option> })}
    </select></div>)*/
  }
}

export default Results
