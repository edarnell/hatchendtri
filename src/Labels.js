import instruct from './html/instruct.html'

function labels(cs) {
  let labels = []
  if (!cs) {
    for (var i = 0; i < 14; i++) labels.push(instruct)
    return `<div class="labels">${labels.join('')}</div>`
  }
  else {
    let pages = []
    labels = []
    Object.values(cs).sort((x, y) => { return x.n * 1 - y.n * 1 }).forEach((d, i) => {
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

export { labels } 
