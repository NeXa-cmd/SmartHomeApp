// API Service - Handles all communication with the Smart Home server

// Default server URL (will be overridden by Settings screen)
let SERVER_URL = 'http://localhost:3000';

// Function to update the server URL
export const setServerUrl = (url) => {
  // Remove trailing slash if present
  SERVER_URL = url.replace(/\/$/, '');
  console.log('Server URL set to:', SERVER_URL);
};

// Function to get current server URL
export const getServerUrl = () => {
  return SERVER_URL;
};

// GET all devices from the server
export const fetchDevices = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/api/devices`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch devices');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw error;
  }
};

// GET single device by ID
export const fetchDevice = async (deviceId) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/devices/${deviceId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch device');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching device:', error);
    throw error;
  }
};

// POST toggle device status
export const toggleDevice = async (deviceId) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/devices/${deviceId}/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle device');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error toggling device:', error);
    throw error;
  }
};

// POST update device (for complex updates)
export const updateDevice = async (deviceId, updates) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/devices/${deviceId}/update`, {
      method: 'POST',
      headers: {

// TODO: Complete remaining implementation (70% done)
