import Header from './Header'
import Home from './Home'
import css from './css/index.css'
import tooltipCss from './css/tooltip.css'

const style = document.createElement('style')
style.innerHTML = css;
document.head.appendChild(style)
const ttStyle = document.createElement('style')
style.innerHTML = tooltipCss;
document.head.appendChild(ttStyle)

customElements.define('fl-header', Header)
customElements.define('fl-home', Home)

const app = document.querySelector('#app')
const head = document.createElement('fl-header')
app.appendChild(head)
const home = document.createElement('fl-home')
app.appendChild(home)