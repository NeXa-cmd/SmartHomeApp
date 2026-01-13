// DeviceCard Component - UI for a single smart device

import React from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/DeviceCardStyles';

// Get isOn status from device (handles different API structures)
const getIsOn = (device) => {
  if (device.isOn !== undefined) return device.isOn;
  if (device.status?.isOn !== undefined) return device.status.isOn;
  if (typeof device.status === 'boolean') return device.status;
  return false;
};

const getIcon = (device) => {
  const isOn = getIsOn(device);
  switch (device.type) {
    case 'light':
      return isOn ? 'bulb' : 'bulb-outline';
    case 'lock':
      return isOn ? 'lock-closed' : 'lock-open-outline';
    case 'thermostat':
      return 'thermometer';
    default:
      return 'hardware-chip-outline';
  }
};

// Get status text based on device type
const getStatusText = (device) => {
  const isOn = getIsOn(device);
  if (device.type === 'lock') {
    return isOn ? 'Locked' : 'Unlocked';
  }
  return isOn ? 'On' : 'Off';
};

// Get status color
const getStatusColor = (device) => {
  const isOn = getIsOn(device);
  if (device.type === 'lock') {
    return isOn ? '#4CAF50' : '#FF9800';
  }
  return isOn ? '#4CAF50' : '#9E9E9E';
};

// Get icon color
const getIconColor = (device) => {
  const isOn = getIsOn(device);
  if (!isOn) return '#9E9E9E';
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


const DeviceCard = ({ device, onToggle }) => {
  const isOn = getIsOn(device);

  return (
    <TouchableOpacity 
      style={[styles.card, isOn && styles.cardActive]} 
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: getIconColor(device) + '20' }]}>
          <Ionicons name={getIcon(device)} size={24} color={getIconColor(device)} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{device.name}</Text>
          <Text style={[styles.status, { color: getStatusColor(device) }]}>
            {getStatusText(device)}
          </Text>
        </View>
      </View>
      
      <Switch
        value={isOn}
        onValueChange={onToggle}
        trackColor={{ false: '#E0E0E0', true: '#81C784' }}
        thumbColor={isOn ? '#4CAF50' : '#BDBDBD'}
      />
    </TouchableOpacity>
  );
};

export default DeviceCard;
