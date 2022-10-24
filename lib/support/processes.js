import { execaCommand as command } from 'execa';
export default async function () {
  const { stdout } = await command('ps aux | wc -l', { shell: true });
  return stdout;
}
