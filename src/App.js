// App.js - Main App Component with Providers

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SettingsProvider } from './context/SettingsContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <SettingsProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
    </SettingsProvider>
  );
}
