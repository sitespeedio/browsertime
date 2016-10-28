 #!/bin/bash
set -e
# Super simple release script for browsertime
# Lets use it it for now and make it better over time :)
# You need np for this to work
# npm install --global np
np $1

PACKAGE_VERSION=$(grep -m1 version package.json | awk -F: '{ print $2 }' | sed 's/[", ]//g')

docker build --no-cache -t sitespeedio/browsertime:$PACKAGE_VERSION -t sitespeedio/browsertime:latest .

docker login

docker push sitespeedio/browsertime:$PACKAGE_VERSION
docker push sitespeedio/browsertime:latest
