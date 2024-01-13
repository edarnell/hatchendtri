import Html, { debug, error, nav, _s } from './Html'
import html from './html/Volunteer.html'
import greet from './html/greet.html'
import greetY from './html/greetY.html'
import greetN from './html/greetN.html'
import { sections, section, roles, selectSection, selectRole } from './roles'

const year = 2024
class Volunteer extends Html {
  constructor() {
    super()
    this.id = 'volunteer'
    this.data = ['vs', 'es']
  }
  vs_ = () => {
    const vs = nav.d.data.vs
    if (!this._vs && vs) {
      const _vs = this._vs = {}
      Object.values(vs).forEach(v => {
        if (_vs[v.i]) {
          if (!v.first) _vs[v.i].unshift(v.id)
          else _vs[v.i].push(v.id)
        }
        else _vs[v.i] = [v.id]
      })
    }
    return this._vs
  }
  greet = () => {
    const u = nav._user, _vs = this._vs, v = _vs && _vs[u.i], fl = v && name(v[0], true),
      first = (fl || u).first, last = (fl || u).last,
      c = this.color()
    return u ? `Welcome {link.n.${first}_${last}} ` + (c === 'grey' ? 'please confirm availability.' :
      c === 'red' ? 'thank you for confirming you are unable to help this year.' : 'thank you for volunteering.')
      : 'We need a large volunteer team please {nav.contact} if you can help. All help is greatly appreciated.'
  }
  var = (n) => {
    if (n === 'year') return '' + year
  }
  loaded = (r) => {
    if (r) this.reload()
  }
  volClose = () => this.updated()
  updated = (r) => {
    this.reload('greet')
  }
  rendered = () => {
    const u = nav._user
    if (u && u.admin) {
      const n = this.fe('New')
      if (n) n.classList.remove('hidden')
    }
    if (u && this.color() === 'grey') {
      const l = this.q(`[id="TT_n_greet_0"]`)
      this.popup('{Vol.n}', 'vol_avail', l)
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
    if (n === 'n') return { tip: () => this.utip(), class: this.color(), popup: `{Vol.n}` }
    else {
      const id = n.substring(1), vs = nav.d.data.vs, vol = vs[id]
      if (vol) {
        if (n.charAt(0) === 'v') return { tip: () => this.tip(id, 2024), theme: 'light', class: 'span ' + this.color(id), popup: `{Vol.${id}}` }
        else return nav._user.admin ? { tip: () => this.tip(id), theme: 'light', class: this.color(id), popup: `{Vol.${id}}` }
          : { tip: `contact ${name(id)}`, class: this.color(id), theme: 'light', popup: `{Contact.${id}}` }
      }
      else error({ link: n, id, vol })
    }
  }
  html = (n) => {
    const vs = nav.d.data.vs, u = nav._user, c = this.color()
    if (vs && !this._vs) this._vs = this.vs_()
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
  color = (id, y = year) => {
    const u = !id && nav._user, _vs = u && this._vs, vid = _vs && _vs[u.i] && _vs[u.i][0],
      v = nav.d.data.vs[id || vid], yr = v && v.year, vy = yr && yr[y],
      n = vy && vy.none,
      r = vy && (vy.adult || vy.junior),
      rb = r && ((vy.adult && !vy.arole) || (vy.junior && !vy.jrole))
    const ret = r ? (rb && id) ? 'blue' : 'green' : n ? 'red' : 'grey'
    return ret
  }
  utip = () => {
    const u = nav._user, _vs = this._vs, vs = _vs && _vs[u.i],
      vid = vs && vs[0], c = this.color()
    if (c === 'grey') return '<div class="grey">click to set availability</div>'
    else return this.vtip(vid, year).replace(/\?/g, '✓')
  }
  vtip = (id, y = 2024) => {
    const vs = nav.d.data.vs, v = vs && vs[id], cl = this.color(v.id, y), vy = v && v.year && v.year[y]
    if (vy) {
      const c = vy.competitor, r = (vy.adult || vy.junior || vy.none),
        ar = vy.adult ? vy.arole ? (vy.asection + ' ' + vy.arole) : '?' : c ? 'competitor' : r ? '✗' : '?',
        jr = vy.junior ? vy.jrole ? (vy.jsection + ' ' + vy.jrole) : '?' : c ? 'competitor' : r ? '✗' : '?'
      return `<div class=${cl}>${y} ${ar}, ${jr}</div>`
    }
    else return `<div class=${cl}>${y} ?</div>`
  }
  roles(id) {
    const v = nav.d.data.vs[id],
      ys = ['2023', '2022', '2019', '2018', '2017'].map(y => this.yroles(v, y))
    return ys
  }
  yroles = (v, y = year) => {
    if (v && v.year && v.year[y]) {
      const vy = v.year[y]
      if (y === year) return this.vtip(vy, y)
      else if (y === '2023') return vy.adult || vy.junior ? `<div>${y} ${vy.adult ? (vy.asection + ' ' + vy.arole) : '✗'}, ${vy.junior ? (vy.jsection + ' ' + vy.jrole) : '✗'}</div>` : ''
      else return `<div>${y} ${vy.adult}, ${vy.junior}</div>`
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
      const id = name.substring(2), vol = nav.d.data.vs[id], _id = name.substring(1)
      if (vol && nav.d.admin()) return { tip: () => this._p('tip')(id), class: ' ', theme: 'light', popup: `{Vol.${id}}` }
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
      const f = { a: 'adult', j: 'junior', s: 'both', f: 'both' }, ajs = f[n.charAt(0)]
      return { tip: `fill ${ajs}`, popup: `{Vselect.${n}}` }
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
    const v = nav.d.data.vs[id], { asection, arole, jsection, jrole } = (v.year && v.year[year]) || {}
    //if (!v.year) debug({ id, v })
    let n = 0
    n += (asection === s && arole === r) ? 2 : 0
    n += (jsection === s && jrole === r) ? 1 : 0
    return n
  }
  vs = (s, r) => {
    const vs = nav.d.data.vs, ks = vs && Object.keys(vs).map(id => { if (id * 1 && vs[id]) return { id, n: this.sr(id, s, r) } }),
      fvs = ks && ks.filter(k => k && k.n).sort((a, b) => b.n - a.n)
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
          vi = `{link._${v[i].id}.${_s(name(v[i].id, true, true))}}`,
          vj = `{link._${v[j].id}.${_s(name(v[j].id, true, true))}}`,
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
    let ret = ''
    if (nav.reply) {
      const us = nav.users()
      if (us) us.forEach(u => {
        const uaj = u.year[year], s = uaj && (uaj.adult || uaj.junior || uaj.none)
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
      ret = nav.reply === 'yes' ? greetY : greetN
    }
    else {
      ret = greet
    }
    return `<div id="greet">${ret}</div>`
  }
}

function name(vid, l, s) {
  const { vs, es } = nav.d.data, v = vs && vs[vid], e = v && es[v.i]
  let first, last
  if (v && v.first) first = v.first
  else if (e && e.first) first = e.first
  else error({ vid, v })
  if (v && v.last) last = v.last
  else if (e && e.last) last = e.last
  else error({ vid, v })
  return l ? s ? first + ' ' + last : { first, last } : first
}
export { name }
export default Volunteer
