const resemble = require("../../node_modules/resemblejs/resemble.js");
const fs = require("fs");
const path = require("path");

//process.stdout.write(JSON.stringify(process.argv))

const referencePath = process.argv[2];
const testPath = process.argv[3];

const referenceFile = fs.readFileSync(referencePath);
const testFile = fs.readFileSync(testPath);


resemble(referenceFile).compareTo(testFile).onComplete(function(data) {
  var buffer = data.getBuffer()
  const result = {data: data, diff: null}
  if ((data.rawMisMatchPercentage > 0) ||
      (data.dimensionDifference.height != 0) ||
      (data.dimensionDifference.width != 0)) {
    const testName = path.basename(testPath);
    const testFolder = path.dirname(testPath);
    const diffName = "failed_diff_" + testName;
    const diffPath = path.join(testFolder, diffName);
    fs.writeFileSync(diffPath, data.getBuffer());
    result.diff = diffPath;
  }
  process.stdout.write(JSON.stringify(result))
});
