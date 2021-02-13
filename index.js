const core = require('@actions/core');
const http = require('https');
const fs = require('fs')

try {
  const label = core.getInput('label');
  const path = core.getInput('path');
  const color = core.getInput('color');

  let testReport = readFile(path);
  let coveragePercentage = extractSummaryFromOpencover(testReport);
  let badgeData = createBadgeData(label, coveragePercentage, color);

  //TODO: Upload the json to a gist.

  core.setOutput("badge", badgeData);
  core.setOutput("percentage", coveragePercentage);
} catch (error) {
  core.setFailed(error);
}

function createBadgeData(label, coveragePercentage, color) {
  let badgeData = {
    schemaVersion: 1,
    label: label,
    message: coveragePercentage + '%',
    color: color
  };

  return badgeData;
}

function readFile(path) {
  if (!fs.existsSync(path)) {
    throw new Error('The file was not found at the location: "' + path + '"'); 
  }

  return fs.readFileSync(path, 'utf8');
}

function extractSummaryFromOpencover(content) {
  let rx = /(?<=sequenceCoverage=")\d*\.*\d*(?=")/m;
  let arr = rx.exec(content);

  if (arr == null) {
    throw new Error('No code coverage percentage was found in the provided opencover report. Was looking for an xml elemet named Summary with the attribute sequenceCoverage');
  }

  return arr[0]; 
}
