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


// TODO: Complete remaining implementation (40% done)
