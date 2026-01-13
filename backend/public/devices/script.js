import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";
const ngrok = "https://sommer-drapable-gena.ngrok-free.dev/"
const local = "http://localhost:3000"

const socket = io(local);
const circle = document.getElementById("myCircle");
const led = document.getElementById("led");

  socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  socket.on("connect", () => {
    console.log("connected to server")
    socket.emit("lamp_toggle", { status: "on" });
  });

function setLedColor(color){
    led.setAttribute("fill" , color);
}
// Function to set lamp brightness (0-100)
function setLampBrightness(brightness) {
    if (brightness === 0) {
        // Off - dark gray
        circle.setAttribute("fill", "hsl(0, 0%, 20%)");
    } else {
        // On - yellow/warm light getting brighter
        const lightness = 50 + (brightness / 2); // 50-100%
        circle.setAttribute("fill", `hsl(60, 100%, ${lightness}%)`);
    }
}

function toggleLamp(isON){
    if(isON)
        circle.setAttribute("fill", "hsla(51, 97%, 66%, 1.00)");
        
        
    else
        circle.setAttribute("fill", "hsl(0, 0%, 20%)");
        
}


// Listen for brightness updates from server
socket.on("update", (data) => {
    
    if (data.brightness !== undefined) {
        setLampBrightness(data.brightness);
    }

    if(data.color !== undefined){
      
        setLedColor(data.color);
    }
    
        
    toggleLamp(data.isOn);
    
    console.log(data);
});

