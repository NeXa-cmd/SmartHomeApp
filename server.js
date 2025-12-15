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

// TODO: Complete remaining implementation (40% done)
