#!/bin/bash
set -e

# See https://github.com/SeleniumHQ/docker-selenium/issues/87
export DBUS_SESSION_BUS_ADDRESS=/dev/null

google-chrome --version
firefox --version

BROWSERTIME_RECORD=/usr/src/app/bin/browsertimeWebPageReplay.js
BROWSERTIME=/usr/src/app/bin/browsertime.js

HTTP_PORT=80
HTTPS_PORT=443

CERT_FILE=/webpagereplay/certs/wpr_cert.pem
KEY_FILE=/webpagereplay/certs/wpr_key.pem

SCRIPTS=/webpagereplay/scripts/deterministic.js

if [ -n "$START_ADB_SERVER" ] ; then
  WPR_HTTP_PORT=8080
  WPR_HTTPS_PORT=8081
else
  WPR_HTTP_PORT=80
  WPR_HTTPS_PORT=443
fi

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

    if [ $REPLAY ] ; then
      sudo adb reverse tcp:$WPR_HTTP_PORT tcp:$WPR_HTTP_PORT
      sudo adb reverse tcp:$WPR_HTTPS_PORT tcp:$WPR_HTTPS_PORT
    fi

  fi
}

function runWebPageReplay() {

  function shutdown {
    webpagereplaywrapper replay --stop $WPR_PARAMS
    kill -s SIGTERM ${PID}
    wait $PID
  }

  LATENCY=${LATENCY:-100}
  WPR_PARAMS="--http $WPR_HTTP_PORT --https $WPR_HTTPS_PORT --certFile $CERT_FILE --keyFile $KEY_FILE --injectScripts $SCRIPTS"
  WAIT=${WAIT:-2000}

  declare -i RESULT=0
  webpagereplaywrapper record --start $WPR_PARAMS
  RESULT+=$?

  $BROWSERTIME_RECORD  --firefox.preference network.dns.forceResolve:127.0.0.1 --firefox.acceptInsecureCerts --chrome.args host-resolver-rules="MAP *:$HTTP_PORT 127.0.0.1:$WPR_HTTP_PORT,MAP *:$HTTPS_PORT 127.0.0.1:$WPR_HTTPS_PORT,EXCLUDE localhost" --pageCompleteCheck "return (function() {try { var end = window.performance.timing.loadEventEnd; var start= window.performance.timing.navigationStart; return (end > 0) && (performance.now() > end - start + 5000);} catch(e) {return true;}})()" "$@"
  RESULT+=$?

  webpagereplaywrapper record --stop $WPR_PARAMS
  RESULT+=$?

  if [ $RESULT -eq 0 ]
    then
      webpagereplaywrapper replay --start $WPR_PARAMS

      exec $BROWSERTIME --firefox.acceptInsecureCerts --firefox.preference network.dns.forceResolve:127.0.0.1 --chrome.args host-resolver-rules="MAP *:$HTTP_PORT 127.0.0.1:$WPR_HTTP_PORT,MAP *:$HTTPS_PORT 127.0.0.1:$WPR_HTTPS_PORT,EXCLUDE localhost" --video --speedIndex --pageCompleteCheck "return (function() {try { var end = window.performance.timing.loadEventEnd; var start= window.performance.timing.navigationStart; return (end > 0) && (performance.now() > end - start + 5000);} catch(e) {return true;}})()" --connectivity.engine throttle --connectivity.throttle.localhost --connectivity.profile custom --connectivity.latency $LATENCY "$@" &

      PID=$!

      trap shutdown SIGTERM SIGINT
      wait $PID

      webpagereplaywrapper replay --stop $WPR_PARAMS
    else
      echo "Recording or accessing the URL failed, will not replay" >&2
      exit 1
  fi
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
  runWebPageReplay "$@"
else
  runBrowsertime "$@"
fi
