function ajx(req, cI) // token used when state not yet set
{
    return new Promise((s, f) => {
        let ok
        fetch(cI.ajax || '/ajax', params(req, cI)).then(res => {
            ok = res.ok
            return res.json()
        }).then(r => {
            if (ok) s(r)
            else if (r.reload) {
                const now = new Date()
                if (!cI.ts || now.getTime() - new Date(cI.ts).getTime() > 60000) location.reload(true)
                else f(r)
            }
            else f(r)
        }).catch(e => f(e))
    })
}
function params(data, cI) {
    const ret = {
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            'cI': JSON.stringify(cI)
        },
        method: 'post',
        cache: 'no-cache',
        body: JSON.stringify(data)
    }
    return ret
}

export { ajx }
