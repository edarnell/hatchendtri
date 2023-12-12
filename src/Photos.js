import Html, { debug, error, nav } from './Html'
import { ajax } from './ajax'

class PhotosP extends Html {
    constructor(p, name, param) {
        super(p, name, param)
        this.pn = null
        const y = this.name, n = this.param
        ajax({ req: 'photo', get: { y, n } }).then(r => {
            this.ps = r.ps
            this.pp = r.pp
            this.reload(`ps_${y}_${n}`)
        }).catch(e => error(e))
    }
    html = (p) => {
        const y = this.name, n = this.param
        if (p === 'ps') return this.ps ? this.photos() : ''
        else return `<div class="card fit">
            <div class="card-header">
            {link.close.×}
                <span class="title">{link.Pinner_Camera_Club} Photos</span>
            </div>
            <div class="card-body">
            <div id="ps_${y}_${n}">{div.ps.${y}_${n}}</div>
            </div>`
    }
    link = (n, p) => {
        if (n === 'photo') return { class: "photolink", body: () => this.image(p, 'photo'), tip: 'minimise', click: () => this.photo(p) }
        else if (n === 'thumb') return { class: "photolink", body: () => this.image(p, 'thumb'), tip: 'enlarge', click: () => this.photo(p) }
    }
    image = (pn, c) => {
        const y = this.name, ps = this.ps,
            aws = 'https://hatchend.s3.eu-west-1.amazonaws.com',
            tn = c === 'thumb',
            src = tn ? `${aws}/${y}/thumbs/${ps[pn]}` : `${aws}/${y}/${ps[pn]}`,
            img = `<img class="${c}" src="${src}" />`
        return tn && this.pub(pn) ? `<span class="pub">${img}</span>` : img
    }
    pub = () => false
    photo = (p) => {
        const y = this.name, n = this.param
        if (this.pn) this.pn = null
        else this.pn = p
        this.reload(`ps_${y}_${n}`)
    }
    close = () => this.popup.close(null, this.updated)
    instruct = () => ''
    photos = () => {
        const ps = this.ps
        if (ps.length === 1) this.pn = 0
        let ret
        if (this.pn !== null) ret = `{link.photo.${this.pn}}`
        else ret = ps.map((p, i) => `{link.thumb.${i}}
        ${(i + 1) % 4 === 0 ? '<br />' : ''}`).join('')
        return `${this.instruct()}${ret}`
    }
}

class Photos extends PhotosP {
    constructor(p, name, param) {
        super(p, name, param)
    }
    form = () => {
        const form = {
            public: { tip: 'make public', click: this.public, checked: this.pub(this.pn) },
        }
        return form
    }
    public = () => {
        const y = this.name, n = this.param, ps = this.ps, pn = ps[this.pn]
        ajax({ req: 'photo', public: { y, n, pn } }).then(r => {
            nav.d.saveZip('photos', r.photos)
            this.ps = r.ps
            this.pp = r.pp
            this.reload(`ps_${y}_${n}`)
            this.updated = true
        }).catch(e => error(e))
    }
    close = () => {
        //debug({ close: this.updated })
        this.popup.close(null, this.updated)
    }
    pub = (pn) => {
        const ps = this.ps, p = ps && ps[pn], pp = this.pp
        return p && pp && pp.includes(p)
    }
    instruct = () => {
        return this.pn ? 'Click to minimise or right click to download. Tick {checkbox.public} to save and make public.'
            : 'Click on thumbnails to enlarge where you can download or save and make public.'
    }
}
export { PhotosP }
export default Photos