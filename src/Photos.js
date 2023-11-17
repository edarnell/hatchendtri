import Html, { debug, nav } from './Html'

class Photos extends Html {
    constructor(p) {
        super(p.p, p.name, p.param)
        this.close = () => p.close()
        this.data = 'photos'
    }
    html = (p, n) => {
        debug({ photos: this, p, n })
        if (p === 'ps') return this.photos(n)
        else return `<div class="card fit">
            <div class="card-header">
            {link.close.×}
                <span class="title">Pinner Camera Club Photos</span>
            </div>
            <div class="card-body">
            <div id="ps_${n}">{div.ps.${n}}</div>
            </div>`
    }
    image = (n, p) => {
        //debug({ image: this, n, p })
        const photos = nav.d.data.photos[n]
        return { tip: `enlarge`, class: this.pn ? 'photo' : 'thumb', click: this.photo, src: `Identified/${photos[p]}` }
    }
    photo = (e, o) => {
        const { name, param } = o
        debug({ photo: this, name, param })
        this.pn = this.pn ? null : { name, param }
        this.reload(`ps_${name}`)
    }
    photos = (n) => {
        const photos = nav.d.data.photos[n]
        if (this.pn) return `{img.${this.pn.name}.${this.pn.param}}`
        else return photos.map((p, i) => `{img.${n}.${i}}
        ${(i + 1) % 4 === 0 ? '<br />' : ''}`).join('')
    }
}
export default Photos