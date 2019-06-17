'use strict';

const visualMetrics = require('./visualMetrics');
const extraMetrics = require('../extraMetrics');
const log = require('intel').getLogger('browsertime.video');
const path = require('path');

module.exports = async function(
  videoDir,
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
  const imageDir = path.join(videoDir, 'images', '' + index);
  const elementsFile = path.join(
    storageManager.directory,
    index + '-visualElements.json.gz'
  );
  const metrics = await visualMetrics.run(
    videoPath,
    imageDir,
    elementsFile,
    videoDir,
    index,
    pageNumber,
    visitedPageNumber,
    options
  );

  // Remove the file
  if (options.visualElements && visualElements) {
    await storageManager.rm(index + '-visualElements.json.gz');
  }

  log.debug('Collected metrics ' + JSON.stringify(metrics));

  return extraMetrics(metrics);
};
