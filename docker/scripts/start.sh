#!/bin/bash
set -e

google-chrome --version
firefox --version

function runWebPageReplay(){
  RUNS="${RUNS:-5}"
  LATENCY=${LATENCY:-100}
  BROWSER=${BROWSER:-'chrome'}
  HTTP_PORT=80
  HTTPS_PORT=443

  webpagereplaywrapper record --start --path /root/go/src/github.com/catapult-project/catapult/web_page_replay_go --http $HTTP_PORT --https $HTTPS_PORT

  if [ $BROWSER = 'chrome' ]
  then
      /usr/src/app/bin/browsertime.js -b $BROWSER -n 1 --chrome.args host-resolver-rules="MAP *:$HTTP_PORT 127.0.0.1:$HTTP_PORT,MAP *:$HTTPS_PORT 127.0.0.1:$HTTPS_PORT,EXCLUDE localhost" --pageCompleteCheck "return true;" "$@"
  else
      /usr/src/app/bin/browsertime.js -b $BROWSER -n 1 --firefox.preference network.dns.forceResolve:127.0.0.1 --firefox.acceptInsecureCerts --skipHar --pageCompleteCheck "return true;" "$@"
  fi

  webpagereplaywrapper record --stop --path /root/go/src/github.com/catapult-project/catapult/web_page_replay_go

  webpagereplaywrapper replay --start --path /root/go/src/github.com/catapult-project/catapult/web_page_replay_go --http $HTTP_PORT--https $HTTPS_PORT

  if [ $BROWSER = 'chrome' ]
  then
      /usr/src/app/bin/browsertime.js -b $BROWSER -n $RUNS --chrome.args host-resolver-rules="MAP *:$HTTP_PORT 127.0.0.1:$HTTP_PORT,MAP *:$HTTPS_PORT 127.0.0.1:$HTTPS_PORT,EXCLUDE localhost" --video --speedIndex --pageCompleteCheck "return true;" --connectivity.engine throttle --connectivity.throttle.localhost --connectivity.profile custom --connectivity.latency $LATENCY "$@"
  else
      /usr/src/app/bin/browsertime.js -b $BROWSER -n $RUNS --firefox.preference network.dns.forceResolve:127.0.0.1 --video --speedIndex --pageCompleteCheck "return true;" --connectivity.engine throttle --connectivity.throttle.localhost --connectivity.profile custom --connectivity.latency $LATENCY --skipHar --firefox.acceptInsecureCerts "$@"
  fi

  webpagereplaywrapper replay --stop --path /root/go/src/github.com/catapult-project/catapult/web_page_replay_go
}

function chromeSetup() {
  # Here's a hack for fixing the problem with Chrome not starting in time
  # See https://github.com/SeleniumHQ/docker-selenium/issues/87#issuecomment-250475864

  sudo rm -f /var/lib/dbus/machine-id
  sudo mkdir -p /var/run/dbus
  sudo service dbus restart > /dev/null
  service dbus status > /dev/null
  export $(dbus-launch)
  export NSS_USE_SHARED_DB=ENABLED
}

function setupADB(){
  # Start adb server and list connected devices
  if [ -n "$START_ADB_SERVER" ] ; then
    sudo adb start-server
    sudo adb devices
  fi
}

function runBrowsertime(){

  # Inspired by docker-selenium way of shutting down
  function shutdown {
    kill -s SIGTERM ${PID}
    wait $PID
  }

  exec /usr/src/app/bin/browsertime.js "$@" &

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
