import Html, { debug, page, _s } from './Html'
import html from './html/Volunteer.html'

const form = { // section and options populated on load
  filter: { placeholder: 'name or email', width: '50rem' },
  C: { class: 'hidden form red bold', tip: 'clear all filters', submit: true },
  update: { class: 'hidden form red bold', tip: 'clear all filters' }
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
        this.vD.setAttribute('param', 'update')
      }
    }
    const id = name.substring(1), vol = page.volunteers[id]
    if (vol) return { tip: this.tip, theme: 'light', class: this.color(id), popup: `{vol.${name}}` }
  }
  html = (o) => {
    const p = o && o.attr(), name = p && p.name
    if (!o) return html
    else if (name === 'vD') {
      this.vD = o
      return '{table.vT}'
    }
    else if (name === 'vol_tables') {
      if (!this.isadmin) return ''
      this.vt = o
      return this.roles.sections.map((s, i) => `{table.section.${i}}`).join('')
    }
    else debug({ html: this.debug(), o: o.debug() })
  }
  ths = (o) => {
    return ['{link.id._2023}', 'First', 'Last', 'Data']
  }
  trs = (o) => {
    const ids = Object.keys(page.volunteers).filter(this.filter),
      rows = this.rows = ids.map(id => this.tr(id)).sort((a, b) => a[2].localeCompare(b[2]))
    return rows
  }
  tr = (id) => {
    const v = page.volunteers[id], { name, email } = v, y = page.emails[email],
      c = this.years(v, y, id)
    return [`{link._${id}._v${this.roles(id).length || '?'}}`, `{link._${id}.${_s(c.first)}}`, c.last, c.years]
  }
  color = (id) => {
    const v = page.v2023[id],
      vol = page.volunteers[id], e = page.emails[vol.email], u = !vol.email || (e && (e.MCu || e.MCc))
    if (!vol) debug({ id })
    return (v ? !v.n2023 : vol.v2023) ? 'green' : (v ? v.n2023 : vol.v2023 === false) || u ? 'red' : 'grey'
  }
  ftip = (rs) => {
    if (typeof rs === 'string') return rs
    const a = rs.length ? rs : [rs]
    //debug({ a })
    return a.map(r => {
      let ret = [];
      ['first', 'last', 'name', 'adult', 'junior', 'gender', 'dob', 'club', 'email', 'phone'].forEach(f => {
        if (r[f]) ret.push(r[f])
      })
      return `<div>${ret.join(' ')}</div>`
    }).join('')
  }
  roles(id) {
    const v = page.volunteers[id], e = page.emails[v.email]
    let ys = []
    if (!e) return ys
    const fs = Object.keys(e).filter(f => f.endsWith('V') && f !== '2023V')
    fs.forEach(f => {
      const d = e[f], rs = d.length ? d : [d]
      rs.forEach(r => {
        if (r.name === v.name) {
          const y = f.substring(0, f.length - 1)
          ys.push(`<div>${y} ${r.adult}, ${r.junior}</div>`)
        }
      })
    })
    return ys
  }
  tip = (e, o) => {
    const { name, param } = o.attr(), id = name.substring(1), vol = page.volunteers[id],
      f = param && param.substring(1), m = page.emails[vol.email], rs = m && m[f]
    if (!param.startsWith('_')) {
      return vol.email ? vol.mobile ? '<div>' + vol.email + '</div><div>' + vol.mobile + '</div>'
        : '<div>' + vol.email + '</div>' : vol.mobile ? '<div>' + vol.mobile + '</div>' : '?'
    }
    else if (param.startsWith('_v')) {
      const ys = this.roles(id)
      if (m && m['2023C']) ys.push(`<div>2023 competitor</div>`)
      return ys.length ? ys.sort().reverse().join('') : vol.email || '?'
    }
    else return this.ftip(rs)
  }
  vlinks = (years, id) => {
    return years.sort().reverse().map(y => `{link._${id}._${y}}`).join(' ')
  }
  years = (v, y, id) => { // v=volunteer, y=years
    const name = v.name || '', nm = name.trim(), s = nm.lastIndexOf(' '), first = s > 0 ? nm.substring(0, s) : nm, last = s > 0 ? nm.substring(s + 1) : '',
      years = y ? Object.keys(y) : []
    return { first, last, years: this.vlinks(years, id) }
  }
  form = (o) => {
    const { name, param } = o.attr()
    if (form[name]) return form[name]
  }
  filter = (id) => {
    const fd = this.form_data, f = fd && fd.filter, v = page.volunteers[id]
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
    const C = this.querySelector(`button[name=C]`),
      fd = this.form_data = this.getForm(form),
      filter = fd.filter
    C.classList[filter ? 'remove' : 'add']('hidden')
    this.vD.setAttribute('param', 'update')
  }

}

export default Volunteer
