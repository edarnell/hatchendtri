import Html, { debug } from './Html'
import html from './html/Volunteer.html'
import vol_card from './html/volunteer_form.html'
import { ajax } from './ajax'
import { unzip } from './unzip'
import { Buffer } from 'buffer'

const form = { // section and options populated on load
  filter: { placeholder: 'name or email', width: '50rem' },
  section: { options: ['Section'] },
  role: { options: ['Role'] },
}

class Volunteer extends Html {
  constructor() {
    super()
  }
  connectedCallback() {
    if (!this.volunteers) ajax({ req: 'volunteers' }).then(this.data)
    else this.innerHTML = this.render(html)
  }
  disconnectedCallback() {
    this.innerHTML = ''
  }
  html = (o) => {
    const { name, param } = o.attr()
    if (name === 'vol_tables') {
      this.vt = o
      return this.roles.sections.map((s, i) => `{table.section.${i}}`).join('')
    }
    else if (name.startsWith('vol_')) return vol_card
    else debug({ html: this.debug(), o: o.debug() })
  }
  form = (o) => {
    const { name, param } = o.attr()
    if (name === 'role') this._role = o
    if (name === 'filter') this._filter = o
    if (form[name]) return form[name]
  }
  popup = (o) => {
    return { html: vol_card, click: true }
  }
  link = (o) => {
    const { name, param } = o.attr(), id = name.split('_')[1], vol = this.volunteers[id]
    if (name === 'update') return { class: 'hidden', f: () => { } }
    else if (name === 'close') return { class: 'close', tip: 'save and close', click: true }
    else if (name === 'C') return { class: 'hidden form red bold', tip: 'clear all filters' }
    if (!vol) debug({ link: this.debug() })
    else return { click: true, tip: 'Click to edit volunteer', class: this.color(id) }
  }
  ths = (o) => {
    const { name, param } = o.attr(),
      s = this.roles.sections[param]
    return [s.name, `${s.start.adult} - ${s.end.adult}`, `${s.start.junior} - ${s.end.junior}`]
  }
  trs = (o) => {
    const { name, param } = o.attr(),
      s = this.roles.sections[param]
    let ret = this.lead(s)
    s.roles.filter(r => this.role_filter(r, s)).forEach(r => this.tr(s.name, r.role, ret))
    return ret
  }
  role_filter = (r, s) => {
    const { section, role } = this.form_data || {}
    if (section && section !== 'Section' && section !== s.name) return false
    if (!role || role === 'Role') return true
    else return r.role === role
  }
  lead = (s) => {
    const { section, role } = this.form_data || {}
    if (section && section !== 'Section' && section !== s.name) return []
    const fm = this.form_data, f = fm && fm.filter, fl = f && f.toLowerCase(),
      v = this.volunteers[s.lead], n = v && v.name, nl = n && n.toLowerCase()
    if ((!role || role === 'Lead') && this.lead_filter(s.lead)) return [['Lead', this.name(s.lead), this.name(s.lead)]]
    else return []
  }
  lead_filter = (id) => {
    const fm = this.form_data, f = fm && fm.filter, fl = f && f.toLowerCase(),
      v = this.volunteers[id], n = v && v.name, nl = n && n.toLowerCase()
    return (!fl || (nl && nl.indexOf(fl) !== -1))
  }
  name_filter = (r, i) => {
    const fm = this.form_data, f = fm && fm.filter, fl = f && f.toLowerCase(),
      a = this.volunteers[r.adult[i]], j = this.volunteers[r.junior[i]]
    return (!fl ||
      (a && a.name.toLowerCase().indexOf(fl) !== -1) ||
      (j && j.name.toLowerCase().indexOf(fl) !== -1))
  }

  tr = (section, role, ret) => {
    const r = this.map[`${section} ${role}`]
    if (r && r.adult) r.adult.forEach((id, i) => {
      if (this.name_filter(r, i))
        ret.push([role,
          this.name(id),
          `${r.junior && r.junior[i] && this.name(r.junior[i]) || ''}`])
    })
  }
  update = (e, o) => {
    const { name, param } = o.attr()
    if (name === 'C') this.setForm({ section: 'Section', role: 'Role' }, form)
    if (name.startsWith('vol_')) {
      //debug({ update: this.debug(), name, param })
      this.admin = true
      if (this.admin) this.dragdiv(o)
      else this.setForm({ filter: param.replace(/_/g, ' ') }, form)
    }
    this.form_data = this.getForm(form)
    const { role, section } = this.form_data
    const c = this.querySelector(`button[name=c]`)
    c.classList[(role !== 'Role' || section !== 'Section') ? 'remove' : 'add']('hidden')
    if (name === 'section') this._roles()
    this._role.setAttribute('param', 'update')
    this.vt.setAttribute('param', 'update')
  }
  data = (r) => {
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
    const sections = this.roles.sections.map(s => s.name)
    form.section.options = sections
    form.section.options.unshift('Section')
    this._roles()
    this.innerHTML = this.render(html)
  }
  sections = () => {
    const { section, role } = this.form_data || {}
    if (!section || section === 'Section') return this.roles.sections
    else return this.roles.sections.filter(s => s.name === section)
  }
  _roles = () => {
    const roles = this.roles.sections.map(s => s.roles.filter(r => this.role_filter(r, s)).map(r => r.role)).flat()
    form.role.options = roles
    form.role.options.unshift('Role', 'Lead')
  }
  name = (id) => {
    if (this.volunteers[id]) {
      return `{popup.vol_${id}.${this.volunteers[id].name.replace(/ /g, '_')}}`
    }
    else return ''
  }
  name_e = (l) => {
    const nm = l.getAttribute('name'), vid = nm.split('_')[1], vol = this.volunteers[vid]
    debug({ nm, vid, name: vol.name })
    this.dragdiv(l, this.vol_form(vid))
  }
  color = (id) => {
    const vol = this.volunteers[id]
    if (!vol) debug({ id, volunteers: this.volunteers })
    else return vol.v2023 === true ? 'green' : vol.v2023 === false ? 'red' : 'grey'
  }
}

export default Volunteer
