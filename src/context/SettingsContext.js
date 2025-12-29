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
    toggleSceneActive: (sceneId, isActive) => {
      setActiveScenes(prev => ({ ...prev, [sceneId]: isActive }));
    },
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Temperature conversion helpers
export const celsiusToFahrenheit = (celsius) => {
  return Math.round((celsius * 9/5) + 32);
};

export const fahrenheitToCelsius = (fahrenheit) => {
  return Math.round((fahrenheit - 32) * 5/9);
};
