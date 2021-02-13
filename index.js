const core = require('@actions/core');
const http = require('https');
const fs = require('fs')

try {
  const opencoverPath = core.getInput('opencover_path');
  
  var opencoverReport = readOpencoverFile(opencoverPath);
  var coveragePercentage = extractSummaryFromOpencover(opencoverReport);

  //TODO: Generate json that shields.io can use

  //TODO: Upload the json to a gist.

  core.setOutput("coverage_percentage", coveragePercentage);

} catch (error) {
  core.setFailed(error);
}

function readOpencoverFile(path) {
  if (!fs.existsSync(opencoverPath)) {
    throw new Error('The Opencover file was not found at the location: "' + opencoverPath + '"'); 
  }

  return fs.readFileSync(opencoverPath, 'utf8');
}


function extractSummaryFromOpencover(content) {
  var rx = /(?<=sequenceCoverage=")\d*\.*\d*(?=")/m;
  var arr = rx.exec(content);

  if (arr == null) {
    throw new Error('No code coverage percentage was found in the provided opencover report. Was looking for an xml elemet named Summary with the attribute sequenceCoverage');
  }

  return arr[0]; 
}