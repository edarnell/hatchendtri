import email from './icon/email.svg'
import logout from './icon/logout.svg'
import email_active from './icon/email_active.svg'
import jetstream from './icon/jetstream.svg'
const icons = {
    logout: { default: logout, active: logout },
    email: { default: email, active: email_active },
    jetstream: { default: jetstream, active: jetstream, href: 'https://jetstreamtri.com/', class: 'logo', tip: 'Jetstream triathlon club' }
}
export { icons }