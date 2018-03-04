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
  WAIT=${WAIT:-5000}
  REPLAY_WAIT=${REPLAY_WAIT:-5}
  WAIT_SCRIPT="return (function() {try { var end = window.performance.timing.loadEventEnd; var start= window.performance.timing.navigationStart; return (end > 0) && (performance.now() > end - start + $WAIT);} catch(e) {return true;}})()"

  declare -i RESULT=0
  webpagereplaywrapper record --start $WPR_PARAMS

  $BROWSERTIME_RECORD --firefox.preference network.dns.forceResolve:127.0.0.1 --chrome.args host-resolver-rules="MAP *:$HTTP_PORT 127.0.0.1:$WPR_HTTP_PORT,MAP *:$HTTPS_PORT 127.0.0.1:$WPR_HTTPS_PORT,EXCLUDE localhost" --pageCompleteCheck "$WAIT_SCRIPT" --connectivity.engine throttle --connectivity.throttle.localhost --connectivity.profile custom --connectivity.latency $LATENCY "$@"
  RESULT+=$?

  webpagereplaywrapper record --stop $WPR_PARAMS
  RESULT+=$?

  if [ $RESULT -eq 0 ]
    then
      # The record server is slow on storing the replay file
      sleep $REPLAY_WAIT
      webpagereplaywrapper replay --start $WPR_PARAMS

      if [ $? -eq 0 ]
        then
          exec $BROWSERTIME --firefox.preference network.dns.forceResolve:127.0.0.1 --chrome.args host-resolver-rules="MAP *:$HTTP_PORT 127.0.0.1:$WPR_HTTP_PORT,MAP *:$HTTPS_PORT 127.0.0.1:$WPR_HTTPS_PORT,EXCLUDE localhost" --video --visualMetrics --pageCompleteCheck "$WAIT_SCRIPT" --connectivity.engine throttle --connectivity.throttle.localhost --connectivity.profile custom --connectivity.latency $LATENCY "$@" &

          PID=$!

          trap shutdown SIGTERM SIGINT
          wait $PID

          webpagereplaywrapper replay --stop $WPR_PARAMS
        else
          echo "Replay server didn't start correctly" >&2
          exit 1
        fi
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
