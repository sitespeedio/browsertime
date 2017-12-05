#!/bin/bash
set -e

google-chrome --version

echo 'Use Browsertime with WebPageReplay. Chrome only at the moment'

RUNS="${RUNS:-5}"
LATENCY=${LATENCY:-100}

webpagereplaywrapper record --start --path /root/go/src/github.com/catapult-project/catapult/web_page_replay_go

/usr/src/app/bin/browsertime.js --chrome.args host-resolver-rules="MAP *:80 127.0.0.1:8080,MAP *:443 127.0.0.1:8081,EXCLUDE localhost" -n 1 --pageCompleteCheck "return true;" "$@"

webpagereplaywrapper record --stop --path /root/go/src/github.com/catapult-project/catapult/web_page_replay_go

webpagereplaywrapper replay --start --path /root/go/src/github.com/catapult-project/catapult/web_page_replay_go

/usr/src/app/bin/browsertime.js --chrome.args host-resolver-rules="MAP *:80 127.0.0.1:8080,MAP *:443 127.0.0.1:8081,EXCLUDE localhost" -n $RUNS --video --speedIndex --pageCompleteCheck "return true;" --connectivity.engine throttle --connectivity.throttle.localhost --connectivity.profile custom --connectivity.latency $LATENCY "$@"

webpagereplaywrapper replay --stop --path /root/go/src/github.com/catapult-project/catapult/web_page_replay_go
