import React, {Component} from 'react'
import {ajax} from './ajax'
import {isset} from './utils'

function parseCSV(csv,ret,cat)
{
  let rows=csv.split(/\r\n|\n/).map(l=>{return l.replace(/"([^,]*), ([^,]*)"/,"$2 $1").replace(/"/g,'').split(',')})
  let headings=rows[0]
  for (var i=0;i<headings.length;i++) {
    if (i!==0 && headings[i]==='Pos') headings[i]='Pos '+headings[i-1]
    if (headings[i]==='Position') headings[i]='Pos'
    if (headings[i]==='Athlete Name') headings[i]='Name'
    if (headings[i]==='Cycle') headings[i]='Bike'
    if (headings[i]==='Gun Time' || headings[i]==='Time' ) headings[i]='Total'
    if (headings[i]==='Bib #' || headings[i]==='Race No') headings[i]='Bib'
    if (headings[i]==='Category') headings[i]='Cat'
    //let cat=t1?r.Gender[0].toUpperCase()+r.Category:r.Cat
    //if (cat.indexOf('-')===-1) cat=cat.substr(0,3)+'-'+cat.substr(3,2)
  }
  if (!isset(ret)) ret=[]
  rows.shift()
  rows.forEach(r=>{
    let row={}
    // normalise data here
    if (r.length===headings.length && r[0]*1>0) {
      for (var c=0;c<r.length;c++) row[headings[c]]=r[c]
      if (!isset(row['Cat']) || row['Cat']==='') {
        const map={TS:'TS Start',T1:'TS 1',T2:'TS 2',T3:'TS 3','Y.':'Youths'}
        row.Cat=map[cat]
      }
      else if (row.Cat==='Tristars Start') row.Cat='TS Start'
      else if (row.Cat==='Tristars 1') row.Cat='TS 1'
      else if (row.Cat==='Tristars 2') row.Cat='TS 2'
      else if (row.Cat==='Tristars 3') row.Cat='TS 3'
      else if (row.Cat==='YOU') row.Cat='Youths'
      else {
        if ('MFTY'.indexOf(row['Cat'][0]) === -1) row.Cat=row.Gender[0].toUpperCase()+row.Cat
        if ('MF'.indexOf(row['Cat'][0]) !== -1 && row.Cat.indexOf('-')===-1 && row.Cat.indexOf('+')===-1) row.Cat=row.Cat.substr(0,3)+'-'+row.Cat.substr(3,2)
      }
      if (row.Club === 'NULL') row.Club = ''
      ret.push(row)
    }
  })
  return ret
}

class Results extends Component {
  state={results:null,name:''}
  processResults(csvs) {
    let ret = {}
     Object.keys(csvs).forEach(c=>{ret[c.substr(11,4)]=parseCSV(csvs[c],ret[c.substr(11,4)],c.substr(23,2))})
     //console.log("csvs",ret)
    return ret
  }
  filter(r) {
    if (!isNaN(this.state.name) && this.state.name>2000 && this.state.name<2020) return true
    let ret = false
    if (this.state.name === '') ret=true
    else {
      this.state.name.toLowerCase().split('|').forEach(n=>{
        if (!isNaN(n)) ret=ret||n*1===r.Pos*1
        else {
          ret=ret||(n.length>0&&r.Name.toLowerCase().indexOf(n)!==-1)
          if (isset(r.Club)) ret=ret||(n.length>0&&r.Club.toLowerCase().indexOf(n)!==-1)
          if (isset(r.Cat)) ret=ret||(n.length>0&&r.Cat.toLowerCase().indexOf(n)!==-1)
        }
      })
    }
    return ret
  }
  render() {
    if (this.state.results === null) {
      if (this.props.csrf !== null) ajax(resp=>this.setState({results:this.processResults(resp.results)}),{results:true})
      return null
    }
    let i=0;
    return (<div>
      <form className="form-horizontal" onSubmit={this.login}>
      <div className="form-group">
      <label className="col-sm-2 control-label">Filter:</label>
      <div className="col-sm-3"><input type="text" size="10" placeholder="Name|Club|Cat|Pos|Year|..." className="form-control" onChange={e=>this.setState({name:e.target.value})}/></div>
      </div>
      </form>
      {
        Object.keys(this.state.results).reverse().map(year=>{
        let t1=isset(this.state.results[year][0].T1)
        let pos=isset(this.state.results[year][0]['Pos Swim'])
        if (!isNaN(this.state.name) && this.state.name>2000 && this.state.name<2020 && year !== this.state.name) return null
        let rows=i<100?this.state.results[year].filter(r=>this.filter(r)):[]
        if (rows.length > 0) return <div key={i++}><h3>{year}</h3><table className="table table-bordered table-condensed table-striped width-auto">
                <thead><tr><th>Pos</th><th>Name</th><th>Club</th><th>Cat</th><th>Swim</th>{t1?<th>T1</th>:null}{pos?<th>Pos</th>:null}<th>Bike</th>{t1?<th>T2</th>:null}{pos?<th>Pos</th>:null}<th>Run</th>{pos?<th>Pos</th>:null}<th>Total</th></tr></thead>
                <tbody>{
                    rows.map(r=>{
                      return <tr key={i++}><td>{r.Pos}</td><td>{r.Name}</td><td>{r.Club}</td><td>{r.Cat}</td><td>{r.Swim}</td>{t1?<td>{r.T1}</td>:null}{pos?<td>{r['Pos Swim']}</td>:null}<td>{r.Bike}</td>{t1?<td>{r.T2}</td>:null}{pos?<td>{r['Pos Bike']}</td>:null}<td>{r.Run}</td>{pos?<td>{r['Pos Run']}</td>:null}<td>{r.Total}</td></tr>
                    })
                  }</tbody>
            </table></div>
        else return null
        })
      }
      </div>)
      }
}

export default Results
