document.addEventListener('DOMContentLoaded', () => {
  const resemble = require("js/resemble")
  const elmNode = document.getElementById('elm-main')
  Elm.Main.embed(elmNode, {
    websocketUrl: window.websocketUrl,
    image_1: window.image_1,
    image_2: window.image_2
  });
  const resemblelm = Elm.Resemble.Port.fullscreen();
  resemblelm.ports.runner.subscribe(function(images) {
    if (length(images) == 2) {
      image_1 = images[0];
      image_2 = images[1]
      resemble(image_1).compareTo(image_2).onComplete(function(data) {
        resemblelm.ports.listener.send(data);
      });
    }
  })
})
