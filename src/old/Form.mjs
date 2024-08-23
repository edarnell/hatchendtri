setForm = (e, o) => {
    if (vs) Object.keys(vs).filter(k => !form || form[k]).forEach(k => {
        const fe = this.querySelector(`ed-form[name=${k}]`),
            l = fe && fe.querySelector('input, select, textarea')
        if (l) {
            if (l.type === 'checkbox' || l.type === 'radio') l.checked = vs[k]
            else l.value = vs[k]
        }
        else debug({ setForm: this.o(), k })
    })
    else debug({ setForm: this.o(), vs })
}
getForm = (form) => {
    let ret = {}
    if (form) Object.keys(form).forEach(name => {
        const fe = this.querySelector(`ed-form[name=${name}]`),
            l = fe && fe.querySelector('input, select, textarea')
        if (l) ret[name] = l.type === 'checkbox' || l.type === 'radio' ? l.checked : l.value
    })
    else debug({ getForm: form })
    return ret
}