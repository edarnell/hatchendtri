import { createPopper } from '@popperjs/core'
const debug = console.log.bind(console)
const arrow_px = 10

function tooltip(l, link) {
    const tt = document.createElement('div'),
        arrow = document.createElement('div')
    tt.id = 'tooltip'
    arrow.id = 'arrow'
    tt.name = arrow.name = l.id
    tt.innerHTML = link.tip
    tt.setAttribute('data-theme', link.theme || 'dark')
    arrow.setAttribute('data-popper-arrow', true)
    tt.appendChild(arrow)
    document.body.appendChild(tt)
    const pop = createPopper(l, tt, {
        placement: link.placement || 'top',
        modifiers: [{ name: 'offset', options: { offset: [0, 8], }, },],
    })
    // debug({ Tooltip: { l, link, tt, pop } })
    tt.setAttribute('data-show', '')
}

function removeTooltip(timeout = 500) {
    const tt = document.getElementById('tooltip'),
        a = document.getElementById('arrow')
    if (a && tt && a.name === tt.name) {
        // debug({ removeTooltip: tt.name })
        a.remove()
        tt.remove()
    }
    else debug({ error: { t, a } })
}

export { tooltip, removeTooltip }