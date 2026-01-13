// ThermostatCard Component - Interactive thermostat control with slider

import { useState, useEffect } from 'react';
import { View, Text, Switch } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useSettings, celsiusToFahrenheit } from '../context/SettingsContext';
import { socket } from '../services/api';
import styles from '../styles/ThermostatCardStyles';


const ThermostatCard = ({ device, onUpdate, onToggle }) => {
  const { temperatureUnit } = useSettings();
  const [targetTemp, setTargetTemp] = useState(device.temperature || 22);
  const [currentTemp, setCurrentTemp] = useState(device.currentTemperature || 20);

  // Listen for real-time updates from server via WebSocket
  useEffect(() => {
    const handleUpdate = (data) => {
      if (data.deviceId === device.id || data.id === device.id) {
        if (data.currentTemperature !== undefined) {
          setCurrentTemp(data.currentTemperature);
        }
        if (data.temperature !== undefined) {
          setTargetTemp(data.temperature);
        }
      }
    };

    socket.on('thermostat_update', handleUpdate);
    socket.on('device_update', handleUpdate);

    return () => {
      socket.off('thermostat_update', handleUpdate);
      socket.off('device_update', handleUpdate);
    };
  }, [device.id]);

  // Sync with device prop changes
  useEffect(() => {
    if (device.temperature !== undefined) {
      setTargetTemp(device.temperature);
    }
    if (device.currentTemperature !== undefined) {
      setCurrentTemp(device.currentTemperature);
    }
  }, [device.temperature, device.currentTemperature]);

  // Get status color based on temperature difference
  const getStatusColor = () => {
    if (!device.isOn) return '#9E9E9E';
    if (currentTemp < targetTemp) return '#FF9800'; // Heating
    if (currentTemp > targetTemp) return '#2196F3'; // Cooling
    return '#4CAF50'; // Target reached
  };

  const getStatusText = () => {
    if (!device.isOn) return 'Off';
    if (Math.abs(currentTemp - targetTemp) < 0.5) return 'Target reached';
    if (currentTemp < targetTemp) return 'Heating...';
    return 'Cooling...';
  };

  const displayTemp = (temp) => {
    if (temperatureUnit === 'F') {
      return celsiusToFahrenheit(temp);
    }
    return Math.round(temp * 10) / 10;
  };

  const unitLabel = temperatureUnit === 'F' ? '°F' : '°C';

  // Temperature limits
  const minTemp = 16;
  const maxTemp = 30;

  const handleSliderComplete = (value) => {
    const roundedValue = Math.round(value);
    setTargetTemp(roundedValue);
    
    // Send update to server via REST and WebSocket
    onUpdate(device.id, { temperature: roundedValue });
    socket.emit('thermostat_set', { 
      deviceId: device.id, 
      temperature: roundedValue 
    });
  };

  return (
    <View style={[styles.card, device.isOn && styles.cardActive]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: getStatusColor() + '20' }]}>
            <Ionicons name="thermometer" size={24} color={getStatusColor()} />
          </View>
          <View>
            <Text style={styles.name}>{device.name}</Text>
            <Text style={[styles.status, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
        <Switch
          value={device.isOn}
          onValueChange={() => {
            if (onToggle) onToggle();
            socket.emit('thermostat_toggle', { 
              deviceId: device.id, 
              isOn: !device.isOn 
            });
          }}
          trackColor={{ false: '#E0E0E0', true: '#81C784' }}
          thumbColor={device.isOn ? '#4CAF50' : '#BDBDBD'}
        />
      </View>

      {device.isOn && (
        <View style={styles.controls}>
          {/* Temperature Display */}
          <View style={styles.tempDisplayRow}>
            <View style={styles.tempBox}>
              <Text style={styles.tempLabel}>Current</Text>
              <Text style={[styles.tempValue, { color: getStatusColor() }]}>
                {displayTemp(currentTemp)}{unitLabel}
              </Text>
            </View>
            <View style={styles.tempBox}>
              <Text style={styles.tempLabel}>Target</Text>
              <Text style={[styles.tempValue, { color: '#4A90D9' }]}>
                {displayTemp(targetTemp)}{unitLabel}
              </Text>
            </View>
          </View>

          {/* Slider Control */}
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>{displayTemp(minTemp)}{unitLabel}</Text>
            <Slider
              style={styles.slider}
              minimumValue={minTemp}
              maximumValue={maxTemp}
              value={targetTemp}
              onSlidingComplete={handleSliderComplete}
              minimumTrackTintColor="#FF9800"
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor="#FF9800"
              step={1}
            />
            <Text style={styles.sliderLabel}>{displayTemp(maxTemp)}{unitLabel}</Text>
          </View>

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${((currentTemp - minTemp) / (maxTemp - minTemp)) * 100}%`,
                    backgroundColor: getStatusColor(),
                  }
                ]} 
              />
              <View 
                style={[
                  styles.targetMarker,
                  { left: `${((targetTemp - minTemp) / (maxTemp - minTemp)) * 100}%` }
                ]}
              />
            </View>
          </View>
        </View>
      )}

      {!device.isOn && (
        <View style={styles.offContainer}>
          <Text style={styles.offText}>Thermostat is off</Text>
        </View>
      )}
    </View>
  );
};

export default ThermostatCard;
