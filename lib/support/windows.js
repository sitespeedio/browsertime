import { execa } from 'execa';

import intel from 'intel';
const log = intel.getLogger('browsertime');

export async function checkWindowsLongPath() {
  if (process.platform === 'win32') {
    const { stdout } = await execa(
      '(Get-ItemProperty "HKLM:System\\CurrentControlSet\\Control\\FileSystem").LongPathsEnabled',
      {
        shell: 'powershell.exe'
      }
    );
    if (stdout === '1') {
      log.info('LongPaths is enabled');
    } else if (stdout === '0') {
      log.info('LongPaths is not enabled');
    }
  }
}
