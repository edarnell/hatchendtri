import Html, { debug, nav } from './Html'

class AdminResults extends Html {
    constructor(p, name) {
        super(p, name)
        nav.d.get(['results', '2023C.csv', '2023R.csv']).then(r => {
            this.reload()
        })
    }
    html = () => {
        const r=nav.d.data['results'],c23=nav.d.data['2023C.csv'],r23=nav.d.data['2023R.csv']
        debug({r,c23,r23})
        return '<h3>Admin Results</h3>'
    }
}

export default AdminResults