// Settings Screen - Configure server IP address and preferences

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { setServerUrl, getServerUrl, checkServerConnection } from '../services/api';
import { useSettings } from '../context/SettingsContext';

const Settings = ({ navigation }) => {
  const { temperatureUnit, setTemperatureUnit } = useSettings();
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('3000');
  const [testing, setTesting] = useState(false);

  // Load current server URL on mount
  useEffect(() => {
    const currentUrl = getServerUrl();
    // Parse existing URL to get IP and port
    try {
      const url = new URL(currentUrl);
      setIpAddress(url.hostname);
      setPort(url.port || '3000');
    } catch (e) {
      // If URL parsing fails, use defaults
      setIpAddress('192.168.1.1');
      setPort('3000');
    }
  }, []);

  // Build full URL from IP and port
  const buildUrl = () => {
    return `http://${ipAddress}:${port}`;
  };

  // Test connection to server
  const handleTestConnection = async () => {
    if (!ipAddress) {
      Alert.alert('Error', 'Please enter an IP address');
      return;
    }

    setTesting(true);
    const url = buildUrl();
    setServerUrl(url);

    try {
      const isConnected = await checkServerConnection();
      
      if (isConnected) {
        Alert.alert('Success', `Connected to server at ${url}`);
      } else {
        Alert.alert(
          'Connection Failed',
          'Could not connect to the server. Make sure:\n\n' +
          '1. The server is running (node server.js)\n' +
          '2. Your phone and laptop are on the same WiFi\n' +
          '3. The IP address is correct'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to test connection');
    } finally {
      setTesting(false);
    }
  };

  // Save settings
  const handleSave = () => {
    if (!ipAddress) {
      Alert.alert('Error', 'Please enter an IP address');
      return;
    }

    const url = buildUrl();
    setServerUrl(url);
    
    Alert.alert(
      'Settings Saved',
      `Server URL set to:\n${url}`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Settings" />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Temperature Unit Selection */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="thermometer-outline" size={24} color="#4A90D9" />
              <Text style={styles.sectionTitle}>Temperature Unit</Text>
            </View>
            <Text style={styles.description}>
              Choose your preferred temperature unit for the thermostat display.
            </Text>

            <View style={styles.unitSelector}>
              <TouchableOpacity
                style={[
                  styles.unitOption,
                  temperatureUnit === 'C' && styles.unitOptionActive,
                ]}
                onPress={() => setTemperatureUnit('C')}
              >
                <Text style={[
                  styles.unitText,
                  temperatureUnit === 'C' && styles.unitTextActive,
                ]}>
                  Celsius (°C)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitOption,
                  temperatureUnit === 'F' && styles.unitOptionActive,
                ]}
                onPress={() => setTemperatureUnit('F')}
              >
                <Text style={[
                  styles.unitText,
                  temperatureUnit === 'F' && styles.unitTextActive,
                ]}>
                  Fahrenheit (°F)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Server Configuration */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="server-outline" size={24} color="#4A90D9" />
              <Text style={styles.sectionTitle}>Server Configuration</Text>
            </View>
            <Text style={styles.description}>
              Enter your laptop's local IP address to connect the app to your Smart Home server.
            </Text>


// TODO: Complete remaining implementation (40% done)
