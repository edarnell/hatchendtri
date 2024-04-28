import { f, save } from '../zip.mjs'
const debug = console.log.bind(console)
const roles = f('roles/roles.json', true)
debug({ roles })
save('vrs', { '2024': roles.data })