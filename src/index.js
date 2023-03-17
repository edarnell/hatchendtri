import Nav from './Nav'
import css from './css/tooltip.css'
import favicon from './res/jetstream.ico';

const link = document.createElement('link');
link.rel = 'shortcut icon';
link.href = favicon;
link.type = 'image/x-icon';
document.head.appendChild(link);

const style = document.createElement('style')
style.innerHTML = css;
document.head.appendChild(style)

customElements.define('he-nav', Nav)
const nav = document.querySelector('#nav'), n = document.createElement('he-nav')
nav.appendChild(n)