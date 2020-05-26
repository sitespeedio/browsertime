#!/bin/bash
set -eu

# This is the test script running on the test server

sudo modprobe ifb numifbs=1

while true
do
    git pull
    docker run --rm -v "$(pwd)":/browsertime sitespeedio/browsertime-autobuild https://www.sitespeed.io/ --cpu --connectivity.engine throttle -c cable
    docker run --shm-size 2g --rm -v "$(pwd)":/browsertime sitespeedio/browsertime-autobuild https://www.sitespeed.io/ -b firefox --firefox.geckoProfiler --connectivity.engine throttle -c cable
    rm -fR browsertime-results
    delay 120 
done
