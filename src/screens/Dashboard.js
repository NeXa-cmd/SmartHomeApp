// Dashboard Screen - Main screen with tabs showing smart devices

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import DeviceCard from '../components/DeviceCard';
import ThermostatCard from '../components/ThermostatCard';
import { fetchDevices, toggleDevice, updateDevice, getServerUrl } from '../services/api';
import { useSettings } from '../context/SettingsContext';

const TABS = [
  { id: 'all', label: 'All', icon: 'apps-outline' },
  { id: 'light', label: 'Lights', icon: 'bulb-outline' },
  { id: 'thermostat', label: 'Climate', icon: 'thermometer-outline' },
  { id: 'lock', label: 'Security', icon: 'lock-closed-outline' },
];

const Dashboard = ({ navigation }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // Filter devices based on active tab
  const filteredDevices = activeTab === 'all' 
    ? devices 
    : devices.filter(device => device.type === activeTab);

  // Load devices from server
  const loadDevices = async () => {
    try {
      setError(null);
      const data = await fetchDevices();
      setDevices(data);
    } catch (err) {
      setError('Could not connect to server. Check your IP settings.');
      console.error('Failed to load devices:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load devices when screen mounts
  useEffect(() => {
    loadDevices();
  }, []);

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDevices();
  }, []);

  // Handle device toggle
  const handleToggle = async (deviceId) => {
    try {
      // Optimistic update - update UI immediately
      setDevices((prevDevices) =>
        prevDevices.map((device) =>
          device.id === deviceId ? { ...device, isOn: !device.isOn } : device
        )
      );

      // Send request to server
      const updatedDevice = await toggleDevice(deviceId);

      // Update with server response
      setDevices((prevDevices) =>
        prevDevices.map((device) =>
          device.id === deviceId ? updatedDevice : device
        )
      );
    } catch (err) {
      // Revert on error
      Alert.alert('Error', 'Failed to toggle device. Please try again.');
      loadDevices(); // Reload to get correct state
    }
  };

  // Handle thermostat temperature update
  const handleThermostatUpdate = async (deviceId, updates) => {
    try {
      // Optimistic update
      setDevices((prevDevices) =>
        prevDevices.map((device) =>
          device.id === deviceId ? { ...device, ...updates } : device
        )
      );

      // Send to server
      await updateDevice(deviceId, updates);
    } catch (err) {
      Alert.alert('Error', 'Failed to update thermostat.');
      loadDevices();
    }
  };

  // Get device count for each tab
  const getTabCount = (tabId) => {
    if (tabId === 'all') return devices.length;
    return devices.filter(d => d.type === tabId).length;
  };

  // Render tab bar
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.activeTab,
          ]}
          onPress={() => setActiveTab(tab.id)}
        >
          <Ionicons 
            name={tab.icon} 
            size={16} 
            color={activeTab === tab.id ? '#FFFFFF' : '#666666'} 
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText,
            ]}
          >
            {tab.label}
          </Text>
          <View style={[
            styles.tabBadge,
            activeTab === tab.id && styles.activeTabBadge,
          ]}>
            <Text style={[
              styles.tabBadgeText,
              activeTab === tab.id && styles.activeTabBadgeText,
            ]}>
              {getTabCount(tab.id)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render device item - use ThermostatCard for thermostats
  const renderDeviceItem = ({ item }) => {
    if (item.type === 'thermostat') {
      return (
        <ThermostatCard 
          device={item} 
          onUpdate={handleThermostatUpdate}
          onToggle={() => handleToggle(item.id)}
        />
      );
    }
    return <DeviceCard device={item} onToggle={() => handleToggle(item.id)} />;
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Smart Home" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4A90D9" />
          <Text style={styles.loadingText}>Loading devices...</Text>
        </View>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Smart Home" />
        <View style={styles.centered}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>!</Text>
          </View>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.serverUrl}>Server: {getServerUrl()}</Text>
          
          <TouchableOpacity style={styles.retryButton} onPress={loadDevices}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingsButton} 
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render device list with tabs
  return (
    <View style={styles.container}>
      <Header title="Smart Home" />
      
      <View style={styles.subHeader}>
        <View>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.subHeaderText}>{devices.length} devices connected</Text>
        </View>
        <TouchableOpacity 
          style={styles.settingsIconBtn}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={20} color="#4A90D9" />
        </TouchableOpacity>
      </View>

      {renderTabs()}

      <FlatList
        data={filteredDevices}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDeviceItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4A90D9']}
            tintColor="#4A90D9"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color="#CCC" />
            <Text style={styles.emptyTitle}>No devices found</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'all' 
                ? 'No devices are connected yet' 
                : `No ${TABS.find(t => t.id === activeTab)?.label.toLowerCase()} devices`}
            </Text>
          </View>
        }
      />

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#4A90D9" />
          <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Rooms')}>
          <Ionicons name="grid-outline" size={24} color="#999" />
          <Text style={styles.navText}>Rooms</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Scenes')}>
          <Ionicons name="color-wand-outline" size={24} color="#999" />
          <Text style={styles.navText}>Scenes</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="person-outline" size={24} color="#999" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorIconText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF5252',
  },
  errorText: {
    fontSize: 16,
    color: '#FF5252',
    textAlign: 'center',
    marginBottom: 8,
  },
  serverUrl: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4A90D9',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 12,
  },
  retryButtonText: {

// TODO: Complete remaining implementation (70% done)
