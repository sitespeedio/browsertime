FROM sitespeedio/webbrowsers:firefox-50.0-chrome-54.0-1

ENV BROWSERTIME_XVFB true
ENV BROWSERTIME_CONNECTIVITY__ENGINE tc

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN sudo apt-get update && sudo apt-get -qyy install dbus-x11

VOLUME /browsertime-results

COPY package.json /usr/src/app/
RUN npm install --production
COPY . /usr/src/app

WORKDIR /

COPY docker/scripts/start.sh /start.sh

ENTRYPOINT ["/start.sh"]
