import Html, { debug, error, nav } from './Html'
import { ajax } from './ajax'

class PhotosP extends Html {
    constructor(p) {
        super(p.p, p.name, p.param)
        this.pn = null
    }
    html = (p, n) => {
        if (p === 'ps') return this.photos()
        else return `<div class="card fit">
            <div class="card-header">
            {link.close.×}
                <span class="title">{link.Pinner_Camera_Club} Photos</span>
            </div>
            <div class="card-body">
            <div id="ps_${this.param}">{div.ps.${this.param}}</div>
            </div>`
    }
    link = (n, p) => {
        if (n === 'photo') return { class: "photolink", body: () => this.image(p, 'photo'), tip: 'minimise', click: () => this.photo(p) }
        else if (n === 'thumb') return { class: "photolink", body: () => this.image(p, 'thumb'), tip: 'enlarge', click: () => this.photo(p) }
    }
    image = (pn, c) => {
        const [y, n] = this.param.split('_'),
            ps = this.ps(y, n),
            tn = c === 'thumb',
            src = tn ? `/photos/${y}/thumbs/${ps[pn]}` : `/photos/${y}/${ps[pn]}`,
            img = `<img class="${c}" src="${src}" />`
        return this.pub(pn) ? `<span class="pub">${img}</span>` : img
    }
    pub = () => false
    photo = (n) => {
        if (this.pn) this.pn = null
        else this.pn = n
        this.reload(`ps_${this.param}`)
    }
    close = () => this.popup.close(null, this.updated)
    ps = (y, p) => this.p._p('ps')('ps', y, p)
    instruct = () => ''
    photos = () => {
        const [y, p] = this.param.split('_'), ps = this.ps(y, p)
        if (ps.length === 1) this.pn = 0
        let ret
        if (this.pn !== null) ret = `{link.photo.${this.pn}}`
        else ret = ps.map((p, i) => `{link.thumb.${i}}
        ${(i + 1) % 4 === 0 ? '<br />' : ''}`).join('')
        return `${this.instruct()}${ret}`
    }
}

class Photos extends PhotosP {
    constructor(p) {
        super(p)
    }
    form = () => {
        const form = {
            public: { tip: 'make public', click: this.public, checked: this.pub(this.pn) },
        }
        return form
    }
    public = () => {
        const [y, n] = this.param.split('_'), ps = this.ps(y, n), pn = ps[this.pn]
        ajax({ req: 'photo', public: { y, n, pn } }).then(r => {
            nav.d.saveZip({ ps: r.ps })
            this.reload(`ps_${this.param}`)
            this.updated = true
        }).catch(e => error(e))
    }
    close = () => {
        debug({ close: this.updated })
        this.popup.close(null, this.updated)
    }
    pub = (pn) => {
        const [y, n] = this.param.split('_'), ps = this.ps(y, n), p = ps[pn],
            pp = this.p._p('ps')('ps', y, n)
        return p && pp.includes(p)
    }
    ps = (y, n) => this.p._p('ps')('photos', y, n)
    instruct = () => {
        return this.pn ? 'Click to minimise or right click to download. Tick {checkbox.public} to save and make public.'
            : 'Click on thumbnails to enlarge where you can download or save and make public.'
    }
}
export { PhotosP }
export default Photos