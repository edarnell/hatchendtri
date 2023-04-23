scp -i ../.ssh/epdarnell.pem dist/* ubuntu@ec2.freemaths.uk:/var/www/hatchendtri/public
scp -i ../.ssh/epdarnell.pem node/hatchend.mjs ubuntu@ec2.freemaths.uk:/var/www/hatchendtri/node
scp -i ../.ssh/epdarnell.pem node/utils.mjs ubuntu@ec2.freemaths.uk:/var/www/hatchendtri/node
scp -i ../.ssh/epdarnell.pem node/zip.mjs ubuntu@ec2.freemaths.uk:/var/www/hatchendtri/node
scp -i ../.ssh/epdarnell.pem node/mail.mjs ubuntu@ec2.freemaths.uk:/var/www/hatchendtri/node
scp -i ../.ssh/epdarnell.pem node/mail.html ubuntu@ec2.freemaths.uk:/var/www/hatchendtri/node
scp -i ../.ssh/epdarnell.pem node/package.json ubuntu@ec2.freemaths.uk:/var/www/hatchendtri/node
# scp -i ../.ssh/epdarnell.pem node/config.json ubuntu@ec2.freemaths.uk:/var/www/hatchendtri/node
# scp -i ../.ssh/epdarnell.pem node/gz/*.gz ubuntu@ec2.freemaths.uk:/var/www/hatchendtri/node/gz
scp -i ../.ssh/epdarnell.pem node/gz/v2023.gz ubuntu@ec2.freemaths.uk:/var/www/hatchendtri/node/gz