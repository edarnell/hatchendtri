import Html, { debug, page, _s } from './Html'
import { req } from './data'
import html from './html/Volunteer.html'
import greet from './html/greet.html'
import greetY from './html/greetY.html'
import greetN from './html/greetN.html'
import { sections, section, roles, selectSection, selectRole, firstLast } from './roles'

const form = { // section and options populated on load
  filter: { placeholder: 'name filter', width: '50rem' },
  C: { class: 'hidden form red bold', tip: 'clear name', submit: true },
  R: { class: 'hidden form red bold', tip: 'clear selection', submit: true },
  New: { class: 'form green hidden', tip: 'add new volunteer', popup: `{vsel.new}`, placement: 'bottom' },
  section: { class: "form", options: ['Section'].concat(sections), tip: 'filter section' },
  role: { class: "form", options: ['Role'].concat(roles()), tip: 'filter role' },
  nr: { class: "form", options: ['Roles', 'Names'], tip: 'Display by role or name' },
}

class Volunteer extends Html {
  constructor() {
    super()
    this.data = 'vs'
    this._2023 = true // filters names
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
    else if (name.startsWith('v_')) {
      const id = name.substring(2), vol = page.vs[id], _id = name.substring(1)
      if (vol && nav.admin()) return { tip: 'update', theme: 'light', class: this.color(id), popup: `{vol.${_id}}` }
      else if (vol) return { tip: 'contact', theme: 'light', class: this.color(id), popup: `{contact.${name}}` }
    }
    else if (name.startsWith('u_')) {
      const id = name.substring(2), vol = page.vs[id], _id = name.substring(1)
      if (vol) return { tip: 'update', theme: 'light', class: this.color(id), popup: `{vol.${_id}}` }
    }
    else if (name.charAt(1) === '_') {
      const f = { a: 'adult', j: 'junior', s: 'both', f: 'both' }, ajs = f[name.charAt(0)]
      return { tip: `fill ${ajs}`, popup: `{vsel.${name}}` }
    }
    const id = name.substring(1), vol = page.vs[id]
    if (vol) {
      const _id = name
      return { tip: this.tip, theme: 'light', class: this.color(id), popup: `{contact.${_id}}` }
    }
  }
  html = (o) => {
    const p = o && o.attr(), name = p && p.name
    if (!o) return html
    else if (name === 'greet') {
      if (nav.reply) {
        const us = nav.users()
        if (us) us.forEach(u => {
          const roles = nav.reply === 'yes' ? { adult: true, junior: true } : { none: true }
          req({ req: 'save', vol: u.id, roles }).then(r => {
            debug({ r })
          }).catch(e => debug({ e }))
        })
        return nav.reply === 'yes' ? greetY : greetN
      }
      else {
        if (nav.admin()) {
          form.New.class = 'form green'
        }
        return greet
      }
    }
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
      const ids = Object.keys(page.vs).filter(this.filter),
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
    const v = page.vs[id], { name, email } = v,
      c = firstLast(name),
      n = Object.keys(v.year).length,
      l = v.year[2023],
      rl = (l && !l.n && (!l.adult || l.arole) && (!l.junior || l.jrole)),
      a = l && l.arole ? l.asection + ' ' + l.arole : '',
      j = l && l.jrole ? l.jsection + ' ' + l.jrole : ''
    return [`{link.v_${id}.${rl ? '✓' : n}}`, `{link._${id}.${_s(c.first)}}`, c.last, a, j]
  }
  sr = (id, s, r) => {
    const v = page.vs[id], { asection, arole, jsection, jrole } = (v.year && v.year[2023]) || {}
    if (!v.year) debug({ id, v })
    let n = 0
    n += (asection === s && arole === r) ? 2 : 0
    n += (jsection === s && jrole === r) ? 1 : 0
    return n
  }
  vs = (s, r) => {
    const ks = Object.keys(page.vs).map(id => { if (id * 1 && page.vs[id]) return { id, n: this.sr(id, s, r) } }),
      vs = ks.filter(k => k && k.n).sort((a, b) => b.n - a.n)
    return vs
  }
  fill = (v, r, s) => {
    const so = section[s], vs = page.vs,
      amin = so.role[r].qty.adult.min, amax = so.role[r].qty.adult.max,
      jmin = so.role[r].qty.junior.min, jmax = so.role[r].qty.junior.max,
      si = sections.indexOf(s), ri = roles(s).indexOf(r),
      sr = `{link.s_${si}r_${ri}.${_s(r)}}`,
      sf = `{link.f_${si}r_${ri}.${_s(r)}}`,
      reqa = `{link.a_${si}r_${ri}.required}`,
      reqj = `{link.j_${si}r_${ri}.required}`,
      opta = `{link.a_${si}r_${ri}.optional}`,
      optj = `{link.j_${si}r_${ri}.optional}`
    let ret = [], i = 0, j = v.length - 1, t = 0
    while (t < amax || t < jmax) {
      if (i > j) {
        ret.push([sr,
          t < amin ? reqa : t < amax ? opta : '',
          t < jmin ? reqj : t < jmax ? optj : ''])
      }
      else {
        const n = v[i].n, m = v[j].n,
          vi = `{link._${v[i].id}.${_s(vs[v[i].id].name)}}`,
          vj = `{link._${v[j].id}.${_s(vs[v[j].id].name)}}`,
          bi = t < amin ? reqa : t < amax ? opta : '',
          bj = t < jmin ? reqj : t < jmax ? optj : ''
        if (n === 3) {
          ret.push([sf, vi, vi])
          i++
        }
        else if (n === 2) {
          if (m === 1) {
            ret.push([sf, vi, vj])
            j--
          }
          else ret.push([sf, vi, bj])
          i++
        }
        else if (n === 1) {
          ret.push([sf, bi, vj])
          j--
        }
      }
      t++
    }
    return ret
  }
  role_filter = (r, ul) => {
    for (let i = 0; i < r.length; i++) {
      const ri = r[i].replace(/\{link.[^.]*\.(\s[^}]+)\}/g, "$1"), f = _s(ri, true)
      if (f.includes(ul)) return true
    }
    return false
  }
  role_rows = (s) => {
    const f = this.form_data,
      fr = f && f.role && f.role !== 'Role',
      rs = roles(s).filter(r => !fr || r === f.role),
      u = f && f.filter, ul = u && u.toLowerCase()
    let ret = []
    rs.forEach(r => ret = ret.concat(this.fill(this.vs(s, r), r, s)))
    if (ul && ul.length > 1) ret = ret.filter(r => this.role_filter(r, ul))
    //debug({ ul, ret })
    return ret
  }
  color = (id) => {
    const v = page.vs[id], vy = v.year[2023],
      rl = (vy && !vy.n && (!vy.adult || vy.arole) && (!vy.junior || vy.jrole))
    return (vy) ? rl ? 'green' : 'blue' : (v.unsub || vy && vy.n) ? 'red' : 'grey'
  }
  vtip = (v) => {
    const c = v.competitor, ar = v.adult ? v.arole ? (v.asection + ' ' + v.arole) : '?' : c ? 'competitor' : '✗',
      jr = v.junior ? v.jrole ? (v.jsection + ' ' + v.jrole) : '?' : c ? 'competitor' : '✗'
    return ar && jr ? `<div class='green'>2023 ${ar}, ${jr}</div>` : '?'
  }
  roles(id) {
    const v = page.vs[id],
      ys = ['2022', '2019', '2018', '2017'].map(y => v.year[y] ? `<div>${y} ${v.year[y].adult}, ${v.year[y].junior}</div>` : '')
    return ys
  }
  tip = (e, o) => {
    const { name, param } = o.attr(), id = name.substring(1), vol = page.vs[id],
      v = vol.year[2023]
    let ret = this.roles(id)
    if (v) ret.unshift(this.vtip(v))
    return ret.join('')
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
      v = page.vs[id], v2023 = v.year[2023],
      role = v2023 && ((v2023.asection || '') + ' ' + (v2023.arole || '') + ' ' + (v2023.jsection || '') + ' ' + (v2023.jrole || ''))
    let r = false
    if (!v || id * 1 === 0) r = false
    else if (!f) r = true
    else if (v.name && v.name.toLowerCase().includes(f)) r = true
    else if (v.email && v.email.toLowerCase().includes(f)) r = true
    else if (role && role.toLowerCase().includes(f)) r = true
    if (this._2023) r = r && v.year[2023]
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
export default Volunteer
