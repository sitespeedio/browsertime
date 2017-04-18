FROM sitespeedio/webbrowsers:firefox-52.0.1-chrome-57.0

ENV BROWSERTIME_XVFB true
ENV BROWSERTIME_CONNECTIVITY__ENGINE tc
ENV BROWSERTIME_CHROME__ARGS no-sandbox

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

VOLUME /browsertime-results

COPY package.json /usr/src/app/
RUN npm install --production
COPY . /usr/src/app

WORKDIR /

COPY docker/scripts/start.sh /start.sh
# Patch until https://github.com/SeleniumHQ/selenium/pull/3846 gets released
COPY docker/selenium/extension.js /usr/src/app/node_modules/selenium-webdriver/firefox/extension.js

ENTRYPOINT ["/start.sh"]
