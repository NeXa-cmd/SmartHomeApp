import { io, Socket } from 'socket.io-client';
import { Device, ThermostatUpdate } from '@/types/device';

const SERVER_URL = "http://localhost:3000";

export const socket: Socket = io(SERVER_URL, {
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

let connectionErrorLogged = false;
socket.on("connect_error", (error) => {
  if (!connectionErrorLogged) {
    console.warn("WebSocket connection issue - will retry automatically");
    connectionErrorLogged = true;
  }
});

socket.on("connect", () => {
  connectionErrorLogged = false;
});

export const getServerUrl = (): string => {
  return SERVER_URL;
};

const getHeaders = (additionalHeaders = {}): HeadersInit => ({
  'ngrok-skip-browser-warning': 'true',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  ...additionalHeaders,
});

export const fetchDevices = async (): Promise<Device[]> => {
  try {
    const response = await fetch(`${SERVER_URL}/api/devices`, {
      headers: getHeaders(),
    });
    
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

export const fetchDevice = async (deviceId: number): Promise<Device> => {
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

export const toggleDevice = async (deviceId: number, isOn: boolean): Promise<Device> => {
  try {
    const response = await fetch(`${SERVER_URL}/api/devices/${deviceId}/toggle`, {
      method: 'POST',
      headers: getHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ isOn: !isOn }),
    });
    
    socket.emit('lamp_toggle', { deviceId, isOn: !isOn });
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

export const updateDevice = async (deviceId: number, updates: ThermostatUpdate): Promise<Device> => {
  try {
    const response = await fetch(`${SERVER_URL}/api/devices/${deviceId}`, {
      method: 'PUT',
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

export const checkServerConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${SERVER_URL}/api/devices`, {
      headers: getHeaders(),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const setServerUrl = (url: string): void => {
  // In a real app, you'd save this to AsyncStorage or similar
  console.log('Server URL set to:', url);
};
