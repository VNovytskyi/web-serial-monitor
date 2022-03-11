document.addEventListener('DOMContentLoaded', function() {
  if ("serial" in navigator) {
    console.log("[ OK ] The Web Serial API is supported!");
  } else {
    console.log("[ ERROR ] The Web Serial API is not supported!");
    console.log("[ ERROR ] Can't execute the current program!");
    return;
  }

  document.getElementById("requestPortsButton").addEventListener("click", async function() {
    navigator.serial.requestPort()
      .then(async (port) => {
        await port.open({baudRate: 115200});
        console.log("[ OK ] Port opened");
        console.log("-----------------------");
        console.log("");

        var outputStr = ""
        const decoder = new TextDecoder()

        while (port.readable) {
          const reader = port.readable.getReader();

          while (true) {
            const { value, done } = await reader.read();
              
            if (done) {
              reader.releaseLock();
              break;
            }

            if (value) {            
              const newLineIndex = value.indexOf(0x0A);
              if (newLineIndex !== -1) {
                if ((newLineIndex + 1) == value.byteLength) {
                  outputStr += decoder.decode(value);
                  console.log(outputStr);
                  outputStr = "";
                } else {
                  let end = value.slice(0, newLineIndex + 1);
                  outputStr += decoder.decode(end);
                  console.log(outputStr);

                  outputStr = "";
                  let newBegin = value.slice(newLineIndex + 1, value.byteLength);
                  outputStr =  decoder.decode(newBegin);
                }
              } else {
                outputStr += decoder.decode(value);
              }
            }
          }
        }
      });
  });
});