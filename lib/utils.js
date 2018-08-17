const path = require('path');
const fs = require('fs');

function ensureDir(directoryPath) {
  directoryPath.split(path.sep).reduce((currentPath, folder) => {
    currentPath += folder + path.sep;
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
    return currentPath;
  }, '');
}

module.exports = {
  ensureDir
};
