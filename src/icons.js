import email from './icon/email.svg'
import user from './icon/user.svg'
import user_active from './icon/user_green.svg'
import email_active from './icon/email_active.svg'
import jetstream from './icon/jetstream.svg'
const icons = {
    user: { default: user, active: user_active },
    email: { default: email, active: email_active },
    jetstream: { default: jetstream, active: jetstream, href: 'https://jetstreamtri.com/', class: 'logo', tip: 'Jetstream triathlon club' }
}
export { icons }