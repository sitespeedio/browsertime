import path from 'node:path';
import { execa } from 'execa';
import { pathToFolder } from './pathToFolder.js';
import { rename } from './fileUtil.js';

export class TCPDump {
  constructor(directory, options) {
    this.baseDir = directory;
    this.options = options;
  }
  async start(iteration) {
    const captureFile = path.join(this.baseDir, iteration + '.pcap');
    const parameters = [
      'tcpdump',
      '-i',
      'any',
      '-s',
      '0',
      '-p',
      '-w',
      captureFile
    ];
    if (this.options.tcpdumpPacketBuffered) {
      parameters.push('-U');
    }
    if (this.options.tcpDumpParams) {
      const extras = Array.isArray(this.options.tcpDumpParams)
        ? this.options.tcpDumpParams
        : [this.options.tcpDumpParams];
      parameters.push(...extras);
    }
    this.tcpdumpProcess = execa('sudo', parameters);
  }
  async stop() {
    if (this.tcpdumpProcess) {
      await this.tcpdumpProcess.kill('SIGINT');
      this.tcpdumpProcess = undefined;
    }
  }

  async mv(url, iteration) {
    const oldLocation = path.join(this.baseDir, iteration + '.pcap');
    const newLocation = path.join(
      this.baseDir,
      pathToFolder(url, this.options),
      iteration + '.pcap'
    );
    return rename(oldLocation, newLocation);
  }
}
