import { execaCommand as command } from 'execa';
export async function getNumberOfRunningProcesses() {
  const { stdout } = await command('ps aux | wc -l', { shell: true });
  return stdout;
}
