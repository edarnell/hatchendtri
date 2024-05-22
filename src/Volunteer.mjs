import Html, { debug, error, _s, dbg } from './Html.mjs'
import { nav } from './Nav.mjs'
import { ajax } from './ajax.mjs'
import html from './html/Volunteer.html'
import Vselect from './Vselect.mjs'
import { sections, section, roles, selectSection, selectRole } from './roles.mjs'
//TODO improve and fix end to end testing
//TODO names & roles testing - when change availability form realoads showing Roles when Names.

const year = 2024
class Volunteer extends Html {
  constructor() {
    super()
    this.id = 'volunteer'
    this.data = ['vs', 'vr', 'vrs', 'es']
    this._vol = true
  }
  greet = () => {
    const u = nav._user, vs = nav.d.data.vs, v = u && u.vs && u.vs[0], c = this.color(v)
    if (u && u.aed) return `Welcome <span class="red">${u.first} ${u.last}</span> be careful.`
    else return u ? `Welcome ${u.admin ? `{checkbox.admin}` : ''}${v ? u.vs.map(v => `{link.v${v}.${_s(vs[v].first)}}`).join(', ') : `{link.u.${_s(u.first)}}`}, `
      + (c === 'grey' ? 'please confirm availability.' :
        c === 'red' ? 'thank you for confirming you are unable to help this year.' : 'thank you for volunteering. Hover over your name to see role details, or look below.')
      : 'We need a large volunteer team please {link.register} if you can help. All help is greatly appreciated.'
  }
  admin = () => {
    const u = nav._user, f = this._form,
      a = u && u.admin && f && f.admin,
      nr = this._form && this.fe('nr')
    if (a && nr) nr.classList.remove('hidden')
    else if (nr) nr.classList.add('hidden')
    return a
  }
  var = (n) => {
    if (n === 'year') return '' + year
  }
  loaded = (r) => {
    debug({ loaded: r })
    if (r) this.reload(false)
  }
  volClose = () => this.updated()
  updated = (r) => {
    this.reload()
  }
  rendered = () => {
    const u = nav._user, vs = nav.d.data.vs, v = this._vol, c = this.color(), nv = nav._vol
    if (u && vs && ((v && c === 'grey') || nv)) {
      this._vol = null
      debug({ popup: u })
      const l = this.q(`[id=TT_${u.vs.length?'v'+u.vs[0]:'u'}_greet_0]`)
      if (l) l.click()
    }
    debug({ u, vs, v, c, nv })

  }
  form = () => {
    return { // section and options populated on load
      admin: { class: 'form red bold', tip: 'enable admin functions' },
      filter: { placeholder: 'name filter', width: '50rem' },
      nr: { class: "hidden form", options: ['Roles', 'Names'], tip: 'Display by role or name' },
      C: { class: 'hidden form red bold', tip: 'clear name', click: 'submit' },
      New: { class: 'hidden form green', tip: 'add new volunteer', popup: 'VolD', placement: 'bottom' }
    }
  }
  link = (n) => {
    if (n === 'u') return { tip: () => this.utip(), class: this.color(), popup: `{Vol.u}` }
    else {
      const id = n.substring(1), vs = nav.d.data.vs, v = vs[id], u = nav._user
      if (v && u) {
        if (n.charAt(0) === 'v') return { tip: () => this.tip(id, 2024), theme: 'light', class: 'span ' + this.color(id), popup: `{Vol.${id}}` }
        else return this.admin() ? { tip: () => this.tip(id), theme: 'light', class: this.color(id), popup: `{Vol.${id}}` }
          : { tip: `contact ${v.first} ${v.last}`, class: this.color(id), theme: 'light', popup: `{Contact.${id}}` }
      }
      else {
        const vr = nav.d.data.vr[id]
        if (vr && !v) return { tip: 'click to remove (missing from vs)', theme: 'light', click: () => this.rmv(id), class: 'red' }
        else return { tip: 'login or register', class: this.color(id), theme: 'light', popup: 'User' } // not logged in
      }
    }
  }
  rmv = (id) => {
    ajax({ req: 'rm', v: id }).then(r => {
      this.reload()
    })
  }
  html = (n) => {
    const vs = nav.d.data.vs
    if (!vs) return `<div id="volunteer"></div>` // wait to load
    else if (!n) return `<div id="volunteer">${html}</div>`
    else if (n === 'names') return this.names()
    else if (n === 'greet') return `<div id="greet"><p>${this.greet()}</p></div>`
    else if (n === 'nr') {
      const f = this._form, nr = (f && f.nr) || 'Roles'
      return `<div id="nr">${nr === 'Roles' ? '{div.vRoles}' : '{div.vNames}'}</div>`
    }
    else if (n === 'Vselect') return new Vselect(this.div['admin'], n)
    else if (n === 'vRoles') return new Vroles(this.div['nr'], n)
    else if (n === 'vNames') return new Vnames(this.div['nr'], n)
  }
  nameSort = (a, b) => {
    const vs = nav.d.data.vs
    const { last: al, first: af } = vs[a], { last: bl, first: bf } = vs[b]
    if (al < bl) return -1
    if (al > bl) return 1
    if (af < bf) return -1
    if (af > bf) return 1
    return 0
  }
  filter = (id) => {
    const f = this._form, d = nav.d.data, v = d.vs[id], vr = d.vr[id]
    if (f && f.filter) {
      const name = v.first + ' ' + v.last
      return name.toLowerCase().indexOf(f.filter.toLowerCase()) > -1
    }
    else return vr && ((vr.adult && (!vr.arole || vr.arole === 'Role')) || (vr.junior && (!vr.jrole || vr.jrole === 'Role')))
  }
  names = () => {
    const f = this._form, nm = f && f.filter,
      a = this.admin(),
      d = nav.d.data, vs = d.vs,
      n = f && this.fe('New'),
      vols = Object.keys(vs).filter(this.filter).sort(this.nameSort),
      html = vols.slice(0, 10).map(id => `<span>{link._${id}.${_s(vs[id].first)}_${_s(vs[id].last)}}</span>`)
        .join(', '),
      add = nm && !vols.length && a
    if (n && add) n.classList.remove('hidden')
    else if (n) n.classList.add('hidden')
    return a ? `${nm ? 'Historic' : 'Available'}:</b> ${html}` : ''
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
    else return this.vtip(v)
  }
  role(id, aj) {
    const d = nav.d.data, vr = d.vr, v = vr && vr[id],
      sn = { a: 'adult', j: 'junior' }, y = v && v[sn[aj]], s = y && v[aj + 'section'], r = y && v[aj + 'role'],
      ro = r && section(s).role[r],
      ts = s && section(s).time[aj],
      t = ro && ro.t,
      h = s === r || s === 'Race Control' ? r : s + ' ' + r
    return { y, ts, h, t }
  }
  tick(y) {
    return `<span class=${y ? 'green' : 'red'}>${y ? '✓' : '✗'}</span>`
  }
  vtip = (id) => {
    const cl = this.color(id), d = nav.d.data, vr = d.vr, v = vr && vr[id]
    if (v) {
      const a = this.role(id, 'a'), j = this.role(id, 'j'), v = nav.d.data.vs[id]
      return `<div>${year} ${this.tick(a.y)}, ${this.tick(j.y)}  ${v.notes || ''}</div>`
        + (a.h ? `<div><h6>${a.h}</h6>${a.t}</div>` : '')
        + (j.h && j.h !== a.h ? `<div><h6>${j.h}</h6>${j.t}</div>` : '')
    }
    else return `<span class=${cl}>${year} ?</span>`
  }
  roles(id) {
    const v = nav.d.data.vs[id],
      ys = ['2023', '2022', '2019', '2018', '2017'].map(y => this.yroles(v, y))
    return ys
  }
  yroles = (v, y = year) => {
    if (v && v.year && v.year[y]) {
      const vy = v.year[y]
      return `<span>${y} ${vy.adult || '✗'}, ${vy.junior || '✗'}</span>`
    }
    else return ''
  }
  tip = (id, y) => {
    const u = nav._user,
      rs = this.roles(id).filter(r => r).join('<br />')
    if (u && this.admin()) {
      ajax({ req: 'vol', v: id }).then(r => {
        const l = this.q(`[id=vol_tt_${id}]`),
          m = r.v.mobile, e = r.v.email,
          h = `<span>${m ? `<a href="tel:${m}">${m}</a>` : '?mobile'} ${e ? `<a href="mailto:${e}">${e}</a>` : '?email'}</span><br />`
        if (l) l.innerHTML = h + l.innerHTML
        else error({ id, r })
      })
      return `<span id="vol_tt_${id}">${this.vtip(id)}</span><br />${rs}`
    }
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
    if (this.admin()) this.reload('names')
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
    if (name === 'year') return {
      tip: () => (this._year ? `${this.rows.length} rows show all years` : `${this.rows.length} rows filter ${year}`),
      click: () => {
        this._year = !this._year
        this.reload('vNames')
      }
    }
    else if (name.startsWith('v_')) {
      const id = name.substring(2), vol = nav.d.data.vs[id], u = nav._user
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
      d = nav.d.data,
      v = d.vs[id],
      vy = d.vr[id],
      role = vy && ((vy.asection || '') + ' ' + (vy.arole || '') + ' ' + (vy.jsection || '') + ' ' + (vy.jrole || ''))
    let r = false
    if (!v || id * 1 === 0) r = false
    else if (!f) r = true
    else if (v.name && v.name.toLowerCase().includes(f)) r = true
    else if (v.email && v.email.toLowerCase().includes(f)) r = true
    else if (role && role.toLowerCase().includes(f)) r = true
    if (this._year) r = r && vy
    return r
  }
  trs = (n) => {
    if (n === 'vTable') {
      const ids = Object.keys(nav.d.data.vs).filter(this.filter),
        rows = this.rows = ids.map(id => this.tr(id)).sort((a, b) => a[2].localeCompare(b[2]))
      return rows
    }
  }
  ths = (n) => {
    if (n === 'vTable') return [`{link.year.${this._year ? year : 'all_years'}}`, 'First', 'Last', 'Adult', 'Junior']
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
    const d = nav.d.data,
      v = d.vs[id],
      l = d.vr[id],
      a = l && l.arole ? l.asection + ' ' + l.arole : '',
      j = l && l.jrole ? l.jsection + ' ' + l.jrole : ''
    if (!v.first) error({ id, v, c, l, a, j })
    return [this.ticks(l, id), `{link._${id}.${_s(v.first) || '?'}}`, v.last, a, j]
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
      const sa = sections()
      return `<div id="roles">
      ${sa.map((s, i) => `{table.section${i}.${_s(s)}}`).join('')}
      </div>`
    }
  }
  form = () => {
    return {
      section: { class: "form", options: ['Section'].concat(sections()), tip: 'filter section' },
      role: { class: "form", options: ['Role'].concat(roles()), tip: 'filter role' },
      R: { class: 'hidden form red bold', tip: 'clear selection', click: 'submit' }
    }
  }
  input = (e, o) => {
    const name = o.name
    let reload = true
    if (name === 'R') {
      this.setForm({ section: 'Section', role: 'Role' })
      selectSection(this)
    }
    else if (name === 'section') selectSection(this)
    else if (name === 'role') selectRole(this)
    else {
      reload = false
      this.pinput(e, o)
    }
    const R = this.fe('R'), fd = this._form = this.getForm()
    const r = (fd.role && fd.role !== 'Role') || (fd.section && fd.section !== 'Section')
    R.classList[r ? 'remove' : 'add']('hidden')
    if (reload) this.reload('roles')
  }
  link = (n, p) => {
    if (n.startsWith('u_')) {
      const id = n.substring(2), vol = nav.d.data.vs[id], _id = n.substring(1)
      if (vol) return { tip: () => this.tip(id), theme: 'light', class: this.p.color(id) }
    }
    else if (n.charAt(1) === '_') {
      const u = nav._user, a = u && u.admin,
        [, aj, s, r] = n.match(/([sajf])_(\d{1,2})r_(\d{1,2})/),
        sa = sections(), sec = sa[s], so = section(sec),
        ra = roles(sec), role = ra[r], ro = so.role[role]
      return { tip: ro.t, class: ' ', theme: 'light', popup: a ? `{Vselect.${n}}` : '{Contact}' }
    }
    else return this.plink(n, p)
  }
  ths = (n, p) => {
    if (n.startsWith('section')) {
      const sn = _s(p, false), s = section(sn)
      return [sn, `${s.time.a[0]} - ${s.time.a[1]}`, `${s.time.j[0]} - ${s.time.j[1]}`]
    }
  }
  trs = (n, p) => {
    if (n.startsWith('section')) {
      const s = _s(p, false), f = this._form, sf = f && f.section
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
    const v = nav.d.data.vs[id], vr = nav.d.data.vr[id]
    if (!v) {
      error({ id, v, vr })
      return 'e' + id
    }
    return v.first + ' ' + v.last
  }
  fill = (v, r, s) => {
    const sa = sections(), so = section(s), rl = so.role[r],
      amin = rl.aj ?? rl.a ?? (!rl.j && 1),
      jmin = rl.aj ?? rl.j ?? (!rl.a && 1),
      si = sa.indexOf(s), ri = roles(s).indexOf(r),
      sr = `{link.s_${si}r_${ri}.${_s(r)}}`,
      sf = `{link.f_${si}r_${ri}.${_s(r)}}`,
      reqa = `{link.a_${si}r_${ri}.required}`,
      reqj = `{link.j_${si}r_${ri}.required}`,
      opta = `{link.a_${si}r_${ri}.optional}`,
      optj = `{link.j_${si}r_${ri}.optional}`
    let ret = [], i = 0, j = v.length - 1, t = 0
    while (t < amin || t < jmin || i <= j) {
      if (i > j) {
        ret.push([sr,
          t < amin ? reqa : rl.j ? '' : opta,
          t < jmin ? reqj : rl.a ? '' : optj])
      }
      else {
        const n = v[i].n, m = v[j].n,
          vi = `{link._${v[i].id}.${_s(this.vname(v[i].id))}}`,
          vj = `{link._${v[j].id}.${_s(this.vname(v[j].id))}}`,
          bi = t < amin ? reqa : rl.j ? '' : opta,
          bj = t < jmin ? reqj : rl.a ? '' : optj
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
    return ret
  }
}

export default Volunteer
