import Html, { debug, nav } from './Html'

class AdminResults extends Html {
    constructor(p, name) {
        super(p, name)
        nav.d.get(['results', '2023C.csv', '2023R.csv']).then(r => {
            this.reload()
        })
    }
    html = () => {
        return '<h3>Admin Results</h3>'
    }
}

export default AdminResults