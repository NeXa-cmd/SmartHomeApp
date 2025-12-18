// DeviceCard Component - UI for a single smart device

import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DeviceCard = ({ device, onToggle }) => {
  // Get icon based on device type
  const getIcon = () => {
    switch (device.type) {
      case 'light':
        return device.isOn ? 'bulb' : 'bulb-outline';
      case 'lock':
        return device.isOn ? 'lock-closed' : 'lock-open-outline';
      case 'thermostat':
        return 'thermometer';
      default:
        return 'hardware-chip-outline';
    }
  };

  // Get status text based on device type
  const getStatusText = () => {
    if (device.type === 'lock') {
      return device.isOn ? 'Locked' : 'Unlocked';
    }
    return device.isOn ? 'On' : 'Off';
  };

  // Get status color
  const getStatusColor = () => {
    if (device.type === 'lock') {
      return device.isOn ? '#4CAF50' : '#FF9800';
    }
    return device.isOn ? '#4CAF50' : '#9E9E9E';
  };

  // Get icon color
  const getIconColor = () => {
    if (!device.isOn) return '#9E9E9E';
    switch (device.type) {
      case 'light':
        return '#FFB347';
      case 'lock':
        return '#4CAF50';
      case 'thermostat':
        return '#FF9800';
      default:
        return '#4A90D9';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, device.isOn && styles.cardActive]} 
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '20' }]}>
          <Ionicons name={getIcon()} size={24} color={getIconColor()} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{device.name}</Text>
          <Text style={[styles.status, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>
      
      <Switch
        value={device.isOn}
        onValueChange={onToggle}
        trackColor={{ false: '#E0E0E0', true: '#81C784' }}
        thumbColor={device.isOn ? '#4CAF50' : '#BDBDBD'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',

// TODO: Complete remaining implementation (70% done)
