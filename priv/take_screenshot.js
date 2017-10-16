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
      system.stdout.write(JSON.stringify({status: status, path: filePath}))
      phantom.exit();
    } catch (error) {
      system.stdout.write(JSON.stringify({error: error}));
      phantom.exit()
    }
  })
} catch (error) {
  system.stdout.write(JSON.stringify({error: error}))
  phantom.exit()
}
