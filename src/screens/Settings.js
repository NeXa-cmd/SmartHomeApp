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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>IP Address</Text>
              <TextInput
                style={styles.input}
                value={ipAddress}
                onChangeText={setIpAddress}
                placeholder="192.168.1.x"
                placeholderTextColor="#AAAAAA"
                keyboardType="numeric"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Port</Text>
              <TextInput
                style={styles.input}
                value={port}
                onChangeText={setPort}
                placeholder="3000"
                placeholderTextColor="#AAAAAA"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Full URL:</Text>
              <Text style={styles.previewUrl}>{buildUrl()}</Text>
            </View>
          </View>

          <View style={styles.helpCard}>
            <Ionicons name="help-circle-outline" size={20} color="#666" style={styles.helpIcon} />
            <View>
              <Text style={styles.helpTitle}>How to find your laptop's IP:</Text>
              <Text style={styles.helpText}>
                • Mac: System Preferences → Network{'\n'}
                • Windows: Open cmd, type "ipconfig"{'\n'}
                • Linux: Open terminal, type "ip addr"
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.testButton]}
              onPress={handleTestConnection}
              disabled={testing}
            >
              <Ionicons name="wifi-outline" size={20} color="#4A90D9" style={styles.buttonIcon} />
              <Text style={styles.testButtonText}>
                {testing ? 'Testing...' : 'Test Connection'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Ionicons name="save-outline" size={20} color="#FFF" style={styles.buttonIcon} />
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.backLink} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#666" />
            <Text style={styles.backLinkText}>Go Back</Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  previewContainer: {
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  previewUrl: {
    fontSize: 16,
    color: '#4A90D9',
    fontWeight: '500',
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  helpIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  testButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4A90D9',
  },
  testButtonText: {
    color: '#4A90D9',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4A90D9',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 8,
  },
  backLinkText: {
    color: '#666666',
    fontSize: 16,
    marginLeft: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  unitSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  unitOption: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  unitOptionActive: {
    backgroundColor: '#E8F4FD',
    borderColor: '#4A90D9',
  },
  unitText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  unitTextActive: {
    color: '#4A90D9',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});

export default Settings;
