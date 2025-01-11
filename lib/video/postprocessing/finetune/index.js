import path from 'node:path';
import {
  rename as _rename,
  copyFile as _copyFile,
  unlink as _unlink
} from 'node:fs';
import { promisify } from 'node:util';
import { getLogger } from '@sitespeed.io/log';
import { addTextToVideo } from './addTextToVideo.js';
import { removeOrange } from './removeOrange.js';
import { convert } from './convertFps.js';
import { convert as _convert } from '../../defaults.js';
import { isAndroidConfigured } from '../../../android/index.js';
import { getProperty } from '../../../support/util.js';
const rename = promisify(_rename);
const copyFile = promisify(_copyFile);
const unlink = promisify(_unlink);
const log = getLogger('browsertime.video');

export async function finetuneVideo(
  videoDir,
  videoPath,
  index,
  videoMetrics,
  timingMetrics,
  options
) {
  const newStart = videoMetrics.videoRecordingStart / 1000;
  let temporaryFile = path.join(videoDir, 'tmp.mp4');

  if (getProperty(options, 'videoParams.keepOriginalVideo', false)) {
    const originalFile = path.join(videoDir, index + '-original.mp4');
    await copyFile(videoPath, originalFile);
  }

  // if there's no orange (too slow instance like travis?)
  // we don't wanna cut
  if (videoMetrics.videoRecordingStart > 0) {
    await removeOrange(
      videoPath,
      temporaryFile,
      newStart,
      videoMetrics.visualMetrics,
      options
    );
  } else {
    if (videoMetrics.FirstVisualChange === 0) {
      // There are cases where the First Visual Change is zero, I don't know why so
      // at least log so we can keep track of it
      log.error(
        'The First Visual Change is zero, either no orange is there in the video or VisualMetrics failed: %j',
        videoMetrics
      );
    }
    temporaryFile = videoPath;
  }

  if (
    isAndroidConfigured(options) &&
    getProperty(options, 'videoParams.convert', _convert)
  ) {
    const temporaryFile2 = path.join(videoDir, 'tmp-60fps.mp4');
    await convert(temporaryFile, temporaryFile2, 60);
    await unlink(temporaryFile);
    await rename(temporaryFile2, temporaryFile);
  } else if (options.safari && options.safari.useSimulator) {
    const temporaryFile2 = path.join(videoDir, 'tmp-60fps.mp4');
    await convert(temporaryFile, temporaryFile2, 60);
    await unlink(temporaryFile);
    await rename(temporaryFile2, temporaryFile);
  }

  if (options.videoParams.addTimer) {
    const temporaryFile2 = path.join(videoDir, 'tmp2.mp4');
    await addTextToVideo(
      temporaryFile,
      temporaryFile2,
      videoMetrics,
      timingMetrics,
      options
    );
    await rename(temporaryFile2, videoPath);
    await unlink(temporaryFile);
  } else {
    await rename(temporaryFile, videoPath);
  }
}
