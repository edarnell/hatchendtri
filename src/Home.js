import Html from './Html'
import home from './html/Home/Home.html'
import css from './css/Home.css'
import intro from './html/Home/intro.html'
import science from './html/Home/science.html'
import implications from './html/Home/implications.html'
import collaboration from './html/Home/collaboration.html'
import philosophy from './html/Home/philosophy.html'
import atom from './html/Home/atom.html'
import friends from './html/Home/friends.html'
import wavefunc from './html/Home/wavefunc.html'
import wireframe from './res/wireframe.png'

const replace = {
    intro,
    science,
    implications,
    collaboration,
    atom,
    philosophy,
    wireframe,
    wavefunc,
    friends
}

const links = {
    github: { text: 'GitHub', href: 'https://github.com/freemaths/freemaths', tip: 'a repository used to share software' },
    researchgate: { text: 'ResearchGate', href: 'https://www.researchgate.net/profile/Ed-Darnell/research', tip: 'a forum used to discuss research' },
    chatgpt: { text: 'ChatGPT', href: 'https://chat.openai.com/chat', tip: 'online AI to answer any question' },
    copilot: { text: 'Copilot', href: 'https://chat.openai.com/chat', tip: 'specialised AI for computer programmers' },
    AI: { text: 'AI', href: 'https://en.wikipedia.org/wiki/Artificial_intelligence', tip: 'the machine-learning branch of computing' },
    wavefunc: { text: 'wave function', tip: replace.wavefunc, placement: 'left', theme: 'light' },
    wage_slavery: { text: 'wage slavery', tip: 'wage slavery wkipedia link', href: 'https://en.wikipedia.org/wiki/Wage_slavery' },
    champions_league: { text: 'Champions League', tip: 'Champions League wikipedia link', href: 'https://en.wikipedia.org/wiki/UEFA_Champions_League' },
    ce: { text: 'CE', tip: 'CE wikipedia link', href: 'https://en.wikipedia.org/wiki/Common_Era' },
    milky_way: { text: 'Milky Way', tip: 'Milky Way wikipedia link', href: 'https://en.wikipedia.org/wiki/Milky_Way' },
    speak_truth_to_power: { text: 'speak truth to power', tip: 'speak truth to power wikipedia link', href: 'https://en.wikipedia.org/wiki/Speak_truth_to_power' },
    quantum_mechanics: { text: 'Quantum mechanics', tip: 'quantum mechanics wikipedia link', href: 'https://en.wikipedia.org/wiki/Quantum_mechanics' },
    general_relativity: { text: 'general relativity', tip: 'general relativity wikipedia link', href: 'https://en.wikipedia.org/wiki/General_relativity' },
    friends: { text: 'friends', tip: friends },
}

class Home extends Html {
    constructor() {
        super(home, css, replace, links)
    }
}
export default Home