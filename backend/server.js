import express from 'express';
import {createServer} from "node:http";
import {Server} from "socket.io";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
// Middleware
app.use(express.json());
app.use(express.static('public'));



const PORT = 3000;
const server = createServer(app);
const io = new Server(server,{
    cors:{origin:"*"}
});



io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Use named events instead of generic "message"
  socket.on('lamp_toggle', (data) => {
    console.log('Action received:', data);
    // Send to everyone including the sender
    io.emit('update', data); 
  });

  socket.on("adjust_lamp_brightness", (data)=>{
    socket.broadcast.emit("update", data);
  })

  socket.on("change_led_color",(data)=>{
    socket.broadcast.emit("update",data)
  })

  // Thermostat: Set target temperature
  socket.on('thermostat_set', (data) => {
    console.log('Thermostat set received:', data);
    const device = devices.find(d => d.id === data.deviceId);
    if (device && device.type === 'thermostat') {
      device.temperature = data.temperature;
      // Broadcast to all clients
      io.emit('thermostat_update', {
        deviceId: device.id,
        id: device.id,
        temperature: device.temperature,
        currentTemperature: device.currentTemperature
      });
    }
  });

  // Thermostat: Toggle on/off
  socket.on('thermostat_toggle', (data) => {
    console.log('Thermostat toggle received:', data);
    const device = devices.find(d => d.id === data.deviceId);
    if (device && device.type === 'thermostat') {
      device.isOn = data.isOn;
      io.emit('device_update', {
        deviceId: device.id,
        id: device.id,
        isOn: device.isOn,
        temperature: device.temperature,
        currentTemperature: device.currentTemperature
      });
    }
  });
});



app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
}); 

app.get('/device/lamp' , (req , res)=>{
    res.sendFile('devices/index.html' , { root: __dirname + "/public" });
})


// Mock device data
let devices = [
  {
    id: 1,
    name: 'Living Room Light',
    type: 'light',
    isOn: false
  },
  {
    id: 2,
    name: 'Thermostat',
    type: 'thermostat',
    isOn: false,
    temperature: 22,
    currentTemperature: 20
  },
  {
    id: 3,
    name: 'Front Door Lock',
    type: 'lock',
    isOn: true // true = locked
  },
  {
    id: 4,
    name: 'Bedroom Light',
    type: 'light',
    isOn: false // force to false
  },
  {
    id: 5,
    name: 'Kitchen Light',
    type: 'light',
    isOn: false
  }
];

// GET all devices
app.get('/api/devices', (req, res) => {
  console.log('GET /api/devices - Sending all devices');
  res.json(devices);
});

// GET single device by ID
app.get('/api/devices/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const device = devices.find(d => d.id === id);
  
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }
  
  console.log(`GET /api/devices/${id} - Sending device: ${device.name}`);
  res.json(device);
});

// POST toggle device status
app.post('/api/devices/:id/toggle', (req, res) => {
  const id = parseInt(req.params.id);
  const device = devices.find(d => d.id === id);
  
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }
  
  // Toggle the device state
  device.isOn = !device.isOn;
  
  console.log(`POST /api/devices/${id}/toggle - ${device.name} is now ${device.isOn ? 'ON' : 'OFF'}`);
  res.json(device);
});

// POST update device (for more complex updates like temperature)
app.post('/api/devices/:id/update', (req, res) => {
  const id = parseInt(req.params.id);
  const { isOn, temperature } = req.body;
  const device = devices.find(d => d.id === id);
  
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }
  
  // Update device properties
  if (typeof isOn === 'boolean') {
    device.isOn = isOn;
  }
  if (typeof temperature === 'number') {
    device.temperature = temperature;
  }
  
  console.log(`POST /api/devices/${id}/update - Updated ${device.name}`);
  res.json(device);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Smart Home Server is running!' });
});

// Thermostat simulation - gradually move currentTemperature towards target
setInterval(() => {
  const thermostat = devices.find(d => d.type === 'thermostat');
  if (thermostat && thermostat.isOn) {
    const diff = thermostat.temperature - thermostat.currentTemperature;
    
    if (Math.abs(diff) > 0.1) {
      // Move 0.1 degree closer to target
      const step = diff > 0 ? 0.1 : -0.1;
      thermostat.currentTemperature = Math.round((thermostat.currentTemperature + step) * 10) / 10;
      
      // Broadcast update to all connected clients
      io.emit('thermostat_update', {
        deviceId: thermostat.id,
        id: thermostat.id,
        temperature: thermostat.temperature,
        currentTemperature: thermostat.currentTemperature
      });
      
      console.log(`Thermostat: ${thermostat.currentTemperature}°C → ${thermostat.temperature}°C`);
    }
  }
}, 2000); // Update every 2 seconds

app.get("/devices/script.js",(req,res)=>{
    res.sendFile("script.js" , { root: __dirname + "/public/devices"});
})
// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('================================');
  console.log('Smart Home Server Started!');
  console.log('================================');
  console.log(`Server running on port ${PORT}`);
  console.log('');
  console.log('To connect from your phone:');
  console.log('   1. Find your laptop IP address');
  console.log('   2. Enter it in the app Settings screen');
  console.log('   3. Example: http://192.168.1.x:3000');
  console.log('');
  console.log('Available endpoints:');
  console.log('   GET  /api/devices        - Get all devices');
  console.log('   GET  /api/devices/:id    - Get single device');
  console.log('   POST /api/devices/:id/toggle - Toggle device');
  console.log('   GET  /api/health         - Health check');
  console.log('');
});
