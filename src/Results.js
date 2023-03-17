import Html from './Html'
import results from './html/Results.html'
import css from './css/Results.css'
import rgz from './res/results.gz'
import np from './res/np.gz'
const debug = console.log.bind(console)

class Results extends Html {
  constructor() {
    super(results, css)
  }
  unzip_results() {
    unzip(rgz).then(r => this.results = r)
    uUnzip(np).then(r => this.np = r)
  }
  cnum = (a) => {
    const cs = { 'TS': 1, 'T1': 2, 'T2': 3, 'T3': 4, 'Y': 5 }
    let ret = cs[a[this.c.Cat]] ? cs[a[this.c.Cat]] : 6
    if (this.year < 2004 & ret < 5) ret = 4
    return ret
  }
  ts = (a) => {
    let hms = this.c[this.state.sort] ? a[this.c[this.state.sort]] : a[this.c.Total]
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
    const results = this.state.results, c = this.cols(year)
    let ret = []
    for (var i = 1; i < results[year].length; i++) {
      let r = results[year][i]
      if (!r
        || (this.state.year && this.state.year !== year)
        || (this.state.mf && this.state.mf !== r[c.MF])
        || (this.state.cat && this.state.cat.indexOf('*') === -1 && this.state.cat !== r[c.Cat] && this.state.cat !== 'Adult' && this.state.cat !== 'Junior')
        || (this.state.cat === 'T*' && r[c.Cat][0] !== 'T')
        || (this.state.cat === 'Y*' && r[c.Cat][0] !== 'Y')
        || (this.state.cat === 'S*' && r[c.Cat][0] !== 'S')
        || (this.state.cat === 'V*' && r[c.Cat][0] !== 'V')
        || (this.state.cat === 'Adult' && r[c.Cat][0] !== 'S' && r[c.Cat][0] !== 'V')
        || (this.state.cat === 'Junior' && (r[c.Cat][0] === 'S' || r[c.Cat][0] === 'V'))
      ) r = false // header row
      //ret=this.number(ret)
      if (r) ret.push(r)
    }
    this.year = year
    this.c = c // used by compare
    ret = ret.sort(this.compare)
    let n, last
    /*
    ret.forEach(r=>{
      if (this.cnum(r) !== last) n=1
      else n++
      if (r[c.Pos]!=='DNF') r[c.Pos]=n
      last=this.cnum(r)
    })
    */
    let filtered = []
    ret.forEach(r => {
      let rr = null
      if (this.cnum(r) !== last) n = 1
      else n++
      if (r[c.Pos] !== 'DNF') r[c.Pos] = n
      last = this.cnum(r)
      if (this.state.name === '' && this.state.year === '' && this.state.cat === '' && this.state.mf === '' && this.state.n === '') rr = r[c.Pos] * 1 === 1 ? r : null
      else if (this.state.name) {
        this.state.name.toLowerCase().split(',').forEach(n => {
          if (n.length > 0 && r[c.Name].toLowerCase().indexOf(n) !== -1) rr = r
          if (c.Club && n.length > 0 && r[c.Club].toLowerCase().indexOf(n) !== -1) rr = r
        })
      }
      else if (this.state.n) rr = r[c.Pos] * 1 <= this.state.n ? r : null
      else rr = r
      if (rr) filtered.push(rr)
    })
    return filtered
  }
  set = (x, e) => {
    let state = this.state
    state[x] = e.target ? e.target.value : e
    this.setState(state)
  }
  cols(year) {
    const r = this.state.results
    let c = {}, cn = 0
    r[year][0].forEach(n => { c[n] = cn++ })
    return c
  }
  photos = (year, num) => {
    const { np } = this.state
    // return (np && year === '2022' && np[num]) ? <i className="bi-image" onClick={() => this.props.photos(num)}></i> : null
  }
  render() {
    const { results, np } = this.state
    debug('Results', true)({ results, np })
    if (!results) return null
    let i = 0, n = 0
    /*
    return <div className="container">
      <form>
        <div className="form-group row" style={{ maxWidth: 900 }}>
          <Name nm={this.state.name} set={this.set} />
          <Year year={this.state.year} set={this.set} />
          <MF mf={this.state.mf} set={this.set} />
          <Cat cat={this.state.cat} set={this.set} />
          <N n={this.state.n} set={this.set} />
        </div>
      </form>
      {
        Object.keys(results).reverse().map(year => {
          let c = this.cols(year)
          let rows = n < 100 ? this.filter(year) : []
          //console.log('renderResults',year,Object.keys(het.results),rows)
          n += rows.length
          if (rows.length > 0) return <div key={i++}><h5><span className='link-primary uh' onClick={() => this.set('year', this.state.year === year ? '' : year)}>{year}</span></h5><table className="table table-bordered table-condensed table-striped w-auto">
            <thead><tr><th>Pos</th><th>Name</th><th>M/F</th><th>Cat</th>
              <TH k='Total' s={this.state.sort} set={(v) => this.setState({ sort: v })} />
              <TH k='Swim' s={this.state.sort} set={(v) => this.setState({ sort: v })} />
              {c.T1 ? <TH k='T1' s={this.state.sort} set={(v) => this.setState({ sort: v })} /> : null}
              <TH k='Bike' s={this.state.sort} set={(v) => this.setState({ sort: v })} />
              {c.T2 ? <TH k='T2' s={this.state.sort} set={(v) => this.setState({ sort: v })} /> : null}
              <TH k='Run' s={this.state.sort} set={(v) => this.setState({ sort: v })} />
              {c.Club ? <th>Club</th> : null}
            </tr></thead>
            <tbody>{
              rows.map(r => {
                return <tr key={i++}><td>{r[c.Pos]} {this.photos(year, r[c['#']])}</td><td>{r[c.Name]}</td><td>{r[c.MF]}</td><td>{r[c.Cat]}</td><td>{this.round(r[c.Total])}</td><td>{r[c.Swim]}</td>{c.T1 ? <td>{r[c.T1]}</td> : null}<td>{r[c.Bike]}</td>{c.T2 ? <td>{r[c.T2]}</td> : null}<td>{r[c.Run]}</td>{c.Club ? <td>{r[c.Club]}</td> : null}</tr>
              })
            }</tbody>
          </table></div>
          else return null
        })
      }
    </div>
    */
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
