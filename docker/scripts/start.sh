#!/bin/bash
set -e

google-chrome --version
firefox --version

BROWSERTIME=/usr/src/app/bin/browsertime.js

# Here's a hack for fixing the problem with Chrome not starting in time
# See https://github.com/SeleniumHQ/docker-selenium/issues/87#issuecomment-250475864
function chromeSetup() {
  sudo rm -f /var/lib/dbus/machine-id
  sudo mkdir -p /var/run/dbus
  sudo service dbus restart > /dev/null
  service dbus status > /dev/null
  export $(dbus-launch)
  export NSS_USE_SHARED_DB=ENABLED
}

# If we run Chrome on Android, we need to start the ADB server
function setupADB(){
  # Start adb server and list connected devices
  if [ -n "$START_ADB_SERVER" ] ; then
    sudo adb start-server
    sudo adb devices
  fi
}

function runWebPageReplay() {

  RUNS="${RUNS:-5}"
  LATENCY=${LATENCY:-100}
  BROWSER=${BROWSER:-'chrome'}
  HTTP_PORT=80
  HTTPS_PORT=443
  WPR_PATH=/root/go/src/github.com/catapult-project/catapult/web_page_replay_go
  WPR_PARAMS="--path $WPR_PATH --http $HTTP_PORT --https $HTTPS_PORT"

  webpagereplaywrapper record --start $WPR_PARAMS

  if [ $BROWSER = 'chrome' ]
  then
    $BROWSERTIME -b $BROWSER -n 1 --chrome.args host-resolver-rules="MAP *:$HTTP_PORT 127.0.0.1:$HTTP_PORT,MAP *:$HTTPS_PORT 127.0.0.1:$HTTPS_PORT,EXCLUDE localhost" --pageCompleteCheck "return true;" "$@"
  else
    $BROWSERTIME -b $BROWSER -n 1 --firefox.preference network.dns.forceResolve:127.0.0.1 --firefox.acceptInsecureCerts --skipHar --pageCompleteCheck "return true;" "$@"
  fi

  webpagereplaywrapper record --stop $WPR_PARAMS

  webpagereplaywrapper replay --start $WPR_PARAMS

  if [ $BROWSER = 'chrome' ]
  then
    $BROWSERTIME -b $BROWSER -n $RUNS --chrome.args host-resolver-rules="MAP *:$HTTP_PORT 127.0.0.1:$HTTP_PORT,MAP *:$HTTPS_PORT 127.0.0.1:$HTTPS_PORT,EXCLUDE localhost" --video --speedIndex --pageCompleteCheck "return true;" --connectivity.engine throttle --connectivity.throttle.localhost --connectivity.profile custom --connectivity.latency $LATENCY "$@"
  else
    $BROWSERTIME -b $BROWSER -n $RUNS --firefox.preference network.dns.forceResolve:127.0.0.1 --video --speedIndex --pageCompleteCheck "return true;" --connectivity.engine throttle --connectivity.throttle.localhost --connectivity.profile custom --connectivity.latency $LATENCY --skipHar --firefox.acceptInsecureCerts "$@"
  fi

  webpagereplaywrapper replay --stop $WPR_PARAMS
}


function runBrowsertime(){

  # Inspired by docker-selenium way of shutting down
  function shutdown {
    kill -s SIGTERM ${PID}
    wait $PID
  }

  exec $BROWSERTIME "$@" &

  PID=$!

  trap shutdown SIGTERM SIGINT
  wait $PID
}

chromeSetup
setupADB

if [ $REPLAY ]
then
  runWebPageReplay $@
else
  runBrowsertime $@
fi
