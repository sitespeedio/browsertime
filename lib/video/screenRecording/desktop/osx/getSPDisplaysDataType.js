import { execaCommand as command } from 'execa';

export async function getSPDisplaysDataType() {
  const output = await command('system_profiler SPDisplaysDataType', {
    shell: true
  });
  return output.stdout;
}
