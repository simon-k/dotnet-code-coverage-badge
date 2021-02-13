const core = require('@actions/core');
const http = require('https');

try {
  const opencoverPath = core.getInput('opencover_path');
  
  //TODO: Extract coverage from opencover file

  //TODO: Generate json that shields.io can use

  //TODO: Upload the json to a gist.

  core.setOutput("coverage_percentage", 0);

} catch (error) {
  core.setFailed(error);
}
