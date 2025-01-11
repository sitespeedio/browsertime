import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execa } from 'execa';
import { getLogger } from '@sitespeed.io/log';
import { readFile, removeFile, copyFile } from '../../../support/fileUtil.js';
import { getProperty } from '../../../support/util.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const log = getLogger('browsertime.video');

const SCRIPT_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'visualmetrics',
  'visualmetrics.py'
);

const PORTABLE_SCRIPT_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'visualmetrics',
  'visualmetrics-portable.py'
);

function getScript(options) {
  if (options.visualMetricsPortable) {
    log.info('Use the visual metrics portable script');
    return PORTABLE_SCRIPT_PATH;
  }
  return SCRIPT_PATH;
}

export async function checkDependencies(options) {
  return execa(process.env.PYTHON || 'python', [getScript(options), '--check']);
}
export async function run(
  videoPath,
  imageDirPath,
  elementsFile,
  videoDir,
  index,
  pageNumber,
  visitedPageNumber,
  options
) {
  const filmstripQuality = getProperty(
    options,
    'videoParams.filmstripQuality',
    75
  );
  const createFilmstrip = getProperty(
    options,
    'videoParams.createFilmstrip',
    true
  );
  const fullSizeFilmstrip = getProperty(
    options,
    'videoParams.filmstripFullSize',
    false
  );

  const thumbsize = getProperty(options, 'videoParams.thumbsize', 400);

  const scriptArguments = [
    '--video',
    videoPath,
    '--orange',
    '--force',
    '--renderignore',
    5,
    '--json',
    '--viewport',
    '--viewportretries',
    60,
    '--viewportminheight',
    100,
    '--viewportminwidth',
    100
  ];

  if (options.visualMetricsPerceptual) {
    scriptArguments.push('--perceptual');
  }

  if (options.visualMetricsContentful) {
    scriptArguments.push('--contentful');
  }

  if (options.visualMetricsKeyColor) {
    for (let i = 0; i < options.visualMetricsKeyColor.length; ++i) {
      if (i % 8 == 0) {
        scriptArguments.push('--keycolor');
      }
      scriptArguments.push(options.visualMetricsKeyColor[i]);
    }
  }

  // There seems to be a bug with --startwhite that makes VM bail out
  // 11:20:14.950 - Calculating image histograms
  // 11:20:14.951 - No video frames found in /private/var/folders/27/xpnvcsbs0nlfbb4qq397z3rh0000gn/T/vis-cn_JMf
  // 11:20:14.951 - Done calculating histograms
  // Since we tuned the borders of the video, I hope it will just work fine
  // without. If not, let us create a upstream issue
  // If it is the first page and no preURL we can use
  // start white, that gives us less variance in metrics in Chrome
  /*
  if (!options.preURL && visitedPageNumber === 0) {
    scriptArgs.push('--startwhite');
  }
  */
  if (options.visualElements) {
    scriptArguments.push('--herodata', elementsFile);
  }

  if (createFilmstrip) {
    scriptArguments.push('-q', filmstripQuality);
    scriptArguments.unshift('--dir', imageDirPath);
    if (fullSizeFilmstrip) {
      scriptArguments.push('--full');
    } else if (thumbsize !== 400) {
      scriptArguments.push('--thumbsize', thumbsize);
    }
  }

  const visualMetricsLogFile = path.join(
    videoDir,
    index + '.visualmetrics.log'
  );

  scriptArguments.push('--logfile', visualMetricsLogFile);
  if (options.verbose >= 1) {
    scriptArguments.push('-vvvv');
  } else {
    // Full -vvvv is really chatty so keep this level for now.
    scriptArguments.push('-vvv');
  }

  scriptArguments.unshift(getScript(options));

  log.debug('Running visualmetrics.py ' + scriptArguments.join(' '));
  log.info('Get visual metrics from the video');
  try {
    const result = await execa(process.env.PYTHON || 'python', scriptArguments);
    log.debug('visualmetrics.py output:' + result.stdout);
    if (options.verbose < 1) {
      try {
        await removeFile(visualMetricsLogFile);
      } catch {
        log.error(
          'Could not remove the log file from VisualMetrics, does it exist?: %s',
          visualMetricsLogFile
        );
      }
    }
    return JSON.parse(result.stdout);
  } catch (error) {
    log.error('VisualMetrics failed to run', error);
    await copyFile(videoPath, videoPath + '.failed.mp4');

    if (options.visualElements) {
      await copyFile(elementsFile, elementsFile + '.failed.json');
    }

    // If something goes wrong, dump the visual metrics log to our log
    const visualMetricLog = await readFile(visualMetricsLogFile);
    log.error('Log from VisualMetrics: %s', visualMetricLog);
    throw error;
  }
}
