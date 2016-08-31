FROM sitespeedio/webbrowsers

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

VOLUME /browsertime-results

COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

WORKDIR /

COPY docker/scripts/start.sh /start.sh

ENTRYPOINT ["/start.sh"]
