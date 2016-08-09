#!/bin/bash
bin/browsertime.js https://www.sitespeed.io --connectivity.profile cable -n 1
bin/browsertime.js http://www.aftonbladet.se --connectivity.profile cable -n 1
bin/browsertime.js https://www.sitespeed.io --connectivity.profile 3g -n 1
