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
  WPR_HTTP_PORT=${WPR_HTTP_PORT:-8080}
  WPR_HTTPS_PORT=${WPR_HTTPS_PORT:-8081}
else
  WPR_HTTP_PORT=${WPR_HTTP_PORT:-80}
  WPR_HTTPS_PORT=${WPR_HTTPS_PORT:-443}
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
    sudo adb version
    sudo adb start-server
    sudo adb devices

    if [ -n "$REPLAY" ] ; then
      if [ -n "$DEVICE_SERIAL" ] ; then
        sudo adb -s $DEVICE_SERIAL reverse tcp:$WPR_HTTP_PORT tcp:$WPR_HTTP_PORT
        sudo adb -s $DEVICE_SERIAL reverse tcp:$WPR_HTTPS_PORT tcp:$WPR_HTTPS_PORT
      else
        sudo adb reverse tcp:$WPR_HTTP_PORT tcp:$WPR_HTTP_PORT
        sudo adb reverse tcp:$WPR_HTTPS_PORT tcp:$WPR_HTTPS_PORT
      fi
    fi

  fi
}

function runWebPageReplay() {

  function shutdown {
    kill -2 $replay_pid
    wait $replay_pid
    kill -s SIGTERM ${PID}
    wait $PID
  }

  LATENCY=${LATENCY:-100}
  WPR_PARAMS="--http_port $WPR_HTTP_PORT --https_port $WPR_HTTPS_PORT --https_cert_file $CERT_FILE --https_key_file $KEY_FILE --inject_scripts $SCRIPTS /tmp/archive.wprgo"
  WAIT=${WAIT:-5000}
  REPLAY_WAIT=${REPLAY_WAIT:-3}
  RECORD_WAIT=${RECORD_WAIT:-3}
  WAIT_SCRIPT="return (function() {try { var end = window.performance.timing.loadEventEnd; var start= window.performance.timing.navigationStart; return (end > 0) && (performance.now() > end - start + $WAIT);} catch(e) {return true;}})()"

  declare -i RESULT=0
  echo 'Start WebPageReplay Record'
  wpr record $WPR_PARAMS > /tmp/wpr-record.log 2>&1 &
  record_pid=$!
  sleep $RECORD_WAIT
  $BROWSERTIME_RECORD --firefox.preference network.dns.forceResolve:127.0.0.1 --chrome.args host-resolver-rules="MAP *:$HTTP_PORT 127.0.0.1:$WPR_HTTP_PORT,MAP *:$HTTPS_PORT 127.0.0.1:$WPR_HTTPS_PORT,EXCLUDE localhost" --pageCompleteCheck "$WAIT_SCRIPT" "$@"
  RESULT+=$?

  kill -2 $record_pid
  RESULT+=$?
  wait $record_pid
  echo 'Stopped WebPageReplay record'

  if [ $RESULT -eq 0 ]
    then
      echo 'Start WebPageReplay Replay'
      wpr replay $WPR_PARAMS > /tmp/wpr-replay.log 2>&1 &
      replay_pid=$!
      sleep $REPLAY_WAIT
      if [ $? -eq 0 ]
        then
          exec $BROWSERTIME --firefox.preference network.dns.forceResolve:127.0.0.1 --firefox.preference security.OCSP.enabled:0 --chrome.args host-resolver-rules="MAP *:$HTTP_PORT 127.0.0.1:$WPR_HTTP_PORT,MAP *:$HTTPS_PORT 127.0.0.1:$WPR_HTTPS_PORT,EXCLUDE localhost" --video --visualMetrics --pageCompleteCheck "$WAIT_SCRIPT" --connectivity.engine throttle --connectivity.throttle.localhost --connectivity.profile custom --connectivity.latency $LATENCY "$@" &

          PID=$!

          trap shutdown SIGTERM SIGINT
          wait $PID
          kill -s SIGTERM $replay_pid

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
