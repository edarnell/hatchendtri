import email from './icon/email.svg'
import user from './icon/user.svg'
import menu from './icon/menu.svg'
import edit from './icon/edit.svg'
import user_active from './icon/user_green.svg'
import email_active from './icon/email_active.svg'
import jetstream from './icon/jetstream.svg'
import save from './icon/save.svg'
import save_red from './icon/save_red.svg'
import photo from './icon/photo.svg'
const icons = {
    photo: { default: photo, active: photo },
    edit: { default: edit, active: edit },
    user: { default: user, active: user_active },
    menu: { default: menu, active: menu },
    save: { default: save, active: save_red },
    email: { default: email, active: email_active },
    jetstream: { default: jetstream, active: jetstream, href: 'https://jetstreamtri.com/', class: 'logo', tip: 'Jetstream triathlon club' }
}
export { icons }