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
    if (stdout === '0') {
      log.info(
        'LongPaths is not enabled and that can make testing fail. Read https://learn.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation?tabs=registry on how to enable long paths'
      );
    }
  }
}
