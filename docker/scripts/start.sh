#!/bin/bash
set -e

google-chrome-stable --version
firefox --version

exec /usr/src/app/bin/browsertime.js "$@"
