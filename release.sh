#!/bin/bash
set -e
# Super simple release script for browsertime
# Lets use it it for now and make it better over time :)
# You need np for this to work
# npm install --global np

# Remove the node modules and the result dir to start clean
rm -fR browsertime-results

bin/browsertime.js --help > ../sitespeed.io/docs/documentation/browsertime/configuration/config.md

docker login

np $* --no-yarn

PACKAGE_VERSION=$(node -e 'console.log(require("./package").version)')

docker build --no-cache -t sitespeedio/browsertime:${PACKAGE_VERSION} -t sitespeedio/browsertime:latest .

docker push sitespeedio/browsertime:${PACKAGE_VERSION}
docker push sitespeedio/browsertime:latest

bin/browsertime.js --version | tr -d '\n' > ../sitespeed.io/docs/_includes/version/browsertime.txt

docker build -f Dockerfile.wpr --no-cache -t sitespeedio/browsertime:${PACKAGE_VERSION}-wpr-alpha .
docker push sitespeedio/browsertime:${PACKAGE_VERSION}-wpr-alpha
