try {
  const resemble = require("resemblejs");
  const fs = require("fs");

  //process.stdout.write(JSON.stringify(process.argv))

  const referencePath = process.argv[2];
  const testPath = process.argv[3];

  const referenceFile = fs.readFileSync(referencePath);
  const testFile = fs.readFileSync(testPath);


  resemble(referenceFile).compareTo(testFile).onComplete(function(result) {
    process.stdout.write(JSON.stringify(result))
  });
} catch (error) {
  process.stdout.write(JSON.stringify({error: error}));
}
