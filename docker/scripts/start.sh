#!/bin/bash
set -e

# See https://github.com/SeleniumHQ/docker-selenium/issues/87
export DBUS_SESSION_BUS_ADDRESS=/dev/null

google-chrome --version
firefox --version
microsoft-edge --version

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

WORKDIR_UID=$(stat -c "%u" .)
WORKDIR_GID=$(stat -c "%g" .)

# Create user with the same UID and GID as the owner of the working directory, which will be used
# to execute node. This is partly for security and partly so output files won't be owned by root.
groupadd --non-unique --gid $WORKDIR_GID browsertime
useradd --non-unique --uid $WORKDIR_UID --gid $WORKDIR_GID --home-dir /tmp browsertime

# Need to explictly override the HOME directory to prevent dconf errors like:
# (firefox:2003): dconf-CRITICAL **: 00:31:23.379: unable to create directory '/root/.cache/dconf': Permission denied.  dconf will not work properly.
export HOME=/tmp

function execNode(){
   chroot --skip-chdir --userspec='browsertime:browsertime' / node "$@"
}

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

  declare -i RESULT=0
  echo 'Start WebPageReplay Record'
  wpr record $WPR_PARAMS > /tmp/wpr-record.log 2>&1 &
  record_pid=$!
  sleep $RECORD_WAIT
  execNode $BROWSERTIME_RECORD --firefox.preference network.dns.forceResolve:127.0.0.1 --chrome.args host-resolver-rules="MAP *:$HTTP_PORT 127.0.0.1:$WPR_HTTP_PORT,MAP *:$HTTPS_PORT 127.0.0.1:$WPR_HTTPS_PORT,EXCLUDE localhost" "$@"
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
          execNode $BROWSERTIME --firefox.preference network.dns.forceResolve:127.0.0.1 --firefox.preference security.OCSP.enabled:0 --chrome.args host-resolver-rules="MAP *:$HTTP_PORT 127.0.0.1:$WPR_HTTP_PORT,MAP *:$HTTPS_PORT 127.0.0.1:$WPR_HTTPS_PORT,EXCLUDE localhost" --connectivity.engine throttle --connectivity.throttle.localhost --connectivity.profile custom --connectivity.latency $LATENCY "$@" &

          PID=$!

          trap shutdown SIGTERM SIGINT
          wait $PID
          EXIT_STATUS=$?
          kill -s SIGTERM $replay_pid
          exit $EXIT_STATUS
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

  execNode $BROWSERTIME "$@" &

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
