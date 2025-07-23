const fs = require('fs').promises;

function CfgReaderFile(filename) {
  return fs.readFile(filename);
}

module.exports = CfgReaderFile;
