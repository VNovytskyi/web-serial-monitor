$(document).ready(function() {
  if ("serial" in navigator) {
    console.log("[ OK ] The Web Serial API is supported!");
  } else {
    console.log("[ ERROR ] The Web Serial API is not supported!");
    console.log("[ ERROR ] Can't execute the current program!");
    return;
  }

  $("#requestPortsButton").click(async function() {
    //const port = await navigator.serial.requestPort();

    const baudRateValue = $("#inputSerialSpeed").val();
    console.log(baudRateValue);

    const dataBitsValue = $("#inputSerialDataBits").find(":selected").text();
    console.log(dataBitsValue);

    const flowControlValue = $("#flowControlUse").is(':checked') ? "hardware" : "none";
    console.log(flowControlValue);

    const parityValue = $("input[name='parityOption']:checked")[0].value;
    console.log(parityValue);

    /*await port.open({
      baudRate: baudRateValue,
      bufferSize: 1024,
      dataBits: dataBitsValue,
      flowControl: flowControlValue,
      parity: "none",
      stopBits: 1
    });

    console.log("[ OK ] Port opened");
    console.log("-----------------------");
    console.log("");

    processingPort(port);*/
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