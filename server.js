// Smart Home Controller - Backend Server
// Run with: node server.js

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

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
    isOn: true,
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
    isOn: false
  },
  {
    id: 5,
    name: 'Kitchen Light',
    type: 'light',
    isOn: true
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

// TODO: Complete remaining implementation (70% done)
