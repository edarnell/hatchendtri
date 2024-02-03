import Html, { debug, error, _s } from './Html'
import { nav } from './Nav'
import html from './html/Volunteer.html'
import { sections, section, roles, selectSection, selectRole } from './roles'

const year = 2024
class Volunteer extends Html {
  constructor() {
    super()
    this.id = 'volunteer'
    this.data = ['vs', 'vr']
    nav._vol = nav._vol || true
  }
  greet = () => {
    const u = nav._user, v = u && u.vs && u.vs[0], c = this.color(v)
    if (u && u.aed) return `Welcome <span class="red">${u.first} ${u.last}</span> be careful.`
    else return u ? `Welcome {link.u.${_s(u.first)}_${_s(u.last)}} ` + (c === 'grey' ? 'please confirm availability.' :
      c === 'red' ? 'thank you for confirming you are unable to help this year.' : 'thank you for volunteering.')
      : 'We need a large volunteer team please {link.register} if you can help. All help is greatly appreciated.'
  }
  var = (n) => {
    if (n === 'year') return '' + year
  }
  loaded = (r) => {
    if (r) this.reload(false)
  }
  volClose = () => this.updated()
  updated = (r) => {
    this.reload()
  }
  rendered = () => {
    const u = nav._user, v = u && u.vs && u.vs[0]
    if (u && u.admin) {
      const n = this.fe('New')
      if (n) n.classList.remove('hidden')
    }
    const d = nav.d.data, vid = u && d.vs && u.admin && d.vs[nav._vol]
    if (u && ((nav._vol && this.color() === 'grey') || vid)) {
      const l = this.q(`[id="TT_u_greet_0"]`)
      if (l) l.click()
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
  link = (n) => {
    if (n === 'u') return { tip: () => this.utip(), class: this.color(), popup: `{Vol.u}` }
    else {
      const id = n.substring(1), vs = nav.d.data.vs, v = vs[id], u = nav._user
      if (v && u) {
        if (n.charAt(0) === 'v') return { tip: () => this.tip(id, 2024), theme: 'light', class: 'span ' + this.color(id), popup: `{Vol.${id}}` }
        else return u.admin ? { tip: () => this.tip(id), theme: 'light', class: this.color(id), popup: `{Vol.${id}}` }
          : { tip: `contact ${v.first} ${v.last}`, class: this.color(id), theme: 'light', popup: `{Contact.${id}}` }
      }
      else return { tip: 'login or register', class: this.color(id), theme: 'light', popup: 'User' } // not logged in
    }
  }
  html = (n) => {
    const vs = nav.d.data.vs
    if (!vs) return `<div id="volunteer"></div>` // wait to load
    else if (!n) return `<div id="volunteer">${html}</div>`
    else if (n === 'greet') return `<div id="greet"><p>${this.greet()}</p></div>`
    else if (n === 'nr') {
      const f = this._form, nr = (f && f.nr) || 'Roles'
      return `<div id="nr">${nr === 'Roles' ? '{div.vRoles}' : '{div.vNames}'}</div>`
    }
    else if (n === 'vRoles') return new Vroles(this.div['nr'], n)
    else if (n === 'vNames') return new Vnames(this.div['nr'], n)
  }
  color = (vid) => {
    const u = nav._user, id = vid || (u && u.vs && u.vs[0]),
      vr = nav.d.data.vr,
      v = vr && vr[id],
      n = v && v.none,
      r = v && (v.adult || v.junior),
      rb = r && ((v.adult && !v.arole) || (v.junior && !v.jrole))
    const ret = r ? rb ? 'blue' : 'green' : n ? 'red' : 'grey'
    return ret
  }
  utip = () => {
    const u = nav._user, v = u.vs && u.vs[0], c = this.color(v)
    if (c === 'grey') return '<div class="grey">click to set availability</div>'
    else return this.vtip(v).replace(/\?/g, '✓')
  }
  vtip = (id) => {
    const vr = nav.d.data.vr, v = vr && vr[id], cl = this.color(id)
    if (v) {
      const r = (v.adult || v.junior || v.none),
        ar = v.adult ? v.arole ? (v.asection + ' ' + v.arole) : '?' : r ? '✗' : '?',
        jr = v.junior ? v.jrole ? (v.jsection + ' ' + v.jrole) : '?' : r ? '✗' : '?'
      return `<div class=${cl}>${year} adult:${ar} junior:${jr}</div>`
    }
    else return `<div class=${cl}>${year} ?</div>`
  }
  roles(id) {
    const v = nav.d.data.vs[id],
      ys = ['2023', '2022', '2019', '2018', '2017'].map(y => this.yroles(v, y))
    return ys
  }
  yroles = (v, y = year) => {
    if (v && v.year && v.year[y]) {
      const vy = v.year[y]
      return `<div>${y} ${vy.adult || '✗'}, ${vy.junior || '✗'}</div>`
    }
    else return ''
  }
  tip = (id, y) => {
    if (y) return this.vtip(id, y)
    let ret = this.roles(id)
    ret.unshift(this.vtip(id))
    return ret.join('')
  }
  vlinks = (years, id) => {
    return years.sort().reverse().map(y => `{link._${id}._${y}}`).join(' ')
  }
  years = (v, y, id) => { // v=volunteer, y=years
    const { first, last } = name(v.id, true),
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
    this._year = true // filters names
  }
  html = () => {
    return '<div id="vNames">{table.vTable}</div>'
  }
  link = (name, param) => {
    if (name === 'id') return {
      tip: () => (this._year ? `${this.rows.length} rows show all` : `${this.rows.length} rows filter year`),
      click: () => {
        this._year = !this._year
        this.reload('vNames')
      }
    }
    else if (name.startsWith('v_')) {
      const id = name.substring(2), vol = nav.d.data.vs[id], _id = name.substring(1), u = nav._user
      if (vol && u.admin) return { tip: () => this._p('tip')(id), class: ' ', theme: 'light', popup: `{Vol.${id}}` }
      else if (vol) return { tip: 'contact', class: ' ', theme: 'light', popup: `{Contact.${id}}` }
    }
    else if (name.startsWith('_')) {
      const id = name.substring(1)
      return { tip: 'contact', theme: 'light', popup: `{Contact.${id}}` }
    }
  }
  filter = (id) => {
    const fd = this.p._p('_form'), f = fd && fd.filter,
      v = nav.d.data.vs[id], vyear = v.year && v.year[year],
      role = vyear && ((vyear.asection || '') + ' ' + (vyear.arole || '') + ' ' + (vyear.jsection || '') + ' ' + (vyear.jrole || ''))
    let r = false
    if (!v || id * 1 === 0) r = false
    else if (!f) r = true
    else if (v.name && v.name.toLowerCase().includes(f)) r = true
    else if (v.email && v.email.toLowerCase().includes(f)) r = true
    else if (role && role.toLowerCase().includes(f)) r = true
    if (this._year) r = r && v.year && v.year[year]
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
    if (name === 'vTable') return ['{link.id._year}', 'First', 'Last', 'Adult', 'Junior']
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
    const v = nav.d.data.vs[id],
      c = name(id, true),
      n = Object.keys(v.year).length,
      l = v.year[year],
      a = l && l.arole ? l.asection + ' ' + l.arole : '',
      j = l && l.jrole ? l.jsection + ' ' + l.jrole : ''
    if (!c.first) error({ id, v, c, l, a, j })
    return [this.ticks(l, id), `{link._${id}.${_s(c.first) || '?'}}`, c.last, a, j]
  }
}

class Vroles extends Html {
  constructor(p, n) {
    super(p, n)
  }
  html = (n) => {
    if (n === 'vRoles') {
      return "<form>{select.section} {select.role} {button.R.C}</form>{div.roles}"
    }
    else if (n === 'roles') {
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
  link = (n, param) => {
    if (n.startsWith('u_')) {
      const id = n.substring(2), vol = nav.d.data.vs[id], _id = n.substring(1)
      if (vol) return { tip: () => this.tip(id), theme: 'light', class: this.p.color(id) }
    }
    else if (n.charAt(1) === '_') {
      const u = nav._user, admin = u && u.admin, f = { a: 'adult', j: 'junior', s: 'both', f: 'both' }, ajs = f[n.charAt(0)]
      return { tip: admin ? `fill ${ajs}` : 'role details', popup: `{Vselect.${n}}` }
    }
    else return this.plink(n, param)
  }
  ths = (n, p) => {
    if (n.startsWith('section')) {
      const sn = _s(p, false), s = section[sn]
      return [s.name, `${s.start.adult} - ${s.end.adult}`, `${s.start.junior} - ${s.end.junior}`]
    }
  }
  trs = (n, p) => {
    if (n.startsWith('section')) {
      const s = _s(p, false), f = this._form, sf = f && f.section
      //debug({ s, sf, f, name, param })
      if (sf && sf !== 'Section' && sf !== s) return []
      else return this.role_rows(s)
    }
  }
  voltip = (id) => {
    const v = nav.d.data.vs[id], l = v.year[year] || {}
    let ret = ''
    if (l.none || !(l.adult || l.junior)) return `unavailable <span class="red">{link.v_${id}.✗✗}</span>`
    if (l.adult) ret += `adult<span class="${l.arole ? 'green' : 'amber'}">{link.v_${id}.✓}</span>`
    else ret += `adult<span class="red">{link.v_${id}.✗}</span>`
    if (l.junior) ret += `junior<span class="${l.jrole ? 'green' : 'amber'}">{link.v_${id}.✓}</span>`
    else ret += `junior<span class="red">{link.v_${id}.✗}</span>`
    return ret
  }
  sr = (id, s, r) => {
    const v = nav.d.data.vr[id], { asection, arole, jsection, jrole } = v || {}
    //if (!v.year) debug({ id, v })
    let n = 0
    n += (asection === s && arole === r) ? 2 : 0
    n += (jsection === s && jrole === r) ? 1 : 0
    return n
  }
  vs = (s, r) => {
    const vr = nav.d.data.vr, ks = vr && Object.keys(vr).map(id => { if (id * 1 && vr[id]) return { id, n: this.sr(id, s, r) } }),
      fvs = ks && ks.filter(k => k && k.n).sort((a, b) => b.n - a.n)
    return fvs
  }
  vname = (id) => {
    const v = nav.d.data.vs[id]
    return v.first + ' ' + v.last
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
          vi = `{link._${v[i].id}.${_s(this.vname(v[i].id))}}`,
          vj = `{link._${v[j].id}.${_s(this.vname(v[j].id))}}`,
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

export default Volunteer
