const fs = require('fs');
const os = require('os');
const path = require('path');
const sizeOf = require('image-size');
const readChunk = require('read-chunk');
const imageType = require('image-type');
const { ensureDir } = require('./utils');

const INPUT_DIR = path.resolve(
  os.homedir(),
  'AppData/Local/Packages/Microsoft.Windows.ContentDeliveryManager_cw5n1h2txyewy/LocalState/Assets'
);

function getDestinationFileName(originalPath, outputDir) {
  let sortDir = 'uncategorized';

  try {
    // Categorize by dimensions
    const dimensions = sizeOf(originalPath);
    sortDir = dimensions.width > dimensions.height ? 'landscape' : 'portrait';
  } catch (e) {
    console.error(`Couldn't determine image dimensions: ${e.message}`);
  }

  // Check correct extension
  const buffer = readChunk.sync(originalPath, 0, 12);
  let ext = 'jpg';
  try {
    ext = imageType(buffer).ext;
  } catch (e) {
    console.error(`Couldn't determine image type: ${e.message}`);
  }

  // Put it all together
  const outputFileName = path.basename(originalPath) + '.' + ext;
  return path.join(outputDir, sortDir, outputFileName);
}

function copyCacheToOutput(outputDir, cacheDir = INPUT_DIR) {
  const bigImages = fs
    .readdirSync(cacheDir, { encoding: 'utf8' })
    .map(name => path.join(cacheDir, name))
    .filter(path => !fs.existsSync(getDestinationFileName(path, outputDir)))
    .filter(path => {
      try {
        const dimensions = sizeOf(path);
        const sizeThreshold = 500;
        return (
          dimensions.width > sizeThreshold && dimensions.height > sizeThreshold
        );
      } catch (e) {
        console.error(`Couldn't filter out based on size`);
        return true;
      }
    });

  bigImages.forEach(filePath => {
    const dest = getDestinationFileName(filePath, outputDir);
    const dir = path.dirname(dest);
    ensureDir(dir);
    fs.copyFileSync(filePath, dest);
  });

  console.log(`Copied ${bigImages.length} files to ${outputDir}`);
}

module.exports = {
  copyCacheToOutput
};
