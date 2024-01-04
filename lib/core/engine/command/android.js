import intel from 'intel';
import { Android, isAndroidConfigured } from '../../../android/index.js';
const log = intel.getLogger('browsertime.command.android');
/**
 * Provides functionality to interact with an Android device through shell commands.
 *
 * @see https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#test-on-android
 * @class
 */
export class AndroidCommand {
  constructor(options) {
    /**
     * @private
     */
    this.options = options;
  }

  /**
   * Runs a shell command on the connected Android device.
   * This method requires the Android device to be properly configured.
   *
   * @async
   * @param {string} command - The shell command to run on the Android device.
   * @returns {Promise<string>} A promise that resolves with the result of the command or rejects if there's an error.
   * @throws {Error} Throws an error if Android is not configured or if the command fails.
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

  /**
   * Runs a shell command on the connected Android device as the root user.
   * This method requires the Android device to be properly configured and that you
   * rooted the device.
   *
   * @async
   * @param {string} command - The shell command to run on the Android device as root.
   * @returns {Promise<string>} A promise that resolves with the result of the command or rejects if there's an error.
   * @throws {Error} Throws an error if Android is not configured or if the command fails.
   */
  async shellAsRoot(command) {
    if (isAndroidConfigured(this.options)) {
      log.debug('Run %s', command);
      try {
        this.a = new Android(this.options);
        return this.a._runAsRootAndGet(command);
      } catch (error) {
        log.error('Could not run shell command as root %s', command, error);
        throw new Error(
          `Could not run Android shell commmand as root ${command}`
        );
      }
    } else throw new Error('Android is not configured');
  }
}
