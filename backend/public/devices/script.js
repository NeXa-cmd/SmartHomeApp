import {local} from "./socket.js";


let body ;
let shackle ;
let text ;

const ledStrip = document.getElementById("living-room");
// Fetch initial state
fetch(`${local}/api/devices`)
  .then(res => res.json())
  .then(devices => {
    if (Array.isArray(devices)) {
      devices.forEach(device => {
        let roomName = "";
        const name = device.name.toLowerCase();
        if(name.includes("living room")) roomName = "living-room";
        else if(name.includes("kitchen")) roomName = "kitchen";
        else if(name.includes("bedroom")) roomName = "bedroom";
        else if(name.includes("bathroom")) roomName = "bathroom";
        else if(device.type === 'thermostat') roomName = "living-room";
        else if(device.type === 'lock') roomName = "living-room";

        const roomDiv = document.getElementById(roomName);
        if(roomDiv){
            if (device.type === 'light') {
                const svgNS = "http://www.w3.org/2000/svg";
                const svg = document.createElementNS(svgNS, "svg");
                svg.setAttribute("width", "200");
                svg.setAttribute("height", "200");
                svg.setAttribute("viewBox", "0 0 200 200");

                const circle = document.createElementNS(svgNS, "circle");
                circle.setAttribute("id", device.id);
                circle.setAttribute("cx", "100");
                circle.setAttribute("cy", "100");
                circle.setAttribute("r", "50");
                circle.setAttribute("stroke-width", "2");

                if(device.isOn) {
                    circle.setAttribute("fill", "hsla(51, 97%, 66%, 1.00)");
                    circle.setAttribute("filter", "drop-shadow(0 0 20px hsla(51, 97%, 66%, 0.8))");
                } else {
                    circle.setAttribute("fill", "hsl(0, 0%, 20%)");
                    circle.setAttribute("filter", "none");
                }
                
                svg.appendChild(circle);
                roomDiv.appendChild(svg);
            } else if (device.type === 'thermostat') {
                createThermostat(device, roomDiv);
            } else if (device.type === 'lock') {
                createLock(device, roomDiv);
            }
        }
      });
    }
  })
  .catch(e => console.error(e));

  function createThermostat(device, container) {
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", "200");
      svg.setAttribute("height", "200");
      svg.setAttribute("viewBox", "0 0 200 200");
      svg.setAttribute("id", `thermostat-${device.id}`);
  
      // Background circle
      const bg = document.createElementNS(svgNS, "circle");
      bg.setAttribute("cx", "100");
      bg.setAttribute("cy", "100");
      bg.setAttribute("r", "90");
      bg.setAttribute("fill", "#222");
      bg.setAttribute("stroke", "#555");
      bg.setAttribute("stroke-width", "4");
      svg.appendChild(bg);
  
      // Calculate temperature color (blue for cold, orange for warm)
      const tempColor = getThermostatColor(device.currentTemperature);
      
      // Active Indicator (ring or fill)
      const indicator = document.createElementNS(svgNS, "circle");
      indicator.setAttribute("id", `thermostat-indicator-${device.id}`);
      indicator.setAttribute("cx", "100");
      indicator.setAttribute("cy", "100");
      indicator.setAttribute("r", "80");
      indicator.setAttribute("fill", device.isOn ? tempColor : "#333");
      svg.appendChild(indicator);
  
      // Current Temp Text
      const currentText = document.createElementNS(svgNS, "text");
      currentText.setAttribute("id", `thermostat-current-${device.id}`);
      currentText.setAttribute("x", "100");
      currentText.setAttribute("y", "115");
      currentText.setAttribute("text-anchor", "middle");
      currentText.setAttribute("font-family", "sans-serif");
      currentText.setAttribute("font-size", "48");
      currentText.setAttribute("fill", "white");
      currentText.setAttribute("font-weight", "bold");
      currentText.textContent = `${device.currentTemperature}°`;
      svg.appendChild(currentText);
  
      // Target Temp Text
      const targetText = document.createElementNS(svgNS, "text");
      targetText.setAttribute("id", `thermostat-target-${device.id}`);
      targetText.setAttribute("x", "100");
      targetText.setAttribute("y", "145");
      targetText.setAttribute("text-anchor", "middle");
      targetText.setAttribute("font-family", "sans-serif");
      targetText.setAttribute("font-size", "16");
      targetText.setAttribute("fill", "#ccc");
      targetText.textContent = `Target: ${device.temperature}°`;
      svg.appendChild(targetText);
  
      container.appendChild(svg);
      
      // Update room background color based on temperature
      if(device.isOn) {
          updateRoomTemperature(container, device.currentTemperature);
      }
  }

  function getThermostatColor(temp) {
      // Blue for cold (< 18°C), Orange for warm (> 24°C), gradient in between
      if (temp < 18) return "#3b82f6"; // Blue
      if (temp > 24) return "#f97316"; // Orange
      // Gradient from blue to orange
      const ratio = (temp - 18) / (24 - 18);
      const r = Math.round(59 + (249 - 59) * ratio);
      const g = Math.round(130 + (115 - 130) * ratio);
      const b = Math.round(246 + (22 - 246) * ratio);
      return `rgb(${r}, ${g}, ${b})`;
  }

  function updateRoomTemperature(roomDiv, temp) {
      const tempColor = getThermostatColor(temp);
      roomDiv.style.background = `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, ${tempColor}22 100%)`;
  }

  function createLock(device, container) {
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", "200");
      svg.setAttribute("height", "200");
      svg.setAttribute("viewBox", "0 0 200 200");
      svg.setAttribute("id", `lock-${device.id}`);

      // Lock Body
      body = document.createElementNS(svgNS, "rect");
      body.setAttribute("x", "50");
      body.setAttribute("y", "80");
      body.setAttribute("width", "100");
      body.setAttribute("height", "80");
      body.setAttribute("rx", "10");
      body.setAttribute("fill", device.isOn ? "#ff4444" : "#44ff44"); // Red if locked (isOn=true), Green if unlocked
      body.setAttribute("id", `lock-body-${device.id}`);
      svg.appendChild(body);

      // Shackle
      shackle = document.createElementNS(svgNS, "path");
      shackle.setAttribute("d", "M 70 80 V 50 A 30 30 0 0 1 130 50 V 80");
      shackle.setAttribute("fill", "none");
      shackle.setAttribute("stroke", "#333");
      shackle.setAttribute("stroke-width", "12");
      shackle.setAttribute("id", `lock-shackle-${device.id}`);
      
      // Move shackle up if unlocked
      // Locking mechanism visual logic:
      // Locked (isOn=true) -> default position
      // Unlocked (isOn=false) -> translated up
      if (!device.isOn) {
         shackle.setAttribute("transform", "translate(0, -20)");
      }

      svg.appendChild(shackle);

      // Status Text
       text = document.createElementNS(svgNS, "text");
       text.setAttribute("x", "100");
       text.setAttribute("y", "130");
       text.setAttribute("text-anchor", "middle");
       text.setAttribute("fill", "white");
       text.setAttribute("font-family", "sans-serif");
       text.setAttribute("font-weight", "bold");
       text.textContent = device.isOn ? "LOCKED" : "UNLOCKED";
       text.setAttribute("id", `lock-text-${device.id}`);
       svg.appendChild(text);

      container.appendChild(svg);
  }

  function updateThermostatVisuals(data) {
      const indicator = document.getElementById(`thermostat-indicator-${data.id}`);
      const currentText = document.getElementById(`thermostat-current-${data.id}`);
      const targetText = document.getElementById(`thermostat-target-${data.id}`);
      
      const tempColor = getThermostatColor(data.currentTemperature || 20);
      
      if(indicator && data.isOn !== undefined) {
         indicator.setAttribute("fill", data.isOn ? tempColor : "#333");
      }
      if(currentText && data.currentTemperature !== undefined) {
          currentText.textContent = `${data.currentTemperature}°`;
          // Update room background based on temperature
          const roomDiv = document.getElementById('living-room');
          if(roomDiv && data.isOn) {
              updateRoomTemperature(roomDiv, data.currentTemperature);
          }
      }
      if(targetText && data.temperature !== undefined) {
          targetText.textContent = `Target: ${data.temperature}°`;
      }
  }

  function updateLockVisuals(data) {
      
       const isLocked = data.isOn; // true = locked
       body.setAttribute("fill", isLocked ? "#ff4444" : "#44ff44");
       
       if (shackle) {
           shackle.setAttribute("transform", isLocked ? "translate(0, 0)" : "translate(0, -20)");
       }

       if(text){

           text.textContent = isLocked ? "LOCKED" : "UNLOCKED";
       }
       
       
  }
  
  function toggleLamp(deviceId, isON){
      const circle = document.getElementById(deviceId);
      if(circle) {
          if(isON) {
            circle.setAttribute("fill", "hsla(51, 97%, 66%, 1.00)");
            circle.setAttribute("filter", "drop-shadow(0 0 20px hsla(51, 97%, 66%, 0.8))");
          } else {
            circle.setAttribute("fill", "hsl(0, 0%, 20%)");
            circle.setAttribute("filter", "none");
          }
      }
  }

function setLedColor(color){
    if(ledStrip) {
        ledStrip.style.borderColor = color;
        ledStrip.style.boxShadow = `
         
            inset 0 0 10px ${color},
            inset 0 0 20px ${color},
            inset 0 0 30px ${color}
        `;
    }
}

export { setLedColor , toggleLamp , updateThermostatVisuals , updateLockVisuals};