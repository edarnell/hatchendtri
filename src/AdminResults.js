import Html, { debug, nav } from './Html'

class AdminResults extends Html {
    constructor(p, name) {
        super(p, name)
        nav.d.get(['results', '2023C.csv', '2023R.csv']).then(r => {
            this.reload()
        })
    }
    html = () => {
        return '{link.2023C}'
    }
    link = (n) => {
        debug({ link: this, n })
        if (n !== 'close') return { popup: 'CSV', tip: 'view CSV', placement: 'bottom' }
    }

}

export default AdminResults