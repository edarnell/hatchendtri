import Results from './Results'
import { debug, error, nav } from './Html'
import { str2csv } from './CSV'
import { ajax } from './ajax'
import { zip } from './unzip'
import { Buffer } from 'buffer'

class AdminResults extends Results {
    constructor(p, name) {
        super(p, name)
        this.data = ['results', 'cs', '2023C.csv', '2023R.csv', 'photos']
        p.div[name] = this
    }
    loaded = () => {
        const cs = nav.d.data.cs, cats = {}, ns = {},
            res = str2csv(nav.d.data['2023R.csv']),
            r = nav.d.data.results,
            ags = {
                "Tristars Start": "TS",
                "Tristars 1": "T1",
                "Tristars 2": "T2",
                "Tristars 3": "T3",
                "Youths": "Y",
                "M16-19": "SY",
                "M20-24": "S1",
                "M25-29": "S2",
                "M30-34": "S3",
                "M35-39": "S4",
                "M40-44": "V1",
                "M45-49": "V2",
                "M50-54": "V2",
                "M55-59": "V3",
                "M60-64": "V4",
                "M65+": "V4",
                "F20-24": "S1",
                "F25-29": "S2",
                "F30-34": "S3",
                "F35-39": "S4",
                "F40-44": "V1",
                "F45-49": "V2",
                "F50-54": "V2",
                "F55-59": "V3",
                "F60-64": "V4"
            }
        res[0] = ['Pos', '#', 'Name', 'Total', 'Cat', 'Cat Pos', 'MF', 'Gen Pos', 'Swim', 'T1', 'Bike', 'T2', 'Run', 'Club']
        Object.keys(cs).forEach(i => ns[cs[i].n] = i)
        res.slice(1).forEach(r => {
            const i = ns[r[1]], cat = r[4], club = i && cs[i].club
            if (i) {
                r[4] = ags[cat]
                r.push(club || '')
            }
            else error('no cs', r)
        })
        r[2023] = res
    }
    photos = (year, num) => {
        const photos = nav.d.data.photos
        return (photos && year === '2023' && photos[num]) ? `{link.photos.${num}}` : null
    }
    link = (name, param) => {
        if (name === 'year') return { tip: `${param.replace(/_/g, " ")} all results`, click: this.year }
        else if (name === 'name') return { tip: `${param.replace(/_/g, " ")} all results`, click: this.name }
        else if (name === 'photos') {
            const photos = nav.d.data.photos[param]
            return { popup: 'Photos', placement: 'auto', icon: 'photo', tip: `${photos.length} photos` }
        }
        else debug({ link: { name, param } })
    }
    rendered = () => {
        const save = this.p.fe('save')
        debug({ AdminResults: this, save })
    }
    save = (e, o) => {
        debug({ AdminResults: this, e, o })
        const r = zip(nav.d.data.results[2023]),
            base64 = Buffer.from(r).toString('base64'),
            results = JSON.stringify(base64)
        debug({ save: r.length, json: results.length })
        ajax({ req: 'save', zips: { results } }).then(r => {
            debug({ r })
        }).catch(e => error(e))
    }
    /*
    html = () => {
        return '{link.2023C} {link.2023R}'
    }
    link = (n) => {
        //debug({ link: this, n })
        if (n !== 'close') return { popup: 'CSV', tip: 'view CSV', placement: 'bottom' }
    }
    */

}

export default AdminResults