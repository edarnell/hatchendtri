import Html, { debug } from './Html'
import html from './html/Volunteer.html'
import vol_form from './html/volunteer_form.html'
import { ajax } from './ajax'
import { unzip } from './unzip'
import { Buffer } from 'buffer'

class Volunteer extends Html {
  constructor() {
    super()
    this.init({ id: 'volunteers', html })
    ajax({ req: 'volunteers' }).then(this.data)
  }
  data = (r) => {
    debug({ r })
    this.roles = unzip(r.roles.data)
    const vs = this.volunteers = unzip(r.volunteers.data)
    const v2023 = Buffer.from(r.v2023.data).toString()
    this.map = {}
    Object.keys(vs).forEach(v => {
      if (vs[v].email && v2023.indexOf(vs[v].email) > -1) vs[v].v2023 = true
      if (vs[v].adult) {
        if (this.map[vs[v].adult]) this.map[vs[v].adult].adult.push(v)
        else this.map[vs[v].adult] = { adult: [v], junior: [] }
      }
      if (vs[v].junior) {
        if (this.map[vs[v].junior]) this.map[vs[v].junior].junior.push(v)
        else this.map[vs[v].junior] = { adult: [], junior: [v] }
      }
    })
    debug({ v2023, roles: this.roles, volunteers: this.volunteers, map: this.map })
    this.render()
  }
  render = () => {
    this.replace({ id: 'vol_table', html: this.vols(), links: this.vol_links, parent: this.root })
  }
  vols = () => {
    this.vol_links = {} // clear event handlers
    return `<table>
    <tbody>${this.roles.sections.map(s => `<th>${s.name} ${this.name(s.lead)}</th><th>${s.start.adult}-${s.end.adult}</th><th>${s.start.junior}-${s.end.junior}</th></tr>
    ${s.roles.map(r => this.vol(s.name, r.role)).join('')}`).join('')}</tbody></table>`
    //${this.roles.map(r => `<tr><td>${r.name}</td><td>${r.role}</td><td>${r.qty}</td></tr>`).join('')}</table>`
  }
  sections = () => this.roles.sections.map(s => s.name)
  roles = (section) => this.roles.sections.find(s => s.name === section).roles.map(r => r.role)
  name = (id) => {
    if (this.volunteers[id]) {
      this.vol_links[`vol_${id}`] = { click: this.name_e, class: this.color(id), tip: "update volunteer" }
      return `{link.vol_${id}.${this.volunteers[id].name.replace(/ /g, '_')}}`
    }
    else return ''
  }
  role = (section, role, i) => {

  }
  name_e = (l) => {
    const nm = l.getAttribute('name'), vid = nm.split('_')[1], vol = this.volunteers[vid]
    debug({ nm, vid, name: vol.name })
    this.dragdiv(l, this.vol_form(vid))
  }
  color = (id) => this.volunteers[id].v2023 === true ? 'green' : this.volunteers[id].v2023 === false ? 'red' : 'grey'
  vol_form = (vid) => {
    const vol = this.volunteers[vid]
      , form = {
        _2023: {},
        adult: {},
        junior: {},
        name: { placeholder: 'name', required: true },
        email: { placeholder: 'email', type: 'email' },
        mobile: { placeholder: 'mobile', type: 'phone' },
        notes: { placeholder: 'notes', rows: 3, cols: 20 },
      }
    debug({ vol, roles: this.roles })
    const f = this.replace({ id: 'vol_form_' + vid, html: vol_form, form })
    this.setForm(vol, f.id)
    return f
  }
  vol = (section, role) => {
    const r = this.map[`${section} ${role}`]
    let ret = []
    if (r && r.adult) r.adult.forEach((id, i) => ret.push(`<tr><td>${this.role(section, role, i)}</td><td>${this.name(id)}</td><td>${r.junior && r.junior[i] && this.name(r.junior[i]) || ''}</tr>`))
    //debug({ role, ret })
    return ret.join('')
  }
  volunteer = (vid) => {
    return this.volunteers[vid].name
  }
}

/*
vols() {
  let rows = [], race = this.state.race, k = 0//,nv=-1
  het.roles.sections.forEach(s => {
    rows.push(<tr key={k++}><th>{s.name} ({s.start[race]}-{s.end[race]})</th><th>{s.lead > 0 ? "Lead" : ''}</th><th>{s.lead !== -1 && s.lead !== '0' ? het.vs[s.lead].name : ''}</th></tr>)
    s.roles.forEach(r => {
      let num = alloc[s.name + ' ' + r.role][race].length > r.qty[race].min ? alloc[s.name + ' ' + r.role][race].length : r.qty[race].min
      for (var i = 0; i < num; i++) {
        //console.log("i",s,r,i,num)
        let v = null
        let n = alloc[s.name + ' ' + r.role][race].length > i ? alloc[s.name + ' ' + r.role][race][i] : -1
        if (n !== -1) v = het.vs[n]
        let role = r.role
        if (r.notes) role = <span className="btn-link" onClick={e => this.showRole(e, r)}>{role}</span>
        rows.push(<tr key={k++}><td></td><td>{role}</td><td style={n > 0 ? { color: '#007ba7' } : null}>{v ? <span className='btn-link' onClick={() => this.setState({ vid: v.id, update: true })}>{v.name}</span> : ''}</td></tr>)
        //<VolunteerSelect race={race} vs={het.vs} set_volunteer={e=>this.setRole(e.target.value,race,role)}/>
      }
    })
  })
  let vol = null
  /*
  if (het.admin && !het.user)  {
    vol= (<div>
      <div className="form-group">
        <div className="col-md-2"><button onClick={()=>this.setState({vol:true})} type="button" className="btn btn-primary form-control">Volunteer</button></div>
      </div>
      <div className="form-group">
        <label className="col-md-1 control-label">Login:</label>
        <div className="col-md-3"><VolunteerSelect vid={this.state.id} set_volunteer={(v)=>this.setState({id:v})} vs={het.vs}/></div>
        <label className={"col-md-1 control-label"+(this.props.failed?" red":'')}>Code:</label><div className="col-md-2"><input value={this.state.code} onChange={e=>this.setState({code: e.target.value})} className={"form-control"} name="code" size="5" type="password"/></div>
        <div className="col-md-1"><button type="button" onClick={this.login} className="btn btn-primary form-control"><i className="fa fa-btn fa-sign-in"></i></button></div>
      </div>
    </div>)
  }
  else if (het.user && het.user.admin)
  
  vol = (<div className="form-group">
    <div className="col-md-3"><input onChange={(e) => this.setState({ name: e.target.value })} type="text" className="form-control" id="Name" value={this.state.name} placeholder="Name" /></div>
    {het.admin ? <div><div className="col-md-3"><VolunteerSelect set_volunteer={(vid) => this.setState({ vid: vid })} filter={this.state.name} vid={this.state.volunteer} vs={het.vs} /></div>
      <div className="col-md-2"><button onClick={() => this.setState({ vol: true })} type="button" className="btn btn-primary form-control">Add Volunteer</button></div>
      <div className="col-md-2"><button type="button" onClick={() => this.setState({ roles: true })} className="btn btn-default form-control">Edit Roles</button></div>
      <div className="col-md-2"><button type="button" onClick={() => this.setState({ emails: true })} className="btn btn-default form-control">Emails</button></div>
    </div>
      : this.state.name === '?' ? <div className="col-md-2"><input onChange={this.code} autoFocus={true} type="password" className="form-control" id="Code" placeholder="Code" /></div> : null}
  </div>)
  
      {
        vol=(<div className="form-group">
        <label className="col-md-2 control-label">{this.props.user.name}</label>
        <div className="col-md-2"><button type="button" onClick={()=>this.setState({update:true})} className="btn btn-primary form-control">Update Details</button></div>
        <div className="col-md-2"><button onClick={()=>this.setState({vol:true})} type="button" className="btn btn-primary form-control">Add Volunteer</button></div>
        </div>)
      }
      
  if (het.admin && this.state.csv) return <CSV close={() => this.setState({ csv: null })} data={Object.keys(vs).map(v => vs[v])} /> // .filter(v=>{return v.junior!=='none'||v.adult!=='none'})
  else return (<div className='container'>
    <h1>Hatch End Triathlon Volunteers</h1>
    {this.state.vid && het.admin ? <Details alloc={alloc} vid={this.state.vid} close={() => this.setState({ vid: null })} /> : null}
    {this.state.roles ? <Roles close={() => this.setState({ roles: false })} /> : null}
    {this.state.vol ? <Volunteer close={() => this.setState({ vol: false })} /> : null}
    {this.state.emails ? <Emails close={() => this.setState({ emails: false })} /> : null}
    <Role role={this.state.role} close={() => this.setState({ role: null })} />
    <div>
      <form className="form-horizontal" onSubmit={this.login}>
        {vol}
        {disp ? <div>{disp}<br /></div> : null}
        <div className="form-group">
          <label className="col-md-1 control-label">Race:</label><div className="col-md-2"><RaceSelect set_race={(r) => this.setState({ race: r })} /></div>
        </div>
      </form>
      <table className="table table-bordered table-condensed table-striped width-auto">
        <thead><tr><th>Section</th><th>Role</th><th>Name</th></tr></thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  </div>)
}*/
/*
class Role extends Component {
  render() {
    if (!this.props.role || !this.props.role.r.notes) return null
    else return <Modal x={this.props.role.x} y={this.props.role.y} title={this.props.role.r.role} body={this.props.role.r.notes} close={this.props.close} />
  }
}

class Emails extends Component {
  state = {}
  section = (e) => {
    this.setState({ sid: e.target.value })
  }
  render() {
    if (het.admin) {
      const roles = het.roles, section = roles.sections[this.state.sid], leads = {}
      let emails = {}
      // set ids by select
      roles.sections.forEach(s => {
        const v = s.lead && het.vs[s.lead]
        if (v && v.email) leads[v.email] = v.email
      })
      Object.keys(het.vs).forEach(id => {
        const v = het.vs[id]
        if (this.state.sid === 'leads') emails = leads
        else if (section) {
          if (v.email && ((v.junior && v.junior.startsWith(section.name)) || (v.adult && v.adult.startsWith(section.name)))) emails[v.email] = v.email
        }
        else if (v.email && ((v.junior && v.junior !== 'none') || (v.adult && v.adult !== 'none'))) emails[v.email] = v.email
        if (!this.state.sid) Object.keys(leads).forEach(email => emails[email] = email)
      })
      return <Modal title='Emails - contact using bcc'
        body={<div>
          <EmailSelect sid={this.state.sid} onChange={this.section} />
          {Object.keys(emails).join('; ')}
        </div>}
        close={this.props.close} />
    }
  }
}

class EmailSelect extends Component {
  render() {
    let sections = [<option key='all' value=''>All</option>,
    <option key='leads' value='leads'>Leads</option>]
    het.roles.sections.forEach(s => { sections.push(<option key={s.id} value={s.id}>{s.name}</option>) })
    return (<select className="form-control" value={this.props.sid ? this.props.sid : 'select'} onChange={this.props.onChange}>{sections}</select>)
  }
}

class Volunteer extends Component {
  state = { v: { name: '', email: '' } }
  //componentWillReceiveProps() { this.setState({ v: { name: '', email: '' } }) }
  update = (what, value) => {
    let v = this.state.v
    v[what] = value // don't store any
    this.setState({ v: v })
  }
  render() {
    let form = (<div><form onSubmit={() => save_vol(this.state.v).then(this.props.close())} className="form-horizontal">
      <div className="form-group">
        <label className="col-md-3 control-label" htmlFor="Name">Name:</label><div className="col-md-8"><input onChange={(e) => this.update('name', e.target.value)} type="text" className="form-control" id="Name" value={this.state.v.name} placeholder="Name" /></div>
      </div>
      <div className="form-group">
        <label className="col-md-3 control-label" htmlFor="Email">Email:</label><div className="col-md-8"><input onChange={(e) => this.update('email', e.target.value)} type="email" className="form-control" id="Email" value={this.state.v.email} placeholder="Email" /></div>
      </div>
    </form></div>)
    return <Modal save={() => { save_vol(this.state.v).then(this.props.close()) }} title="Volunteer" body={form} close={this.props.close} />
  }
}

class Details extends Component {
  state = { v: copy(het.vs[this.props.vid]) }
  update = (what, value) => {
    let v = this.state.v
    if ((what !== 'adult' && what !== 'junior') || value !== 'any') v[what] = value // don't store any
    else if (v[what]) delete (v[what])
    this.setState({ v: v })
  }
  save = () => save_vol(this.state.v).then(this.props.close())
  render() {
    console.log("Details", this.props.vid)
    let admin_extra = null
    if (het.admin) {
      admin_extra = (<div>
        <div className="form-group">
          <label className="col-md-3 control-label" htmlFor="Adult">Adult Role:</label><div className="col-md-6"><RoleSelect alloc={this.props.alloc} onChange={(e) => this.update('adult', e.target.value)} roles={het.roles} v={this.state.v} race="adult" /></div>
        </div>
        <div className="form-group">
          <label className="col-md-3 control-label" htmlFor="Junior">Junior role:</label><div className="col-md-6"><RoleSelect alloc={this.props.alloc} onChange={(e) => this.update('junior', e.target.value)} roles={het.roles} v={this.state.v} race="junior" /></div>
        </div>
        <div className="form-group">
          <label className="col-md-3 control-label" htmlFor="Admin">Admin:</label><div className="col-md-1"><input onChange={(e) => this.update('admin', !this.state.v.admin)} type="checkbox" className="form-control" id="WhatsApp" checked={ifset(this.state.v.admin, false)} /></div>
        </div>
      </div>)
    }
    let form = (<div><form onSubmit={this.save} className="form-horizontal">
      {admin_extra}
      <div className="form-group">
        <label className="col-md-3 control-label" htmlFor="Name">Name:</label><div className="col-md-8"><input onChange={(e) => this.update('name', e.target.value)} type="text" className="form-control" id="Name" value={this.state.v.name} placeholder="Name" /></div>
      </div>
      <div className="form-group">
        <label className="col-md-3 control-label" htmlFor="Email">Email:</label><div className="col-md-8"><input onChange={(e) => this.update('email', e.target.value)} type="email" className="form-control" id="Email" value={this.state.v.email} placeholder="Email" /></div>
      </div>
      <div className="form-group">
        <label className="col-md-3 control-label" htmlFor="Mobile">Mobile:</label><div className="col-md-4"><input onChange={(e) => this.update('mobile', e.target.value)} type="tel" className="form-control" id="Mobile" value={ifset(this.state.v.mobile)} placeholder="Mobile" /></div>
        <label className="col-md-3 control-label" htmlFor="WhatsApp"><span><i className="fa fa-whatsapp" style={{ fontSize: 'large', color: 'limegreen' }}></i>&nbsp;WhatsApp</span></label><div className="col-md-1"><input onChange={(e) => this.update('whatsapp', !this.state.v.whatsapp)} type="checkbox" className="form-control" id="WhatsApp" checked={ifset(this.state.v.whatsapp, false)} /></div>
      </div>
      <div className="form-group">
        <label className="col-md-3 control-label" htmlFor="Notes">Notes:</label><div className="col-md-8"><textarea onChange={(e) => this.update('notes', e.target.value)} rows="4" className="form-control" value={ifset(this.state.v.notes)} /></div>
      </div>
    </form></div>)
    return <Modal del={this.state.v.name ? false : true} save={this.save} title="Update Details" body={form} close={this.props.close} />
  }
}

class Roles extends Component {
  state = { roles: copy(het.roles), section: null, role: null, add: false }
  addRole = () => {
    const roles = this.state.roles,
      section = roles.sections[this.state.section.id],
      r = { role: '', id: section.roles.length, qty: { adult: { min: 0, max: 0 }, junior: { min: 0, max: 0 } }, section: this.state.section.id }
    section.roles.push(r)
    const role = section.roles[r.id]
    debug('addRole')({ r, roles, role })
    this.setState({ roles, role })
  }
  deleteRole = () => {
    let roles = this.state.roles
    roles.sections[this.state.section.id].roles.splice(this.state.role.id, 1)
    this.setState({ roles: roles, role: null })
  }
  change = (val, type, f1, f2, f3) => {
    let section = this.state.section
    debug('change')({ val, type, f1, f2, f3 })
    if (type === 's') {
      if (f3) section[f1][f2][f3] = val
      else if (f2) section[f1][f2] = val
      else section[f1] = val
    } else {
      let role = this.state.role
      if (f3) {
        role[f1][f2][f3] = val
        if (f3 === 'min' && role[f1][f2]['max'] * 1 < val * 1) role[f1][f2]['max'] = val
        else if (f3 === 'max' && role[f1][f2]['min'] * 1 > val * 1) role[f1][f2]['min'] = val
      }
      else if (f2) role[f1][f2] = val
      else role[f1] = val
    }
    this.setState({ section: section })
  }
  save = () => {
    const roles = this.state.roles
    ajax({ req: 'save', data: { roles: zip(roles) } }).then(r => {
      if (r.error) debug("error")({ r })
      else {
        het.roles = roles
        this.props.close()
      }
    })
  }
  render() {
    let roles = this.state.section ? (<div className="form-group">
      <label className="col-md-3 control-label" htmlFor="roles">Role:</label><div className="col-md-6"><RolesSelect section={this.state.section} role={this.state.role} onChange={(e) => this.setState({ role: this.state.section.roles[e.target.value], add: false })} roles={this.state.role} /></div>
      <div className="col-md-2">{this.state.role ? <button type="button" onClick={this.deleteRole} className="btn btn-default form-control">Delete</button> : <button type="button" onClick={this.addRole} className="btn btn-default form-control">Add</button>}</div>
    </div>) : null
    let section = this.state.section ? <div>
      <div className="form-group">
        <label className="col-md-3 control-label">Lead:</label>
        <div className="col-md-6"><VolunteerSelect vid={this.state.section.lead} set_volunteer={(v) => this.change(v, 's', 'lead')} vs={this.props.vs} /></div>
      </div>
      <div className="form-group">
        <label className="col-md-3 control-label">Adult Start/End:</label>
        <div className="col-md-3"><input value={this.state.section.start.adult} onChange={(e) => this.change(e.target.value, 's', 'start', 'adult')} className="form-control" /></div>
        <div className="col-md-3"><input value={this.state.section.end.adult} onChange={(e) => this.change(e.target.value, 's', 'end', 'adult')} className="form-control" /></div>
      </div>
      <div className="form-group">
        <label className="col-md-3 control-label">Junior Start/End:</label>
        <div className="col-md-3"><input value={ifset(this.state.section.start.junior)} onChange={(e) => this.change(e.target.value, 's', 'start', 'junior')} className="form-control" /></div>
        <div className="col-md-3"><input value={ifset(this.state.section.end.junior)} onChange={(e) => this.change(e.target.value, 's', 'end', 'junior')} className="form-control" /></div>
      </div>
    </div> : null
    let role = this.state.role ? <div>
      <div className="form-group">
        <label className="col-md-3 control-label">Name:</label>
        <div className="col-md-6"><input value={this.state.role.role} onChange={(e) => this.change(e.target.value, 'r', 'role')} className="form-control" /></div>
      </div>
      <div className="form-group">
        <label className="col-md-3 control-label">Adult Min/Max:</label>
        <div className="col-md-2"><input type='number' value={this.state.role.qty.adult.min} onChange={(e) => this.change(e.target.value, 'r', 'qty', 'adult', 'min')} className="form-control" /></div>
        <div className="col-md-2"><input type='number' value={this.state.role.qty.adult.max} onChange={(e) => this.change(e.target.value, 'r', 'qty', 'adult', 'max')} className="form-control" /></div>
      </div>
      <div className="form-group">
        <label className="col-md-3 control-label">Junior Min/Max:</label>
        <div className="col-md-2"><input type='number' value={this.state.role.qty.junior.min} onChange={(e) => this.change(e.target.value, 'r', 'qty', 'junior', 'min')} className="form-control" /></div>
        <div className="col-md-2"><input type='number' value={this.state.role.qty.junior.max} onChange={(e) => this.change(e.target.value, 'r', 'qty', 'junior', 'max')} className="form-control" /></div>
      </div>
      <div className="form-group">
        <label className="col-md-3 control-label" htmlFor="Notes">Notes:</label><div className="col-md-8"><textarea onChange={e => this.change(e.target.value, 'r', 'notes')} rows="4" className="form-control" value={ifset(this.state.role.notes)} /></div>
      </div>
    </div> : null

    let form = (<div><form onSubmit={this.save} className="form-horizontal">
      <div className="form-group">
        <label className="col-md-3 control-label" htmlFor="roles">Section:</label><div className="col-md-6"><SectionsSelect section={this.state.section} onChange={(e) => this.setState({ section: this.state.roles.sections[e.target.value], role: null, addRole: false })} roles={this.state.roles} /></div>
      </div>
      {section}
      {roles}{role}</form></div>)
    return <Modal save={this.save} title="Edit Roles" body={form} close={this.props.close} />
  }
}



class RaceSelect extends Component {
  render() {
    return (<select className={"form-control"} value={this.props.race} onChange={(e) => this.props.set_race(e.target.value)}>
      <option value='adult'>Adult</option>
      <option value='junior'>Junior</option>
    </select>)
  }
}


class VolunteerSelect extends Component {
  render() {
    //console.log("VolunteerSelect",this.props.vs)
    let options = [<option key={0} value={0}>name</option>]
    Object.keys(het.vs).map(id => { return het.vs[id] }).filter(v => { return !this.props.filter || v.name.toLowerCase().indexOf(this.props.filter.toLowerCase()) !== -1 }).sort((a, b) => { return a.name.localeCompare(b.name) }).forEach((v) => {
      options.push(<option key={v.id} value={v.id}>{v.name}</option>)
    })
    return (<select className={"form-control"} value={this.props.vid ? this.props.vid : 0} onChange={(e) => this.props.set_volunteer(e.target.value)}>{options}</select>)
  }
  // .filter(v=>{return !isset(v[this.props.race])})
}

class RoleSelect extends Component {
  render() {
    //console.log("RoleSelect",this.props)
    let v = this.props.v
    let role = v[this.props.race] ? v[this.props.race] : 'any'
    let options = [<option key={0} value={'any'}>any</option>, <option key={-1} value={'none'}>none</option>]
    this.props.roles.sections.forEach(s => {
      s.roles.forEach(r => {
        if (this.props.alloc[s.name + ' ' + r.role][this.props.race].length < r.qty[this.props.race].max) options.push(<option key={s.id + '_' + r.id}>{s.name} {r.role}</option>)
        else options.push(<option className="green" key={s.id + '_' + r.id}>{s.name} {r.role}</option>)
      })
    })
    return (<select className={"form-control"} value={role} onChange={this.props.onChange}>{options}</select>)
  }
}

class SectionsSelect extends Component {
  render() {
    let sections = [<option key='select'>select</option>]
    het.roles.sections.forEach(s => { sections.push(<option key={s.id} value={s.id}>{s.name}</option>) })
    return (<select className="form-control" value={this.props.section ? this.props.section.id : 'select'} onChange={this.props.onChange}>{sections}</select>)
  }
}

class RolesSelect extends Component {
  render() {
    //console.log("RolesSelect",this.props.section.roles)
    let roles = [<option key='select'>select</option>]
    this.props.section.roles.forEach(r => { roles.push(<option key={r.id} value={r.id}>{r.role}</option>) })
    return (<select className="form-control" value={this.props.role ? this.props.role.id : 'select'} onChange={this.props.onChange}>{roles}</select>)
  }
}
*/

export default Volunteer
