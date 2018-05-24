'use strict';

const { spawn } = require('child_process');
const get = require('lodash.get');
const mkdirp = require('mkdirp');

/**
 * Create a new TCPDUMP instance
 * @class
 */
class TCPDUMP {
  constructor(directory, options, iteration) {
    this.directory = directory;
    this.options = options;
    this.iteration = iteration;
  }

  start() {
    const useTcpDump = get(this.options, 'pcap', false);
    if (useTcpDump === true || useTcpDump === 'true') {
      // Create Capture dir
      const capture_dir = this.directory + '/capture';
      mkdirp(capture_dir);

      // Start TcpDump
      // Sould set suid bit with "sudo chmod +s /usr/sbin/tcpdump" if running outside docker
      const capture_file = capture_dir + '/' + this.iteration + '.pcap';
      this.tcpdump_process = spawn('tcpdump', [
        '-i',
        'any',
        '-w',
        capture_file
      ]);
    }
  }

  stop() {
    if (this.tcpdump_process) {
      this.tcpdump_process.kill('SIGINT');
    }
  }
}

module.exports = TCPDUMP;
