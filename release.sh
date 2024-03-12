#!/bin/bash
set -e
# Super simple release script for browsertime
# Lets use it it for now and make it better over time :)
# You need np for this to work
# npm install --global np

# Remove the node modules and the result dir to start clean
rm -fR browsertime-results

# Genereate types
npm run tsc

np $* --no-yarn

bin/browsertime.js --help > ../sitespeed.io/docs/documentation/browsertime/configuration/config.md

bin/browsertime.js --version | tr -d '\n' > ../sitespeed.io/docs/_includes/version/browsertime.txt