import { nav, debug } from './Nav.mjs'

let secs, roleMap
function sections() {
    if (secs) return secs
    const y = 2024, vrs = nav.d.data.vrs
    secs = vrs && Object.keys(vrs[y])
    roleMap = []
    secs.forEach(s => {
        Object.keys(vrs[y][s].role).forEach(r => roleMap.push({ s, r }))
    })
    return secs
}

function section(s) {
    const y = 2024, vrs = nav.d.data.vrs, vry = vrs && vrs[y]
    return vry[s]
}

function roles(sec) {
    const y = 2024, vrs = nav.d.data.vrs, vry = vrs && vrs[y], sa = sections()
    if (!sec || sec === 'None' || sec === 'Section') {
        let rs = []
        sa.forEach(s => {
            rs = rs.concat(Object.keys(vry[s].role))
        })
        return rs
    }
    else return Object.keys(vry[sec].role)
}

function options(el, opts) {
    el.innerHTML = ''
    opts.forEach(t => {
        let o = document.createElement('option');
        o.text = t
        el.add(o)
    })
}

function selectSection(p, sn) {
    const r = p.fe((sn ? sn.charAt(0) : '') + 'role'),
        s = p.fe(sn || 'section')
    options(r, ['Role'].concat(roles(s.value)))
    r.value = 'Role'
}
function selectRole(p, rn) {
    const s = p.fe((rn ? rn.charAt(0) : '') + 'section')
    if (s.value === 'Section') {
        const r = p.fe(rn || 'role'),
            v = r.value,
            i = r.selectedIndex
        s.value = roleMap[i - 1].s
        options(r, ['Role'].concat(roles(s.value)))
        r.value = v
    }
}
function setVol(p, v) {
    ['a', 'j'].forEach(aj => {
        const cn = aj === 'a' ? 'adult' : 'junior', c = p.fe(cn),
            sn = aj + 'section',
            rn = aj + 'role'
        c.checked = v[cn]
        if (v[cn] && v[sn] && v[rn]) {
            const s = p.fe(sn), r = p.fe(rn)
            s.value = v[sn]
            options(r, ['Role'].concat(roles(s.value)))
            r.value = v[rn]
        }
    })
}
export { sections, section, roles, selectSection, selectRole, setVol }