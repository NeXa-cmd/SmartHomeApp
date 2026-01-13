import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ScreenLayout from '@/components/ScreenLayout';
import DeviceCard from '@/components/DeviceCard';
import ThermostatCard from '@/components/ThermostatCard';
import { fetchDevices, toggleDevice, updateDevice, getServerUrl } from '@/services/api';
import { Device, ThermostatUpdate } from '@/types/device';

const TABS = [
  { id: 'all', label: 'All', icon: 'apps-outline' },
  { id: 'light', label: 'Lights', icon: 'bulb-outline' },
  { id: 'thermostat', label: 'Climate', icon: 'thermometer-outline' },
  { id: 'lock', label: 'Security', icon: 'lock-closed-outline' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function Dashboard() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const hasLoaded = useRef(false);

  const filteredDevices = activeTab === 'all' 
    ? devices 
    : devices.filter(device => device.type === activeTab);

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

  useEffect(() => {
    if (!hasLoaded.current) {
      loadDevices();
      hasLoaded.current = true;
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDevices();
  }, []);

  const handleToggle = async (id: number, isOn: boolean) => {
    try {
      setDevices((prev) =>
        prev.map((device) =>
          device.id === id ? { ...device, isOn: !isOn } : device
        )
      );

      await toggleDevice(id, !isOn);
    } catch (err) {
      Alert.alert('Error', 'Failed to toggle device. Please try again.');
      loadDevices();
    }
  };

  const handleThermostatUpdate = async (deviceId: number, updates: ThermostatUpdate) => {
    try {
      setDevices((prev) =>
        prev.map((device) =>
          device.id === deviceId ? { ...device, ...updates } : device
        )
      );

      await updateDevice(deviceId, updates);
    } catch (err) {
      Alert.alert('Error', 'Failed to update thermostat.');
      loadDevices();
    }
  };

  const getTabCount = (tabId: TabId) => {
    if (tabId === 'all') return devices.length;
    return devices.filter(d => d.type === tabId).length;
  };

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

  const renderDeviceItem = ({ item }: { item: Device }) => {
    if (item.type === 'thermostat') {
      return (
        <ThermostatCard 
          device={item} 
          onUpdate={handleThermostatUpdate}
          onToggle={() => handleToggle(item.id, item.isOn)}
        />
      );
    }
    return <DeviceCard device={item} onToggle={() => handleToggle(item.id, item.isOn)} />;
  };

  if (loading) {
    return (
      <ScreenLayout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4A90D9" />
          <Text style={styles.loadingText}>Loading devices...</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (error) {
    return (
      <ScreenLayout>
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
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <View style={styles.subHeader}>
        <View>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.subHeaderText}>{devices.length} devices connected</Text>
        </View>
        <TouchableOpacity 
          style={styles.settingsIconBtn}
          onPress={() => router.push('/(tabs)/settings')}
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
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7F8C8D',
  },
  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIconText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  serverUrl: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  settingsButtonText: {
    color: '#4A90D9',
    fontSize: 16,
    fontWeight: '600',
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  subHeaderText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  settingsIconBtn: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  activeTab: {
    backgroundColor: '#4A90D9',
  },
  tabIcon: {
    marginRight: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginRight: 4,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: '#FFFFFF40',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666666',
  },
  activeTabBadgeText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 8,
    textAlign: 'center',
  },
});
