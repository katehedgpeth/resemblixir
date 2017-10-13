const system = require("system");
const filePath = system.args[1];
const url = system.args[2];
const width = parseInt(system.args[3]);
const page = require("webpage").create();
try {
  page.viewportSize = {
    width: width,
    height: 1000
  }
  page.open(url, function(status) {
    try {
      page.render(filePath);
      phantom.exit();
      system.stdout.write(JSON.stringify({status: status, path: filePath}))
    } catch (error) {
      phantom.exit()
      system.stdout.write(JSON.stringify({error: error}));
    }
  })
} catch (error) {
  phantom.exit()
  system.stdout.write(JSON.stringify({error: error}))
}
