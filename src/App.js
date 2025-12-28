// App.js - Main Navigation Setup
// Simple state-based navigation to avoid native module issues

import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SettingsProvider } from './context/SettingsContext';

// Import screens
import LoginScreen from './screens/LoginScreen';
import Dashboard from './screens/Dashboard';
import Settings from './screens/Settings';
import Rooms from './screens/Rooms';
import Scenes from './screens/Scenes';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Login');

  // Simple navigation object to pass to screens
  const navigation = {
    navigate: (screenName) => setCurrentScreen(screenName),
    replace: (screenName) => setCurrentScreen(screenName),
    goBack: () => {
      // Simple back logic
      if (currentScreen === 'Settings' || currentScreen === 'Rooms' || currentScreen === 'Scenes') {
        setCurrentScreen('Dashboard');
      } else if (currentScreen === 'Dashboard') {
        setCurrentScreen('Login');
      }
    },
  };

  // Render the current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Login':
        return <LoginScreen navigation={navigation} />;
      case 'Dashboard':
        return <Dashboard navigation={navigation} />;
      case 'Settings':

// TODO: Complete remaining implementation (70% done)
