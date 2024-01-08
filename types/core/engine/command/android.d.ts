/**
 * Provides functionality to interact with an Android device through shell commands.
 * @class
 * @see https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#test-on-android
 * @hideconstructor
 */
export class AndroidCommand {
    constructor(options: any);
    /**
     * @private
     */
    private options;
    /**
     * Runs a shell command on the connected Android device.
     * This method requires the Android device to be properly configured.
     *
     * @async
     * @example await commands.android.shell('');
     * @param {string} command - The shell command to run on the Android device.
     * @returns {Promise<string>} A promise that resolves with the result of the command or rejects if there's an error.
     * @throws {Error} Throws an error if Android is not configured or if the command fails.
     */
    shell(command: string): Promise<string>;
    a: Android;
    /**
     * Runs a shell command on the connected Android device as the root user.
     * This method requires the Android device to be properly configured and that you
     * rooted the device.
     *
     * @async
     * @example await commands.android.shellAsRoot('');
     * @param {string} command - The shell command to run on the Android device as root.
     * @returns {Promise<string>} A promise that resolves with the result of the command or rejects if there's an error.
     * @throws {Error} Throws an error if Android is not configured or if the command fails.
     */
    shellAsRoot(command: string): Promise<string>;
}
import { Android } from '../../../android/index.js';
//# sourceMappingURL=android.d.ts.map