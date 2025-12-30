// ThermostatCard Component - Interactive thermostat control

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings, celsiusToFahrenheit } from '../context/SettingsContext';

const ThermostatCard = ({ device, onUpdate }) => {
  const { temperatureUnit } = useSettings();
  const [targetTemp, setTargetTemp] = useState(device.temperature || 22);
  const [currentTemp, setCurrentTemp] = useState(device.currentTemperature || 20);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const animatedTemp = useRef(new Animated.Value(currentTemp)).current;

  // Animate temperature change - slow and realistic
  useEffect(() => {
    if (device.isOn && currentTemp !== targetTemp) {
      const interval = setInterval(() => {
        setCurrentTemp(prev => {
          const diff = Math.abs(targetTemp - prev);
          // Slower change rate: 0.1 degree every 1.5 seconds
          const step = 0.1;
          
          if (diff <= step) {
            return targetTemp; // Snap to target when very close
          }
          
          if (prev < targetTemp) {
            return Math.round((prev + step) * 10) / 10;
          } else if (prev > targetTemp) {
            return Math.round((prev - step) * 10) / 10;
          }
          return prev;
        });
      }, 1500); // Update every 1.5 seconds

      return () => clearInterval(interval);
    }
  }, [targetTemp, currentTemp, device.isOn]);

  // Convert temperature based on unit
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

  const increaseTemp = () => {
    if (targetTemp < maxTemp) {
      const newTemp = targetTemp + 1;
      setTargetTemp(newTemp);
      setIsAdjusting(true);
      onUpdate(device.id, { temperature: newTemp });
      setTimeout(() => setIsAdjusting(false), 1000);
    }
  };

  const decreaseTemp = () => {
    if (targetTemp > minTemp) {
      const newTemp = targetTemp - 1;
      setTargetTemp(newTemp);
      setIsAdjusting(true);
      onUpdate(device.id, { temperature: newTemp });
      setTimeout(() => setIsAdjusting(false), 1000);
    }
  };

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
      </View>

      {device.isOn && (
        <View style={styles.controls}>
          {/* Current Temperature */}
          <View style={styles.currentTempContainer}>
            <Text style={styles.currentTempLabel}>Current</Text>
            <Text style={styles.currentTemp}>
              {displayTemp(currentTemp)}{unitLabel}
            </Text>
          </View>

          {/* Target Temperature Controls */}
          <View style={styles.targetContainer}>
            <TouchableOpacity 
              style={[styles.tempButton, targetTemp <= minTemp && styles.tempButtonDisabled]}
              onPress={decreaseTemp}
              disabled={targetTemp <= minTemp}
            >
              <Ionicons name="remove" size={24} color={targetTemp <= minTemp ? '#CCC' : '#4A90D9'} />
            </TouchableOpacity>

            <View style={styles.targetTempDisplay}>
              <Text style={styles.targetTempLabel}>Target</Text>
              <Text style={[styles.targetTemp, isAdjusting && styles.targetTempAdjusting]}>
                {displayTemp(targetTemp)}{unitLabel}
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.tempButton, targetTemp >= maxTemp && styles.tempButtonDisabled]}
              onPress={increaseTemp}
              disabled={targetTemp >= maxTemp}
            >
              <Ionicons name="add" size={24} color={targetTemp >= maxTemp ? '#CCC' : '#4A90D9'} />
            </TouchableOpacity>
          </View>

          {/* Temperature Progress Bar */}
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
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>{displayTemp(minTemp)}{unitLabel}</Text>
              <Text style={styles.progressLabel}>{displayTemp(maxTemp)}{unitLabel}</Text>
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#E0E0E0',
  },
  cardActive: {
    borderLeftColor: '#FF9800',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  controls: {
    marginTop: 20,
  },
  currentTempContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  currentTempLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  currentTemp: {
    fontSize: 48,
    fontWeight: '300',
    color: '#333',
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tempButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4A90D9',
  },
  tempButtonDisabled: {
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  targetTempDisplay: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  targetTempLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  targetTemp: {
    fontSize: 28,
    fontWeight: '600',
    color: '#4A90D9',
  },
  targetTempAdjusting: {
    color: '#FF9800',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    position: 'relative',
    overflow: 'visible',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  targetMarker: {
    position: 'absolute',
    top: -4,
    width: 4,
    height: 16,
    backgroundColor: '#333',
    borderRadius: 2,
    marginLeft: -2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#999',
  },
  offContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  offText: {
    fontSize: 16,
    color: '#999',
  },
});

export default ThermostatCard;
