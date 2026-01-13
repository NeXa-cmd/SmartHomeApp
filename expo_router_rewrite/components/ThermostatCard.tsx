import { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { socket } from '@/services/api';
import { Device, ThermostatUpdate } from '@/types/device';

interface ThermostatCardProps {
  device: Device;
  onUpdate: (deviceId: number, updates: ThermostatUpdate) => void;
  onToggle: () => void;
}

export default function ThermostatCard({ device, onUpdate, onToggle }: ThermostatCardProps) {
  const [targetTemp, setTargetTemp] = useState(Number(device.temperature) || 22);
  const [currentTemp, setCurrentTemp] = useState(Number(device.currentTemperature) || 20);

  useEffect(() => {
    const handleUpdate = (data: any) => {
      if (data.deviceId === device.id || data.id === device.id) {
        if (data.currentTemperature !== undefined) {
          setCurrentTemp(Number(data.currentTemperature));
        }
        if (data.temperature !== undefined) {
          setTargetTemp(Number(data.temperature));
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

  useEffect(() => {
    if (device.temperature !== undefined) {
      setTargetTemp(Number(device.temperature));
    }
    if (device.currentTemperature !== undefined) {
      setCurrentTemp(Number(device.currentTemperature));
    }
  }, [device.temperature, device.currentTemperature]);

  const getStatusColor = (): string => {
    if (!device.isOn) return '#9E9E9E';
    if (currentTemp < targetTemp) return '#FF9800';
    if (currentTemp > targetTemp) return '#2196F3';
    return '#4CAF50';
  };

  const getStatusText = (): string => {
    if (!device.isOn) return 'Off';
    if (Math.abs(currentTemp - targetTemp) < 0.5) return 'Target reached';
    if (currentTemp < targetTemp) return 'Heating...';
    return 'Cooling...';
  };

  const minTemp = 16;
  const maxTemp = 30;

  const handleSliderComplete = (value: number) => {
    const roundedValue = Math.round(value);
    setTargetTemp(roundedValue);
    
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
          value={Boolean(device.isOn)}
          onValueChange={() => {
            onToggle();
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
          <View style={styles.tempDisplayRow}>
            <View style={styles.tempBox}>
              <Text style={styles.tempLabel}>Current</Text>
              <Text style={[styles.tempValue, { color: getStatusColor() }]}>
                {Math.round(currentTemp * 10) / 10}°C
              </Text>
            </View>
            <View style={styles.tempBox}>
              <Text style={styles.tempLabel}>Target</Text>
              <Text style={[styles.tempValue, { color: '#4A90D9' }]}>
                {Math.round(targetTemp * 10) / 10}°C
              </Text>
            </View>
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>{minTemp}°C</Text>
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
            <Text style={styles.sliderLabel}>{maxTemp}°C</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardActive: {
    borderWidth: 1,
    borderColor: '#4CAF5020',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  controls: {
    marginTop: 16,
  },
  tempDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  tempBox: {
    alignItems: 'center',
  },
  tempLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  tempValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
  },
});
