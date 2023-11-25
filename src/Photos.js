import Html, { debug, error, nav } from './Html'
import { ajax } from './ajax'

class Photos extends Html {
    constructor(p) {
        super(p.p, p.name, p.param)
        this.close = () => p.close()
        this.data = 'photos'
    }
    form = () => {
        const form = {
            public: { tip: 'make public', click: this.public },
        }
        return form
    }
    public = (e, o) => {
        const { y, n, pn } = this.pn
        debug({ public: { y, n, pn } })
        ajax({ req: 'photo', public: { y, n, pn } }).then(r => {
            debug({ r })
        }).catch(e => error(e))
    }
    html = (p, n) => {
        if (p === 'ps') return this.photos(n)
        else return `<div class="card fit">
            <div class="card-header">
            {link.close.×}
                <span class="title">{link.Pinner_Camera_Club} Photos</span>
            </div>
            <div class="card-body">
            <div id="ps_${n}">{div.ps.${n}}</div>
            </div>`
    }
    image = (n, i) => {
        if (this.pn) {
            const { y, n, pn } = this.pn
            return { tip: 'thumnails', class: 'photo', click: this.photo, src: `/photos/${y}/${pn}` }
        }
        else {
            const [y, p] = n.split('_'), ps = nav.d.data.photos[y][p]
            return { tip: 'enlarge', class: 'thumb', click: this.photo, src: `/photos/${y}/thumbs/${ps[i]}` }
        }
    }
    photo = (e, o) => {
        const { name, param } = o, [y, n] = name.split('_'),
            ps = nav.d.data.photos[y][n], pn = ps[param]
        //debug({ photo: this, name, param, y, n, pn })
        this.pn = this.pn ? null : { y, n, pn }
        this.reload(`ps_${name}`)
    }
    photos = (n) => {
        const [y, p] = n.split('_'), ps = nav.d.data.photos[y][p]
        let ret
        if (this.pn) ret = `{img.${this.pn.name}.${this.pn.param}}`
        else ret = ps.map((p, i) => `{img.${n}.${i}}
        ${(i + 1) % 4 === 0 ? '<br />' : ''}`).join('')
        return `<div>${this.pn ? 'Click to minimise or right click to download. Tick {checkbox.public} to save and make public.' : 'Click on thumbnails to enlarge where you can download or save and make public.'}</div>
        ${ret}`

    }
}
export default Photos