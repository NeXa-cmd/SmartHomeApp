import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '@/components/ScreenLayout';
import { setServerUrl, getServerUrl, checkServerConnection } from '@/services/api';

export default function Settings() {
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('3000');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const currentUrl = getServerUrl();
    try {
      const url = new URL(currentUrl);
      setIpAddress(url.hostname);
      setPort(url.port || '3000');
    } catch (e) {
      setIpAddress('192.168.1.1');
      setPort('3000');
    }
  }, []);

  const buildUrl = () => {
    return `http://${ipAddress}:${port}`;
  };

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

  const handleSave = () => {
    if (!ipAddress) {
      Alert.alert('Error', 'Please enter an IP address');
      return;
    }

    const url = buildUrl();
    setServerUrl(url);
    
    Alert.alert(
      'Settings Saved',
      `Server URL set to:\n${url}`
    );
  };

  return (
    <ScreenLayout scrollable>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="server-outline" size={24} color="#4A90D9" />
            <Text style={styles.sectionTitle}>Server Configuration</Text>
          </View>
          
          <Text style={styles.description}>
            Configure the server IP address to connect to your Smart Home backend.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>IP Address</Text>
            <TextInput
              style={styles.input}
              value={ipAddress}
              onChangeText={setIpAddress}
              placeholder="192.168.1.100"
              placeholderTextColor="#999"
              keyboardType="numeric"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Port</Text>
            <TextInput
              style={styles.input}
              value={port}
              onChangeText={setPort}
              placeholder="3000"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.urlPreview}>
            <Text style={styles.urlLabel}>Full URL:</Text>
            <Text style={styles.urlText}>{buildUrl()}</Text>
          </View>

          <TouchableOpacity 
            style={[styles.testButton, testing && styles.testButtonDisabled]}
            onPress={handleTestConnection}
            disabled={testing}
          >
            <Ionicons name="wifi-outline" size={20} color="#FFFFFF" />
            <Text style={styles.testButtonText}>
              {testing ? 'Testing...' : 'Test Connection'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={24} color="#4A90D9" />
            <Text style={styles.sectionTitle}>How to Find Your IP</Text>
          </View>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>1. Open Terminal on your laptop</Text>
            <Text style={styles.infoText}>2. Type: ifconfig (Mac) or ipconfig (Windows)</Text>
            <Text style={styles.infoText}>3. Look for your local IP address (192.168.x.x)</Text>
            <Text style={styles.infoText}>4. Make sure your phone is on the same WiFi</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="apps-outline" size={24} color="#4A90D9" />
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>TypeScript</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  urlPreview: {
    backgroundColor: '#F5F7FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  urlLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  urlText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90D9',
    padding: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoBox: {
    backgroundColor: '#F5F7FA',
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 8,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  infoValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
});
