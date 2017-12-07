FROM sitespeedio/webbrowsers:firefox-54.0-chrome-63.0

ENV BROWSERTIME_XVFB true
ENV BROWSERTIME_CONNECTIVITY__ENGINE external
ENV BROWSERTIME_DOCKER true
ENV BROWSERTIME_VIDEO true
ENV BROWSERTIME_speedIndex true

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

VOLUME /browsertime

COPY package.* /usr/src/app/
RUN npm install --production
COPY . /usr/src/app

## This is to avoid click the OK button
RUN mkdir -m 0750 /root/.android
ADD docker/adb/insecure_shared_adbkey /root/.android/adbkey
ADD docker/adb/insecure_shared_adbkey.pub /root/.android/adbkey.pub

WORKDIR /browsertime

COPY docker/scripts/start.sh /start.sh

ENTRYPOINT ["/start.sh"]
