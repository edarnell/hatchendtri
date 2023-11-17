const debug = console.log.bind(console)
const error = console.error.bind(console)
import TT from './TT'

class Img extends TT {
    constructor(p, type, name, param) {
        super(p, type, name, param, true)
        this.id = 'Img_' + name + '_' + param
        const f = this.p._p('image')
        this.lk = f && f(name, param)
        if (!this.lk) error({ Img: this, f, name, param })
        else (p.img || (p.img = {}))[this.id] = this
    }
    html = () => {
        const { lk, name, param, id } = this
        //debug({ lk, name, param })
        return `<img id="${id}" class="${lk.class}" src="${lk.src}" />`
    }
}
export default Img