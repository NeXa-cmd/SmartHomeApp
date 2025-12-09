// Settings Context - Global app settings (temperature unit, server URL, scenes)

import React, { createContext, useState, useContext } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [serverUrl, setServerUrl] = useState('http://localhost:3000');
  const [temperatureUnit, setTemperatureUnit] = useState('C'); // 'C' or 'F'
  const [activeScenes, setActiveScenes] = useState({}); // { sceneId: true/false }

  const value = {
    serverUrl,
    setServerUrl,
    temperatureUnit,
    setTemperatureUnit,
    activeScenes,
    setActiveScenes,
    // Helper to toggle a specific scene

// TODO: Complete remaining implementation (40% done)
