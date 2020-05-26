#!/bin/bash
set -eu

# This is the test script running on the test server

sudo modprobe ifb numifbs=1

FIREFOX_SETTINGS="-b firefox --firefox.geckoProfiler --firefox.windowRecorder"
CHROME_SETTINGS="--cpu"

while true
do
    git pull
    docker pull sitespeedio/browsertime-autobuild
    docker run --cap-add=NET_ADMIN --rm -v "$(pwd)":/browsertime sitespeedio/browsertime-autobuild https://www.sitespeed.io/ --connectivity.engine throttle -c cable $CHROME_SETTINGS
    docker run --cap-add=NET_ADMIN --shm-size 2g --rm -v "$(pwd)":/browsertime sitespeedio/browsertime-autobuild https://www.sitespeed.io/  --connectivity.engine throttle -c cable $FIREFOX_SETTINGS
    rm -fR browsertime-results
    sleep 180 
done
