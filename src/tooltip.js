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
    debug({ Tooltip: { l, link, tt, pop } })
    tt.setAttribute('data-show', '')
    /*const t = document.getElementById('tt')
    debug({ Tooltip: { n, l, t } })
    if (!t || t.name !== l.id) {
        if (t) removeTooltip(t, 0)
        const pos = links[n].pos, text = links[n].tip, color = links[n].color || links[n].href
        const xy = position(l, pos)
        const a = arrow(xy, l, color)
        const tt = createTooltip(text, a, color)
    }*/
}

function removeTooltip(timeout = 500) {
    const tt = document.getElementById('tooltip'),
        a = document.getElementById('arrow')
    if (a && tt && a.name === tt.name) {
        debug({ removeTooltip: tt.name })
        a.remove()
        tt.remove()
    }
    else debug({ error: { t, a } })
}

function createTooltip(text, a, color) {
    const tt = document.createElement('div'),
        pos = a.getAttribute('data-position')
    tt.id = 'tt'
    tt.name = a.name
    tt.innerHTML = text
    tt.style.background = color ? 'black' : "white" //"#333333" : "#ffffff"
    tt.style.color = color ? 'white' : 'black' // "#ffffff" : "#333333"
    //tt.style.border = "1px solid " + color ? 'black' : 'white'; // (color ? "#666666" : "#cccccc")
    tt.style.position = 'absolute'
    tt.style.zIndex = 9998
    tt.style.padding = '0.5rem'
    tt.style.borderRadius = '0.5rem'
    tt.style.boxShadow = '0 0 0.5rem rgba(0, 0, 0, 0.5)'
    tt.style.display = 'inline-block'
    tt.style.maxWidth = '600px'
    tt.style.whiteSpace = 'nowrap';
    tt.style.overflow = 'hidden';
    switch (pos) {
        case 'bottom':
            tt.style.top = '10px'
            tt.style.transform = 'translateX(-50%)';
            break;
        case 'left':
            tt.style.right = '10px'
            tt.style.transform = 'translateY(-50%)';
            break
        case 'right':
            tt.style.left = '10px'
            tt.style.transform = 'translateY(-50%)';
            break;
        default:
        case 'top':
            tt.style.bottom = '10px'
            tt.style.transform = 'translateX(-50%)';
            break;
    }
    a.appendChild(tt)
}

function arrow(xy, l, color) {// #cccccc "#333333"
    color = color ? 'black' : "#cccccc" // "#666666" : "#cccccc"
    const a = document.createElement('div')
    a.id = 'tt_arrow'
    a.name = l.id
    a.style.left = `${xy.x}px`
    a.style.top = `${xy.y}px`
    a.style.width = 0
    a.style.height = 0
    a.style.borderLeft = `${arrow_px}px solid transparent`
    a.style.borderRight = `${arrow_px}px solid transparent`
    a.style.borderTop = `${arrow_px}px solid transparent`
    a.style.borderBottom = `${arrow_px}px solid transparent`
    a.style.position = 'absolute'
    a.style.zIndex = 9999
    switch (xy.pos) {
        case 'bottom':
            a.style.transform = 'translateX(-50%)'
            a.style.borderBottom = `${arrow_px}px solid ${color}`
            break;
        case 'left':
            a.style.transform = 'translateY(-50%)'
            a.style.borderLeft = `${arrow_px}px solid ${color}`
            break
        case 'right':
            a.style.transform = 'translateY(-50%)'
            a.style.borderRight = `${arrow_px}px solid ${color}`
            break;
        default:
        case 'top':
            a.style.transform = 'translateX(-50%)'
            a.style.borderTop = `${arrow_px}px solid ${color}`
            break;
    }
    document.body.appendChild(a)
    if (xy.pos) a.setAttribute('data-position', xy.pos) // used by tt to make match if auto adjusted
    return a
}

function position(ref, pos) {
    const rect = ref.getBoundingClientRect(),
        win = { width: window.innerWidth, height: window.innerHeight }
    if (!pos) {
        if (rect.top < 200) {
            if (rect.left < 200) pos = 'right'
            else if (rect.right > win.width - 200) pos = 'left'
            else pos = 'bottom'
        }
    }
    let x, y
    switch (pos) {
        case 'bottom':
            x = rect.left + rect.width / 2
            y = rect.bottom - arrow_px
            break;
        case 'left':
            x = rect.left - arrow_px
            y = rect.top + rect.height / 2
            break
        case 'right':
            x = rect.right - arrow_px
            y = rect.top + rect.height / 2
            break;
        default:
        case 'top':
            x = rect.left + rect.width / 2
            y = rect.top - arrow_px
            debug({ top: { x, y, pos } })
            break;
    }
    return { x, y, pos }
}

export { tooltip, removeTooltip }