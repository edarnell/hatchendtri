deployDist.bat
deployNode.bat
scp -i ../.ssh/epdarnell.pem ubuntu@ec2.freemaths.uk:/var/www/hatchendtri/node/gz/*.gz node/live
scp -i ../.ssh/epdarnell.pem node/gz/*.gz ubuntu@ec2.freemaths.uk:/var/www/hatchendtri/node/gz