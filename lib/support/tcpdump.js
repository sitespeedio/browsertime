'use strict';
const execa = require('execa');
const path = require('path');
const pathToFolder = require('./pathToFolder');
const fileUtil = require('./fileUtil');

class TCPDump {
  constructor(directory, options) {
    this.baseDir = directory;
    this.options = options;
  }
  async start(iteration) {
    const captureFile = path.join(this.baseDir, iteration + '.pcap');
    const params = ['tcpdump', '-i', 'any', '-s', '0', '-p', '-w', captureFile];
    if (this.options.tcpdumpPacketBuffered) {
      params.push('-U');
    }
    if (this.options.tcpDumpParams) {
      const extras = Array.isArray(this.options.tcpDumpParams)
        ? this.options.tcpDumpParams
        : [this.options.tcpDumpParams];
      params.push(...extras);
    }
    this.tcpdumpProcess = execa('sudo', params);
  }
  async stop() {
    return execa('sudo', ['pkill', '-9', 'tcpdump'], { reject: false });
  }

  async mv(url, iteration) {
    const oldLocation = path.join(this.baseDir, iteration + '.pcap');
    const newLocation = path.join(
      this.baseDir,
      pathToFolder(url, this.options),
      iteration + '.pcap'
    );
    return fileUtil.rename(oldLocation, newLocation);
  }
}

module.exports = TCPDump;
