import Div from './Div'
import TT from './TT.mjs'
import Form from './Form'
import Table from './Table.mjs'
import Var from './Var'

function custom_html() {
    customElements.define("ed-div", Div)
    customElements.define("ed-tt", TT)
    customElements.define("ed-form", Form)
    customElements.define("ed-table", Table)
    customElements.define("ed-var", Var)
}

export { custom_html }
