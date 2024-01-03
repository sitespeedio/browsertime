export class AndroidCommand {
    constructor(options: any);
    options: any;
    /**
     * Run a shell command on your Android phone.
     * @param {string} command The shell command to run on your phone.
     * @returns {Promise} Promise object represents the outcome of the command or when the command has finished
     * @throws Will throw an error Android isn't configured or something goes wrong
     */
    shell(command: string): Promise<any>;
    a: Android;
}
import { Android } from '../../../android/index.js';
//# sourceMappingURL=android.d.ts.map