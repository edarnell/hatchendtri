import Div from './Div'
import TT from './TT'
import Form from './Form'
import Table from './Table'
import Var from './Var'
import Popup from './Popup'

function custom_html() {
    customElements.define("ed-div", Div)
    customElements.define("ed-tt", TT)
    customElements.define("ed-popup", Popup)
    customElements.define("ed-form", Form)
    customElements.define("ed-table", Table)
    customElements.define("ed-var", Var)
}

export { custom_html }
