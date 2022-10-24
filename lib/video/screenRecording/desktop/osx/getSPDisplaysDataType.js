import { execaCommand as command } from 'execa';

export default async function () {
  const output = await command('system_profiler SPDisplaysDataType', {
    shell: true
  });
  return output.stdout;
}
