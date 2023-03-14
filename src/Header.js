import Html from './Html'
import header from './html/Header.html'
import css from './css/Header.css'
import tick from './res/tick.svg'
import notify_red from './res/notify_red.svg'
import notify_green from './res/notify_green.svg'

const links = {
  friendlink: {
    text: `<span class="brand"><img class='tick' src="${tick}" /> Friendlink.<span id='uk'>uk</span></span>`,
    tip: 'link to friends'
  },
  bell: { text: `<img id="bell" class="notification" src="${notify_red}" />`, tip: 'enable notifications', colcor: 'black' },
}

class Header extends Html {
  constructor() {
    super(header, css, null, links)
    const bell = this.shadowRoot.getElementById('bell')
    if (bell) bell.addEventListener('click', () => {
      const uk = this.shadowRoot.getElementById('uk'),
        s = window.getComputedStyle(uk),
        c = s.getPropertyValue('color'),
        red = c === 'rgb(255, 0, 0)'
      uk.style.setProperty('color', red ? 'limegreen' : 'red')
      bell.src = red ? notify_green : notify_red
    })
  }
}

export default Header