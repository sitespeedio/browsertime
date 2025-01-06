import path from 'node:path';
import { getLogger } from '@sitespeed.io/log';
import { run } from './visualMetrics.js';
import { extraMetrics } from './extraMetrics.js';
const log = getLogger('browsertime.video');

export async function getVideoMetrics(
  videoDir,
  filmstripDir,
  videoPath,
  index,
  visualElements, // results.browserScripts.pageinfo.visualElements
  storageManager,
  pageNumber,
  visitedPageNumber,
  options
) {
  log.debug('Running visualMetrics');
  // If we want to use the Hero functionality of Visual Metrics
  // we need to create the hero JSON file.
  if (options.visualElements && visualElements) {
    await storageManager.writeJson(
      index + '-visualElements.json',
      visualElements,
      true
    );
  }
  const elementsFile = path.join(
    storageManager.directory,
    index + '-visualElements.json.gz'
  );
  try {
    const metrics = await run(
      videoPath,
      filmstripDir,
      elementsFile,
      videoDir,
      index,
      pageNumber,
      visitedPageNumber,
      options
    );
    log.debug('Collected metrics ' + JSON.stringify(metrics));
    return extraMetrics(metrics);
  } catch (error) {
    log.error('Could not run Visual Metrics', error);
    throw error;
  } finally {
    // Remove the file
    if (options.visualElements && visualElements) {
      await storageManager.rm(index + '-visualElements.json.gz');
    }
  }
}
