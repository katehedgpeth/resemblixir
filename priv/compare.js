const resemble = require("resemblejs");
const fs = require("fs");

//process.stdout.write(JSON.stringify(process.argv))

const filePath1 = process.argv[2];
const filePath2 = process.argv[3];

const file1 = fs.readFileSync(filePath1);
const file2 = fs.readFileSync(filePath2);


resemble(file1).compareTo(file2).onComplete(function(result) {
  process.stdout.write(JSON.stringify(result))
});
