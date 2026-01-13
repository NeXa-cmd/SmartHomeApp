import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";
import { updateThermostatVisuals , updateLockVisuals ,toggleLamp , setLedColor} from "./script.js";
export const local = "http://localhost:3000"

const socket = io(local);

  socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  socket.on("connect", () => {
    console.log("connected to server")
  });


  socket.on("thermostat_update", (data) => {
    console.log("Thermostat update received:", data);
    updateThermostatVisuals(data);
  });

  socket.on("device_update", (data) => {
    console.log("Device update received:", data);
    // Could be a light or a thermostat
    updateThermostatVisuals(data);
  

  });

  socket.on("room_led", (data) => {
      setLedColor(data.color);
  });

  socket.on("lock_update", (data) => {
    console.log("Lock update received:", data);
    updateLockVisuals(data);
  });

  
socket.on("update", (data) => {
    

    if(data.color !== undefined){
      
        setLedColor(data.color);
    }
    
    if(data.isOn !== undefined && data.deviceId !== undefined){
        toggleLamp(data.deviceId, data.isOn);
      
    }
    
    console.log(data);
});

