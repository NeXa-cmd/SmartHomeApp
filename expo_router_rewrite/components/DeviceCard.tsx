import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Device } from '@/types/device';

interface DeviceCardProps {
  device: Device;
  onToggle: () => void;
}

const getIcon = (device: Device): keyof typeof Ionicons.glyphMap => {
  const isOn = device.isOn;
  switch (device.type) {
    case 'light':
      return isOn ? 'bulb' : 'bulb-outline';
    case 'lock':
      return isOn ? 'lock-closed' : 'lock-open-outline';
    case 'thermostat':
      return 'thermometer';
    case 'ledStrip':
      return 'color-wand';
    default:
      return 'hardware-chip-outline';
  }
};

const getStatusText = (device: Device): string => {
  if (device.type === 'lock') {
    return device.isOn ? 'Locked' : 'Unlocked';
  }
  return device.isOn ? 'On' : 'Off';
};

const getStatusColor = (device: Device): string => {
  if (device.type === 'lock') {
    return device.isOn ? '#4CAF50' : '#FF9800';
  }
  return device.isOn ? '#4CAF50' : '#9E9E9E';
};

const getIconColor = (device: Device): string => {
  if (!device.isOn) return '#9E9E9E';
  switch (device.type) {
    case 'light':
      return '#FFB347';
    case 'lock':
      return '#4CAF50';
    case 'thermostat':
      return '#FF9800';
    case 'ledStrip':
      return device.color || '#ad1e1eff';
    default:
      return '#4A90D9';
  }
};

export default function DeviceCard({ device, onToggle }: DeviceCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, device.isOn && styles.cardActive]}
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
        value={device.isOn}
        onValueChange={onToggle}
        trackColor={{ false: '#E0E0E0', true: '#81C784' }}
        thumbColor={device.isOn ? '#4CAF50' : '#BDBDBD'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
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
  leftSection: {
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
  info: {
    flex: 1,
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
});
