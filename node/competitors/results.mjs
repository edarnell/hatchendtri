// Map the following files in the given format
// 2024A.csv 2024C.csv 2024T1.csv 2024T2.csv 2024T3.csv 2024TS.csv 2024Y.csv
//Net Pos,Race No,Name,Net Time,Category,Net Cat Pos,Second Cat,Gender,Net Gender Pos,Club,SWIM,T1,BIKE,T2,RUN
// 1,166,Mike MILLAR,00:49:47,30-39,1,Ages 35-39,Open,1,Hillingdon Triathletes,00:07:36,00:00:43,00:29:23,00:00:41,00:11:20
// to a 2024 results entry in the given format
//  [ [ '2024', - year
// [ [ 'Pos', 'Name', 'MF', 'Cat', 'Total', 'Swim', 'Bike', 'Run', 'Club', 'T1', 'T2' ], - headings
// [ '10', 'Peyton Brown', 'F', 'TS', '00:16:29.17', '00:04:23', '00:06:42', '00:03:16', '', '00:01:29', '00:00:36' ], - rows
// Adult Cat SY up to 17-19,S1 20-24,S2 25-29,S3 30-34,S4 35-39,V1 40-44,V2 45-49,V3 50-59,V4 60+
import fs from 'fs'
import csv from 'csv-parser'
import { fz, save } from '../zip.mjs'
const debug = console.log.bind(console)

const files = ['2024A.csv', '2024T1.csv', '2024T2.csv', '2024T3.csv', '2024TS.csv', '2024Y.csv']

const catA = {
    "SY": "Under 20",
    "S1": "Ages 20-24",
    "S2": "Ages 25-29",
    "S3": "Ages 30-34",
    "S4": "Ages 35-39",
    "V1": "Ages 40-44",
    "V2": "Ages 45-49",
    "V3": "Ages 50-59",
    // No direct mapping for V4 - 60+ catch-all
}

const MF = {
    "Female": "F",
    "Open": "O" // generally male
}

async function yrs(files) {
    const data = []
    for (const f of files) {
        const ag = f.substring(4, f.indexOf('.csv')) // Extracts the Age Group bit after "2024"
        await new Promise((resolve, reject) => {
            const results = []
            fs.createReadStream(f)
                .pipe(csv())
                .on('data', (r) => {
                    const { 'Net Pos': p, 'Race No': n, Name: name, Gender: mf, 'Net Time': time, SWIM: swim, BIKE: bike, RUN: run, Club: club, T1, T2, 'Second Cat': sc } = r,
                        cat = ag === 'A' ? catA[sc] || 'V4' : ag; // Age Group
                    results.push([p || '', n || '', name || '', MF[mf] || '', cat || '', time || '', swim || '', bike || '', run || '', club || '', T1 || '', T2 || ''])
                })
                .on('end', () => {
                    data.push(...results)
                    resolve()
                })
                .on('error', reject)
        })
    }
    debug({ yrs: data.length })
    return data
}

async function r(files) {
    const data = await yrs(files)
    const r = fz(`../gz/results.gz`)
    r[2024] = [['Pos', '#', 'Name', 'MF', 'Cat', 'Total', 'Swim', 'Bike', 'Run', 'Club', 'T1', 'T2'], ...data]
    save('results', r)
}

// Call saveResults with your files array
r(files).catch(console.error)