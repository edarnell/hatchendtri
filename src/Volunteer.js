import Html, { debug, page, _s } from './Html'
import html from './html/Volunteer.html'
import { sections, section, roles, selectSection, selectRole, firstLast } from './roles'

const form = { // section and options populated on load
  filter: { placeholder: 'name filter', width: '50rem' },
  C: { class: 'hidden form red bold', tip: 'clear name', submit: true },
  R: { class: 'hidden form red bold', tip: 'clear selection', submit: true },
  new: { class: 'hidden form', tip: 'add new volunteer', submit: true },
  section: { class: "form", options: ['Section'].concat(sections) },
  role: { class: "form", options: ['Role'].concat(roles()) },
  nr: { class: "form", options: ['Roles', 'Names'] }
}

class Volunteer extends Html {
  constructor() {
    super()
    this.data = 'volunteers'
  }
  link = (o) => {
    const { name, param } = o.attr()
    if (name === 'id') return {
      tip: () => (this._2023 ? `${this.rows.length} rows show all` : `${this.rows.length} rows filter 2023`),
      click: () => {
        this._2023 = !this._2023
        this._nr.setAttribute('param', 'update')
      }
    }
    else if (name.startsWith('s_')) return { tip: 'role notes to come in v2.1', popup: `{vol.${name}}` }
    const id = name.substring(1), vol = page.v2023[id] || page.volunteers[id]
    if (vol) return { tip: this.tip, theme: 'light', class: this.color(id), popup: `{vol.${name}}` }
  }
  html = (o) => {
    const p = o && o.attr(), name = p && p.name
    if (!o) return html
    else if (name === 'nr') {
      const f = this.form_data, nr = (f && f.nr) || 'Roles'
      this._nr = o
      return nr === 'Roles' ? '<form>{select.section} {select.role} {button.R.C}</form> {div.roles}'
        : '{div.vD}'
    }
    else if (name === 'vD') {
      page._update = o
      return '{table.vT}'
    }
    else if (name === 'roles') {
      page._update = o
      return sections.map((s, i) => `{table.section${i}.${_s(s)}}`).join('')
    }
  }
  ths = (o) => {
    const { name, param } = o.attr()
    if (name === 'vT') return ['{link.id._2023}', 'First', 'Last', 'Adult', 'Junior']
    else if (name.startsWith('section')) {
      const sn = _s(param, false), s = section[sn]
      return [s.name, `${s.start.adult} - ${s.end.adult}`, `${s.start.junior} - ${s.end.junior}`]
    }
  }
  trs = (o) => {
    const { name, param } = o.attr()
    if (name === 'vT') {
      const ids = Object.keys(page.volunteers).filter(this.filter),
        rows = this.rows = ids.map(id => this.tr(id)).sort((a, b) => a[2].localeCompare(b[2]))
      return rows
    }
    else if (name.startsWith('section')) {
      const s = _s(param, false), f = this.form_data, sf = f && f.section
      if (sf && sf !== 'Section' && sf !== s) return []
      else return this.role_rows(s)
    }
  }
  tr = (id) => {
    const v = page.v2023[id] || page.volunteers[id], { name, email } = v, y = page.emails[email],
      c = this.years(v, y, id), n = this.roles(id).length,
      l = page.v2023[id] ? v.v2023 ? '✓' : '✗' : n ? `_${n}` : '?',
      a = page.v2023[id] && page.v2023[id].arole ? page.v2023[id].asection + ' ' + page.v2023[id].arole : '',
      j = page.v2023[id] && page.v2023[id].jrole ? page.v2023[id].jsection + ' ' + page.v2023[id].jrole : ''
    return [`{link._${id}.${l}}`, `{link._${id}.${_s(c.first)}}`, c.last, a, j]
  }
  sr = (id, s, r) => {
    const v = page.v2023[id], { asection, arole, jsection, jrole } = v
    let n = 0
    n += (asection === s && arole === r) ? 2 : 0
    n += (jsection === s && jrole === r) ? 1 : 0
    return n
  }
  vs = (s, r) => {
    const ks = Object.keys(page.v2023).map(id => { return { id, n: this.sr(id, s, r) } }),
      vs = ks.filter(k => k.n).sort((a, b) => b.n - a.n)
    return vs
  }
  fill = (v, r, s) => {
    const so = section[s], vs = page.v2023,
      amin = so.role[r].qty.adult.min, amax = so.role[r].qty.adult.max,
      jmin = so.role[r].qty.junior.min, jmax = so.role[r].qty.junior.max,
      si = sections.indexOf(s), ri = roles(s).indexOf(r),
      sr = `{link.s_${si}r_${ri}.${_s(r)}}`, req = `{link.s_${si}r_${ri}.required}`,
      opt = `{link.s_${si}r_${ri}.optional}`
    let ret = [], i = 0, j = v.length - 1
    while (i < amax || i < jmax || i < j) {
      if (i > j) {
        ret.push([sr,
          i < amin ? req : i < amax ? opt : '',
          i < jmin ? req : i < jmax ? opt : ''])
        i++
      }
      else {
        const n = v[i].n, m = v[j].n,
          vi = `{link._${v[i].id}.${_s(vs[v[i].id].name)}}`,
          vj = `{link._${v[j].id}.${_s(vs[v[j].id].name)}}`,
          bi = i < amin ? req : i < amax ? opt : '',
          bj = j < jmin ? req : j < jmax ? opt : ''
        if (n === 3) {
          ret.push([sr, vi, vi])
          i++
        }
        else if (n === 2) {
          if (m === 1) {
            ret.push([sr, vi, vj])
            i++; j--;
          }
          else {
            ret.push([sr, vi, bj])
            i++
          }
        }
        else if (n === 1) {
          ret.push([sr, bi, vj])
          j--
        }
      }
    }
    return ret
  }
  role_rows = (s) => {
    const f = this.form_data,
      fr = f && f.role && f.role !== 'Role',
      rs = roles(s).filter(r => !fr || r === f.role),
      u = f && f.filter, ul = u && u.toLowerCase()
    let ret = []
    rs.forEach(r => ret = ret.concat(this.fill(this.vs(s, r), r, s)))
    if (ul && ul.length > 1) ret = ret.filter(r => r[1].toLowerCase().indexOf(_s(ul)) > -1 || r[2].toLowerCase().indexOf(ul) > -1)
    //debug({ ul, ret })
    return ret
  }
  color = (id) => {
    const v = page.v2023[id],
      vol = page.v2023[id] || page.volunteers[id], e = page.emails[vol.email], u = !vol.email || (e && (e.MCu || e.MCc))
    if (!vol) debug({ id })
    const rl = (vol.v2023 && (!vol.a2023 || vol.arole) && (!vol.j2023 || vol.jrole))
    return (vol.v2023) ? rl ? 'green' : 'blue' : (vol.v2023 === false) || u ? 'red' : 'grey'
  }
  vtip = (v) => {
    let ret = this.roles(v.vid)
    const e = page.emails[v.email], c = e && e['2023C'],
      ar = v.a2023 ? v.arole ? (v.asection + ' ' + v.arole) : '?' : c ? 'competitor' : '✗',
      jr = v.j2023 ? v.jrole ? (v.jsection + ' ' + v.jrole) : '?' : c ? 'competitor' : '✗'
    ret.unshift(`<div class='green'>2023 ${ar}, ${jr}</div>`)
    return ret.join('')
  }
  ftip = (rs) => {
    if (typeof rs === 'string') return rs
    debug({ rs })
    const a = rs.length ? rs : [rs]
    return a.map(r => {
      let ret = [];
      ['first', 'last', 'name', 'adult', 'junior', 'gender', 'dob', 'club', 'email', 'phone'].forEach(f => {
        if (r[f]) ret.push(r[f])
      })
      return `<div>${ret.join(' ')}</div>`
    }).join('')
  }
  roles(id) {
    const v = page.v2023[id] || page.volunteers[id], e = page.emails[v.email]
    let ys = []
    if (!e) return ys
      ;['2022', '2019', '2018', '2017'].forEach(y => {
        const f = y + 'V', d = e[f], rs = d && (d.length ? d : [d]),
          compete = e[y + 'C']
        if (rs) rs.forEach(r => {
          if (r.name === v.name) {
            if ((!r.adult || r.adult.toLowerCase() === 'none') && compete) r.adult = 'competitor'
            ys.push(`<div>${y} ${r.adult}, ${r.junior}</div>`)
          }
        })
      })
    return ys
  }
  tip = (e, o) => {
    const { name, param } = o.attr(), id = name.substring(1), v2023 = page.v2023[id],
      vol = v2023 || page.volunteers[id], em = vol.email, m = em && page.emails[em.toLowerCase()]
    if (v2023) return this.vtip(v2023)
    else if (!param.startsWith('_')) {
      return vol.email ? vol.mobile ? '<div>' + vol.email + '</div><div>' + vol.mobile + '</div>'
        : '<div>' + vol.email + '</div>' : vol.mobile ? '<div>' + vol.mobile + '</div>' : '?'
    }
    else if (param.startsWith('_')) {
      const ys = this.roles(id)
      if (m && m['2023C']) ys.push(`<div>2023 competitor</div>`)
      return ys.length ? ys.sort().reverse().join('') : vol.email || '?'
    }
    else {
      const rs = m && m[id]
      if (rs) return this.ftip(rs)
      else debug({ tip: this.o(), v2023, vol, em, m, rs })
    }
  }
  vlinks = (years, id) => {
    return years.sort().reverse().map(y => `{link._${id}._${y}}`).join(' ')
  }
  years = (v, y, id) => { // v=volunteer, y=years
    const { first, last } = firstLast(v.name || ''),
      years = y ? Object.keys(y) : []
    return { first, last, years: this.vlinks(years, id) }
  }
  form = (o) => {
    const { name, param } = o.attr()
    if (form[name]) return form[name]
  }
  filter = (id) => {
    const fd = this.form_data, f = fd && fd.filter,
      v = page.v2023[id] || page.volunteers[id]
    let r = false
    if (!f) r = true
    else if (v.name && v.name.toLowerCase().includes(f)) r = true
    else if (v.email && v.email.toLowerCase().includes(f)) r = true
    if (this._2023) r = r && v.v2023
    return r
  }
  update = (e, o) => {
    const { name, param } = o.attr()
    if (name === 'C') this.setForm({ filter: '' }, form)
    else if (name === 'R') {
      selectSection('Section', null, form, this)
      this.setForm({ section: 'Section', role: 'Role' }, form)
    }
    else if (name === 'section') selectSection(e, o, form, this)
    else if (name === 'role') selectRole(e, o, form, this)
    const C = this.querySelector(`button[name=C]`),
      fd = this.form_data = this.getForm(form),
      filter = fd.filter
    C.classList[filter ? 'remove' : 'add']('hidden')
    const R = this.querySelector(`button[name=R]`)
    if (R) {
      const r = (fd.role && fd.role !== 'Role') || (fd.section && fd.section !== 'Section')
      R.classList[r ? 'remove' : 'add']('hidden')
    }
    if (name === 'nr') this._nr.setAttribute('param', 'update')
    else page._update.setAttribute('param', 'update')
  }

}
export { firstLast }
export default Volunteer
