import Html, { debug, error, nav, _s } from './Html'
import html from './html/Volunteer.html'
import greet from './html/greet.html'
import greetY from './html/greetY.html'
import greetN from './html/greetN.html'
import { sections, section, roles, selectSection, selectRole, firstLast } from './roles'

class Volunteer extends Html {
  constructor() {
    super()
    this.id = 'volunteer'
    this.data = 'vs'
  }
  vol = (id) => {
    return new Vol(id)
  }
  var = (n, p) => {
    if (n === 'name') return nav.d.name()
  }
  rendered = () => {
    if (nav.d.admin()) {
      const n = this.fe('New')
      if (n) n.classList.remove('hidden')
    }
  }
  form = () => {
    return { // section and options populated on load
      filter: { placeholder: 'name filter', width: '50rem' },
      nr: { class: "form", options: ['Roles', 'Names'], tip: 'Display by role or name' },
      C: { class: 'hidden form red bold', tip: 'clear name', click: 'submit' },
      New: { class: 'form green hidden', tip: 'add new volunteer', popup: 'Vselect', placement: 'bottom' }
    }
  }
  link = (name, param) => {
    const id = name.substring(1), vol = nav.d.data.vs[id]
    if (vol) {
      return { tip: this.tip, theme: 'light', class: this.color(id), popup: `{Contact.${id}}` }
    }
  }
  html = (name, param) => {
    const form = this.form()
    if (!name) return html
    else if (name === 'greet') return new Greet(this, name)
    else if (name === 'nr') {
      const f = this._form, nr = (f && f.nr) || 'Roles'
      return `<div id="nr">${nr === 'Roles' ? '{div.vRoles}' : '{div.vNames}'}</div>`
    }
    else if (name === 'vRoles') return new Vroles(this.div['nr'], name)
    else if (name === 'vNames') return new Vnames(this.div['nr'], name)
  }
  color = (id) => {
    const v = nav.d.data.vs[id], vy = v.year[2023],
      rl = (vy && !vy.n && (!vy.adult || vy.arole) && (!vy.junior || vy.jrole))
    return (vy) ? rl ? 'green' : 'blue' : (v.unsub || vy && vy.n) ? 'red' : 'grey'
  }
  vtip = (v) => {
    const c = v.competitor, ar = v.adult ? v.arole ? (v.asection + ' ' + v.arole) : '?' : c ? 'competitor' : '✗',
      jr = v.junior ? v.jrole ? (v.jsection + ' ' + v.jrole) : '?' : c ? 'competitor' : '✗'
    return ar && jr ? `<div class='green'>2023 ${ar}, ${jr}</div>` : '?'
  }
  roles(id) {
    const v = nav.d.data.vs[id],
      ys = ['2022', '2019', '2018', '2017'].map(y => v.year[y] ? `<div>${y} ${v.year[y].adult}, ${v.year[y].junior}</div>` : '')
    return ys
  }
  tip = (e, o) => {
    const { name, param } = o, id = name.substring(1), vol = nav.d.data.vs[id],
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
  input = (e, o) => {
    const { name, param } = o
    if (name === 'C') this.setForm({ filter: '' })
    const C = this.fe('C'),
      fd = this._form = this.getForm(),
      filter = fd.filter
    C.classList[filter ? 'remove' : 'add']('hidden')
    this.reload('nr')
  }
}

class Vnames extends Html {
  constructor(p, name) {
    super(p, name)
    this._2023 = true // filters names
  }
  html = () => {
    return '<div id="vnames">{table.vTable}</div>'
  }
  link = (name, param) => {
    if (name === 'id') return {
      tip: () => (this._2023 ? `${this.rows.length} rows show all` : `${this.rows.length} rows filter 2023`),
      click: () => {
        this._2023 = !this._2023
        this.reload('vNames')
      }
    }
    else if (name.startsWith('v_')) {
      const id = name.substring(2), vol = nav.d.data.vs[id], _id = name.substring(1)
      if (vol && nav.d.admin()) return { tip: () => this.voltip(id), class: ' ', theme: 'light', popup: `{vol.${_id}}` }
      else if (vol) return { tip: 'contact', class: ' ', theme: 'light', popup: () => this.contact(id) }
    }
    else return this.plink(name, param)
  }
  filter = (id) => {
    const fd = this.p._p('_form'), f = fd && fd.filter,
      v = nav.d.data.vs[id], v2023 = v.year[2023],
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
  trs = (name, param) => {
    if (name === 'vTable') {
      const ids = Object.keys(nav.d.data.vs).filter(this.filter),
        rows = this.rows = ids.map(id => this.tr(id)).sort((a, b) => a[2].localeCompare(b[2]))
      return rows
    }
  }
  ths = (name, param) => {
    if (name === 'vTable') return ['{link.id._2023}', 'First', 'Last', 'Adult', 'Junior']
  }
  ticks = (l, id) => {
    if (!l) return `<span class="grey">{link.v_${id}.?}</span>`
    let ret = ''
    if (l.none || !(l.adult || l.junior)) return `<span class="red">{link.v_${id}.✗✗}</span>`
    if (l.adult) ret += `<span class="${l.arole ? 'green' : 'amber'}">{link.v_${id}.✓}</span>`
    else ret += `<span class="red">{link.v_${id}.✗}</span>`
    if (l.junior) ret += `<span class="${l.jrole ? 'green' : 'amber'}">{link.v_${id}.✓}</span>`
    else ret += `<span class="red">{link.v_${id}.✗}</span>`
    return ret
  }
  tr = (id) => {
    const v = nav.d.data.vs[id], { name, email } = v,
      c = firstLast(name),
      n = Object.keys(v.year).length,
      l = v.year[2023],
      a = l && l.arole ? l.asection + ' ' + l.arole : '',
      j = l && l.jrole ? l.jsection + ' ' + l.jrole : ''
    if (!c.first) debug({ id, v, c, l, a, j })
    return [this.ticks(l, id), `{link._${id}.${_s(c.first) || '?'}}`, c.last, a, j]
  }
}

class Vroles extends Html {
  constructor(p, name) {
    super(p, name)
  }
  html = (name) => {
    if (name === 'vRoles') {
      return "<form>{select.section} {select.role} {button.R.C}</form>{div.roles}"
    }
    else if (name === 'roles') {
      return `<div id="roles">
      ${sections.map((s, i) => `{table.section${i}.${_s(s)}}`).join('')}
      </div>`
    }
  }
  form = () => {
    return {
      section: { class: "form", options: ['Section'].concat(sections), tip: 'filter section' },
      role: { class: "form", options: ['Role'].concat(roles()), tip: 'filter role' },
      R: { class: 'hidden form red bold', tip: 'clear selection', click: 'submit' }
    }
  }
  input = (e, o) => {
    const name = o.name
    let reload = true
    if (name === 'R') {
      this.setForm({ section: 'Section', role: 'Role' })
      selectSection(this, 'section', 'role')
    }
    else if (name === 'section') selectSection(this, 'section', 'role')
    else if (name === 'role') selectRole(this, 'section', 'role')
    else {
      reload = false
      this.pinput(e, o)
    }
    const R = this.fe('R'), fd = this._form = this.getForm()
    const r = (fd.role && fd.role !== 'Role') || (fd.section && fd.section !== 'Section')
    R.classList[r ? 'remove' : 'add']('hidden')
    if (reload) this.reload('roles')
  }
  link = (name, param) => {
    if (name.startsWith('u_')) {
      const id = name.substring(2), vol = nav.d.data.vs[id], _id = name.substring(1)
      if (vol) return { tip: () => this.voltip(id), theme: 'light', class: this.p.color(id) }
    }
    else if (name.charAt(1) === '_') {
      const f = { a: 'adult', j: 'junior', s: 'both', f: 'both' }, ajs = f[name.charAt(0)]
      return { tip: `fill ${ajs}`, popup: `{Vselect.${name}}` }
    }
    else return this.plink(name, param)
  }
  ths = (name, param) => {
    if (name.startsWith('section')) {
      const sn = _s(param, false), s = section[sn]
      return [s.name, `${s.start.adult} - ${s.end.adult}`, `${s.start.junior} - ${s.end.junior}`]
    }
  }
  trs = (name, param) => {
    if (name.startsWith('section')) {
      const s = _s(param, false), f = this._form, sf = f && f.section
      //debug({ s, sf, f, name, param })
      if (sf && sf !== 'Section' && sf !== s) return []
      else return this.role_rows(s)
    }
  }
  voltip = (id) => {
    const v = nav.d.data.vs[id], l = v.year[2023] || {}
    let ret = ''
    if (l.none || !(l.adult || l.junior)) return `unavailable <span class="red">{link.v_${id}.✗✗}</span>`
    if (l.adult) ret += `adult<span class="${l.arole ? 'green' : 'amber'}">{link.v_${id}.✓}</span>`
    else ret += `adult<span class="red">{link.v_${id}.✗}</span>`
    if (l.junior) ret += `junior<span class="${l.jrole ? 'green' : 'amber'}">{link.v_${id}.✓}</span>`
    else ret += `junior<span class="red">{link.v_${id}.✗}</span>`
    return ret
  }
  sr = (id, s, r) => {
    const v = nav.d.data.vs[id], { asection, arole, jsection, jrole } = (v.year && v.year[2023]) || {}
    if (!v.year) debug({ id, v })
    let n = 0
    n += (asection === s && arole === r) ? 2 : 0
    n += (jsection === s && jrole === r) ? 1 : 0
    return n
  }
  vs = (s, r) => {
    const vs = nav.d.data.vs, ks = Object.keys(vs).map(id => { if (id * 1 && vs[id]) return { id, n: this.sr(id, s, r) } }),
      fvs = ks.filter(k => k && k.n).sort((a, b) => b.n - a.n)
    return fvs
  }
  fill = (v, r, s) => {
    const so = section[s], vs = nav.d.data.vs,
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
    const f = this._form, f1 = this.p._p('_form'),
      fr = f && f.role && f.role !== 'Role',
      rs = roles(s).filter(r => !fr || r === f.role),
      u = f1 && f1.filter, ul = u && u.toLowerCase()
    let ret = []
    rs.forEach(r => ret = ret.concat(this.fill(this.vs(s, r), r, s)))
    if (ul && ul.length > 1) ret = ret.filter(r => this.role_filter(r, ul))
    //debug({ ul, ret })
    return ret
  }
}

class Greet extends Html {
  constructor(p, name) {
    super(p, name || 'greet')
  }
  html = () => {
    if (nav.reply) {
      const us = nav.users()
      if (us) us.forEach(u => {
        const uaj = u.year[2023], s = uaj && (uaj.adult || uaj.junior || uaj.none)
        if (!s) {
          const roles = nav.reply === 'yes' ? { adult: true, junior: true } : { none: true }
          req({ req: 'save', vol: u.id, roles }).then(r => {
            debug({ r })
          }).catch(e => debug({ e }))
        } else {
          req({
            req: 'send', data: {
              subject: `volunteer ${nav.reply}`,
              message: `current adult:${uaj.adult} junior:${uaj.junior} none:${uaj.none}\n` +
                `arole:${uaj.asection},${uaj.arole} jrole:${uaj.jsection},${uaj.jrole}`
            }
          })
        }
      })
      return nav.reply === 'yes' ? greetY : greetN
    }
    else {
      return greet
    }
  }
}

export default Volunteer
