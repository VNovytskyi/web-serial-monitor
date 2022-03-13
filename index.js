$(document).ready(function() {
  if ("serial" in navigator) {
    console.log("[ OK ] The Web Serial API is supported!");
  } else {
    console.log("[ ERROR ] The Web Serial API is not supported!");
    console.log("[ ERROR ] Can't execute the current program!");
    return;
  }

  $("#requestPortsButton").click(async function() {
    const port = await navigator.serial.requestPort();

    const baudRateValue = $("#inputSerialSpeed").val();
    const dataBitsValue = $("#inputSerialDataBits").find(":selected").text();
    const flowControlValue = $("#flowControlUse").is(':checked') ? "hardware" : "none";
    const parityValue = $("input[name='parityOption']:checked")[0].value;
    const stopBitsValue = parseInt($("input[name='stopBitsOption']:checked")[0].value);
    const bufferSize = parseInt($("#inputBufferSize").find(":selected").text());

    await port.open({
      baudRate: baudRateValue,
      bufferSize: bufferSize,
      dataBits: dataBitsValue,
      flowControl: flowControlValue,
      parity: parityValue,
      stopBits: stopBitsValue
    });

    console.log("[ OK ] Port opened");
    console.log("-----------------------");
    console.log("");

    processingPort(port);
  });

  async function processingPort(port) {
    const decoder = new TextDecoder()
    const reader = port.readable.getReader();

    var outputStr = "";
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

  $("#serialSpeedValues").on('click', 'li', (e) => { 
    $("#inputSerialSpeed").val(e.target.innerText); 
  });

});