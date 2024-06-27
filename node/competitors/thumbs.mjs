import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const inDir = './juniors'
const outDir = './thumbs'

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir)
}

fs.readdir(inDir, (err, files) => {
    if (err) {
        console.error('Error:', err)
        return
    }

    files.forEach(f => {
        if (path.extname(f).toLowerCase() === '.jpg') {
            const inF = path.join(inDir, f)
            const outF = path.join(outDir, f)

            sharp(inF)
                .resize(150, 100, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 1 } // Black background
                })
                .toFile(outF, err => {
                    if (err) {
                        console.error('Error:', f, err)
                    } else {
                        console.log('Done:', f)
                    }
                })
        }
    })
})

