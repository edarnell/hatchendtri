import Div from './Div'
import TT from './TT'
import Form from './Form'
import Table from './Table'

function custom_html() {
    customElements.define("ed-div", Div)
    customElements.define("ed-tt", TT)
    customElements.define("ed-form", Form)
    customElements.define("ed-table", Table)
}

export { custom_html }
