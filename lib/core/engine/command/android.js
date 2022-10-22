import intel from 'intel';
import { Android, isAndroidConfigured } from '../../../android/index.js';
const log = intel.getLogger('browsertime.command.android');
export default class AndroidCommand {
  constructor(options) {
    this.options = options;
  }

  /**
   * Run a shell command on your Android phone.
   * @param {string} command The shell command to run on your phone.
   * @returns {Promise} Promise object represents the outcome of the command or when the command has finished
   * @throws Will throw an error Android isn't configured or something goes wrong
   */
  async shell(command) {
    if (isAndroidConfigured(this.options)) {
      log.debug('Run %s', command);
      try {
        this.a = new Android(this.options);
        return this.a._runCommandAndGet(command);
      } catch (error) {
        log.error('Could not run shell command %s', command, error);
        throw new Error(`Could not run Android shell commmand ${command}`);
      }
    } else throw new Error('Android is not configured');
  }
}
