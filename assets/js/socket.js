import {Socket} from "phoenix"
import resemble from "resemblejs"

let socket;
if (window.run_tests) {
  let socket = new Socket("/resemblixir_socket", {})

  socket.connect()

  let channel = socket.channel("resemblixir:test", {})
  channel.join()
    .receive("ok", resp => { console.log("Joined successfully", resp) })
    .receive("error", resp => { console.log("Unable to join", resp) })

  channel.on("error", error => {
    socket.disconnect()
    console.error("error", error)
  });
  channel.on("test_image_ready", data => {
    try {
      console.log("test image ready", data);
      const test_image = document.getElementById(data.file_name + "-test");
      test_image.src = "/images/test/" + data.file_name + ".png";
      const ref_image = document.getElementById(data.file_name + "-ref")
      const fileReader = new FileReader();
      console.log("fileReader", fileReader);
      resemble("/images/reference/" + data.file_name + ".png")
        .compareTo("/images/test/" + data.file_name + ".png")
        .onComplete(onResembleComplete(data))
    } catch (error) {
      socket.disconnect()
      console.error(error);
    }
  });

  function onResembleComplete(params) {
    return function(data) {
      if (data.error) {
        console.error(data);
      } else {
        console.log("params", params)
        console.log("data", data)
        const diff_image = document.getElementById(params.file_name + "-diff");
        diff_image.src = data.getImageDataUrl();
      }
    }
  }
}
export default socket
