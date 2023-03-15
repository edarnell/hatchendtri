import Html from './Html'
import home from './html/Home.html'
import css from './css/Home.css'
const debug = console.log.bind(console)

const replace = {}
const links = {
    pool: { text: 'Pool', tip: 'Hatch End pool website', href: 'https://www.everyoneactive.com/centre/hatch-end-swimming-pool/' },
    HA5_4EA: { text: 'HA5 4EA', tip: 'Google maps link', href: 'https://www.google.com/maps/place/Uxbridge+Rd,+Pinner+HA5+4EA' },
    jetstream: { text: 'Jetstream', tip: 'Jetstream triathlon club', href: 'https://jetstreamtri.com' },
    bt: { text: 'British Triathlon', tip: 'British Triathlon website', href: 'https://www.britishtriathlon.org' },
    rules: { text: 'rules', tip: 'British Triathlon rules', href: 'https://www.britishtriathlon.org/competitionrules' },
    age8_16: { text: '8-16', tip: 'age on 31 December 2023 not now or race date' },
    enter: { text: 'ENTER NOW', tip: 'Entry Central - hatchend', href: 'https://www.entrycentral.com/hatchend', class: 'enter-button' }
}

class Home extends Html {
    constructor() {
        super(home, css, replace, links)
    }
}
export default Home