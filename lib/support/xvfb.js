import { execa } from 'execa';
import { xvfbDisplay } from '../video/defaults.js';
import { getViewPort } from '../support/getViewPort.js';
import { getProperty } from '../support/util.js';
import { isAndroidConfigured } from '../android/index.js';
import { getLogger } from '@sitespeed.io/log';

const logger = getLogger('browsertime');

function buildXvfbCommand({ display, screen = 0, size, silent }) {
  return {
    command: 'Xvfb',
    args: [
      `:${display}`,
      '-ac',
      '-nolisten',
      'tcp',
      '-screen',
      screen,
      `${size}x24`
    ],
    silent
  };
}

export async function startXvfb({ size, options }) {
  // If using Firefox, add some extra width to avoid issues
  let xvfbSize = size;
  if (options.browser === 'firefox') {
    const extraSizeInFirefox = 200;
    const [width, height] = size.split('x');
    xvfbSize = `${Number(width) + extraSizeInFirefox}x${height}`;
  }

  const display = getProperty(options, 'xvfbParams.display', xvfbDisplay);
  const silent = options.verbose >= 2 ? false : true;

  const { command, args } = buildXvfbCommand({
    display,
    size: xvfbSize,
    silent
  });

  const xvfbProcess = execa(command, args, {
    stdio: silent ? 'ignore' : 'inherit',
    detached: true
  });

  xvfbProcess.catch(error => {
    logger.error('Failed xvfb:', error);
  });

  const waitToSettle = getProperty(options, 'xvfbParams.waitToSettle', 500);
  await new Promise(resolve => {
    setTimeout(resolve, waitToSettle);
  });

  // Export for the browser
  process.env.DISPLAY = `:${display}`;

  return {
    display,
    process: xvfbProcess
  };
}
export async function stopXvfb(xvfbSession) {
  if (!xvfbSession || !xvfbSession.process) {
    return;
  }

  try {
    xvfbSession.process.kill('SIGTERM');
    await xvfbSession.process;
  } catch {
    // Just swallow
  }
}

export class XVFB {
  constructor(options) {
    this.options = options;
    this.xvfbSession = undefined;
  }

  async start() {
    const useXvfb = getProperty(this.options, 'xvfb', false);

    if (
      (useXvfb === true || useXvfb === 'true') &&
      !isAndroidConfigured(this.options)
    ) {
      this.xvfbSession = await startXvfb({
        size: getViewPort(this.options),
        options: this.options
      });
    }
  }

  async stop() {
    if (this.xvfbSession) {
      await stopXvfb(this.xvfbSession);
      this.xvfbSession = undefined;
    }
  }
}
