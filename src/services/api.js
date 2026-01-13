// API Service - Handles all communication with the Smart Home server
import { io } from 'socket.io-client';

//const SERVER_URL = "https://sommer-drapable-gena.ngrok-free.dev"
const SERVER_URL = "http://localhost:3000"
// Default server URL (will be overridden by Settings screen)


export const socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("Connected to server via WebSocket");
});

socket.on("disconnect", (reason) => {
  if (reason !== 'io client disconnect') {
    console.log("Disconnected from server:", reason);
  }
});

// Only log persistent connection errors, not transient ones
let connectionErrorLogged = false;
socket.on("connect_error", (error) => {
  if (!connectionErrorLogged) {
    console.warn("WebSocket connection issue - will retry automatically");
    connectionErrorLogged = true;
  }
});

socket.on("connect", () => {
  connectionErrorLogged = false; // Reset on successful connection
});





// Function to get current server URL
export const getServerUrl = () => {
  return SERVER_URL;
};

// Common headers for all requests (includes ngrok bypass and cache control)
const getHeaders = (additionalHeaders = {}) => ({
  'ngrok-skip-browser-warning': 'true',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  ...additionalHeaders,
});

// GET all devices from the server
export const fetchDevices = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/api/devices`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch devices');
    }
    console.log(response);
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
    const response = await fetch(`${SERVER_URL}/api/devices/${deviceId}`, {
      headers: getHeaders(),
    });
    
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
export const toggleDevice = async ({deviceId, isOn}) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/devices/${deviceId}/toggle`, {
      method: 'POST',
      headers: getHeaders({
        'Content-Type': 'application/json',
      }),
    });

    socket.emit("lamp_toggle" , { deviceId: deviceId , isOn: isOn});
    
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
      headers: getHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update device');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating device:', error);
    throw error;
  }
};

// Health check - test connection to server
export const checkServerConnection = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/api/health`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('Server connection check failed:', error);
    return false;
  }
};
