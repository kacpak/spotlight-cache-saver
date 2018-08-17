const fs = require('fs');
const os = require('os');
const path = require('path');
const sizeOf = require('image-size');
const readChunk = require('read-chunk');
const imageType = require('image-type');

const INPUT_DIR = path.resolve(
  os.homedir(),
  'AppData/Local/Packages/Microsoft.Windows.ContentDeliveryManager_cw5n1h2txyewy/LocalState/Assets'
);

function getDestinationFileName(originalPath, outputDir) {
  // Categorize by dimensions
  const dimensions = sizeOf(originalPath);
  const sortDir =
    dimensions.width > dimensions.height ? 'landscape' : 'portrait';

  // Check correct extension
  const buffer = readChunk.sync(originalPath, 0, 12);
  const ext = imageType(buffer).ext || 'jpg';

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
      const dimensions = sizeOf(path);
      const sizeThreshold = 500;
      return (
        dimensions.width > sizeThreshold && dimensions.height > sizeThreshold
      );
    });

  bigImages.forEach(filePath => {
    const dest = getDestinationFileName(filePath, outputDir);
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    fs.copyFileSync(filePath, dest);
  });

  console.log(`Copied ${bigImages.length} files to ${outputDir}`);
}

module.exports = {
  copyCacheToOutput
};
