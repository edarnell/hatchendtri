import { custom_pages } from './Page'
import css from './css/combined.css'
import favicon from './icon/jetstream.ico'

const link = document.createElement('link');
link.rel = 'shortcut icon';
link.href = favicon;
link.type = 'image/x-icon';
document.head.appendChild(link);

const style = document.createElement('style')
style.innerHTML = css
document.head.appendChild(style)
custom_pages()
const root = document.querySelector('#root')
root.innerHTML = '<ed-nav name="nav"></ed-nav><ed-page name="page"></ed-page>'
