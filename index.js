const core = require('@actions/core');
const http = require('https');
const fs = require('fs');
const path = require('path');

try {
  const label = core.getInput('label');
  const filepath = core.getInput('path');
  const filename = core.getInput('filename');
  const discoverDirectory = core.getInput('discover-directory');
  const color = core.getInput('color');
  const gistFilename = core.getInput('gist-filename');
  const gistId = core.getInput('gist-id');
  const gistAuthToken = core.getInput('gist-auth-token');

  const dir = !!discoverDirectory ? 
    path.join(filepath, getMostRecentDirectory(filepath).file, filename) :
    path.join(filepath, filename);

  let testReport = readFile(dir);
  let coveragePercentage = extractSummaryFromOpencover(testReport);
  let badgeData = createBadgeData(label, coveragePercentage, color);
  publishBadge(badgeData, gistFilename, gistId, gistAuthToken);

  core.setOutput("badge", badgeData);
  core.setOutput("percentage", coveragePercentage);
} catch (error) {
  core.setFailed(error);
}

function publishBadge(badgeData, gistFilename, gistId, gistAuthToken) {
  if (gistFilename == null || gistId == null || gistAuthToken == null) {   //TODO: Test for null or undefined?
    console.log("Could not publish badge. Gist filename, id and auth token are required to post shields.io data");
  }
  else {
    console.log("Posting shields.io data to Gist");
    postGist(badgeData, gistFilename, gistId, gistAuthToken);
  }
}

function getMostRecentDirectory(dir) {
  const files = orderMostRecentDirectories(dir);
  return files.length ? files[0] : undefined;
} 

function orderMostRecentDirectories(dir) {
  return fs.readdirSync(dir)
  .filter(file => fs.lstatSync(path.join(dir, file)).isDirectory())
  .map(file => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
  .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
}

function postGist(badgeData, gistFilename, gistId, gistAuthToken) {
  const request = JSON.stringify({
    files: {[gistFilename]: {content: JSON.stringify(badgeData)}}
  });

  const req = http.request(
      {
        host: 'api.github.com',
        path: '/gists/' + gistId,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': request.length,
          'User-Agent': 'simon-k',
          'Authorization': 'token ' + gistAuthToken,
        }
      },
      res => {
        let body = '';
        res.on('data', data => body += data);
        res.on('end', () => console.log('result:' + body));
      });

  req.write(request);
  req.end();
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
