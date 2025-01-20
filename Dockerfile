FROM sitespeedio/webbrowsers:chrome-132.0-firefox-134.0-edge-132.0

ARG TARGETPLATFORM=linux/amd64

ENV BROWSERTIME_XVFB=true
ENV BROWSERTIME_CONNECTIVITY__ENGINE=external
ENV BROWSERTIME_DOCKER=true

COPY docker/webpagereplay/$TARGETPLATFORM/wpr /usr/local/bin/
COPY docker/webpagereplay/wpr_cert.pem /webpagereplay/certs/
COPY docker/webpagereplay/wpr_key.pem /webpagereplay/certs/
COPY docker/webpagereplay/deterministic.js /webpagereplay/scripts/deterministic.js
COPY docker/webpagereplay/LICENSE /webpagereplay/

RUN sudo apt-get update && DEBIAN_FRONTEND=noninteractive sudo apt-get install libnss3-tools \
  net-tools tcpdump -y && \
  mkdir -p $HOME/.pki/nssdb && \
  certutil -d $HOME/.pki/nssdb -N

ENV PATH="/usr/local/bin:${PATH}"

RUN wpr installroot --https_cert_file /webpagereplay/certs/wpr_cert.pem --https_key_file /webpagereplay/certs/wpr_key.pem

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

# Allow all users to run commands needed by sitespeedio/throttle via sudo
# See https://github.com/sitespeedio/throttle/blob/main/lib/tc.js
RUN echo 'ALL ALL=NOPASSWD: /usr/sbin/tc, /usr/sbin/route, /usr/sbin/ip, /usr/sbin/tcpdump ' > /etc/sudoers.d/tc

ENTRYPOINT ["/start.sh"]
