import Html, { debug, page, nav, _s } from './Html'
import instruct from './html/instruct.html'

class Labels extends Html {
  constructor() {
    super()
    this.data = 'cs'
  }
  html(o) {
    if (!o) return '{div.labels}'
    else if (o.attr().name === 'labels') {
      let labels = []
      if (!page.cs) {
        for (var i = 0; i < 14; i++) labels.push(instruct)
        return `<div class="labels">${labels.join('')}</div>`
      }
      else {
        let pages = []
        labels = []
        Object.values(page.cs).sort((x, y) => { return x.n * 1 - y.n * 1 }).forEach((d, i) => {
          if (labels.length && i % 14 === 0) {
            pages.push(`<div class="labels page-break">${labels.join('')}</div>`)
            labels = []
          }
          labels.push(`<div class="label" key={i++}><div clas="big">${d.first} ${d.last}</div><div class="huge">${d.n}</div>${d.ageGroup}<br />${d.start}</div>`)
        })
        if (labels.length) pages.push(`<div class="labels page-break">${labels.join('')}</div>`)
        return pages.join('')
      }
    }
  }
}

export default Labels
