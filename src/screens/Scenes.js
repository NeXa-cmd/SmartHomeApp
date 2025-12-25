// Scenes Screen - Predefined automation scenes

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { fetchDevices, updateDevice } from '../services/api';
import { useSettings } from '../context/SettingsContext';

const SCENES_DATA = [
  { id: 1, name: 'Good Morning', icon: 'sunny-outline', color: '#FFB347', description: 'Lights on, thermostat to 22°C', functional: false },
  { id: 2, name: 'Good Night', icon: 'moon-outline', color: '#7B68EE', description: 'All lights off, lock doors', functional: true },
  { id: 3, name: 'Movie Time', icon: 'film-outline', color: '#FF6B6B', description: 'Dim lights, TV on', functional: false },
  { id: 4, name: 'Away Mode', icon: 'airplane-outline', color: '#4ECDC4', description: 'All off, security on', functional: false },
  { id: 5, name: 'Party Mode', icon: 'musical-notes-outline', color: '#FF69B4', description: 'Colorful lights, music on', functional: false },
  { id: 6, name: 'Work Mode', icon: 'laptop-outline', color: '#45B7D1', description: 'Bright lights, focus mode', functional: false },
];

const Scenes = ({ navigation }) => {
  const { activeScenes, toggleSceneActive } = useSettings();
  const [loading, setLoading] = useState(false);

  // Check if a scene is active
  const isSceneActive = (id) => activeScenes[id] || false;

  // Execute Good Night scene - turn off all lights, lock all doors
  const executeGoodNight = async () => {
    setLoading(true);
    try {
      // Fetch current devices
      const devices = await fetchDevices();
      
      // Turn off all lights
      const lights = devices.filter(d => d.type === 'light' && d.isOn === true);
      for (const light of lights) {
        await updateDevice(light.id, { isOn: false });
      }
      
      // Lock all locks (isOn = true means locked)
      const locks = devices.filter(d => d.type === 'lock' && d.isOn === false);
      for (const lock of locks) {
        await updateDevice(lock.id, { isOn: true });
      }

      // Update scene state in context
      toggleSceneActive(2, true);

      Alert.alert(
        'Good Night',
        'All lights turned off and doors locked. Sleep well!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to execute scene. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  // Deactivate Good Night scene
  const deactivateGoodNight = () => {
    toggleSceneActive(2, false);
  };

  const toggleScene = async (id) => {
    const scene = SCENES_DATA.find(s => s.id === id);
    const currentlyActive = isSceneActive(id);
    
    // Only Good Night scene is functional
    if (id === 2) {
      if (!currentlyActive) {
        await executeGoodNight();
      } else {
        deactivateGoodNight();
      }
    } else {
      // Other scenes just show a message
      Alert.alert(
        'Coming Soon',
        `The "${scene.name}" scene is not yet configured.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Scenes" />
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4A90D9" />
          <Text style={styles.loadingText}>Executing scene...</Text>
        </View>
      )}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Quick automation presets</Text>
        
        {SCENES_DATA.map((scene) => {
          const active = isSceneActive(scene.id);
          return (
            <TouchableOpacity 
              key={scene.id} 
              style={[
                styles.sceneCard, 
                active && styles.sceneCardActive,
                !scene.functional && styles.sceneCardDisabled
              ]}
              onPress={() => toggleScene(scene.id)}
              disabled={loading}
            >
              <View style={[styles.sceneIcon, { backgroundColor: scene.color + '20' }]}>
                <Ionicons name={scene.icon} size={28} color={scene.color} />
              </View>
              <View style={styles.sceneInfo}>
                <View style={styles.sceneHeader}>
                  <Text style={styles.sceneName}>{scene.name}</Text>
                  {!scene.functional && (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonBadgeText}>Coming Soon</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.sceneDescription}>{scene.description}</Text>
              </View>
              {scene.functional ? (
                <Switch
                  value={active}
                  onValueChange={() => toggleScene(scene.id)}
                  trackColor={{ false: '#E0E0E0', true: '#81C784' }}
                  thumbColor={active ? '#4CAF50' : '#BDBDBD'}
                  disabled={loading}
                />
              ) : (
                <Ionicons name="lock-closed-outline" size={20} color="#CCC" />
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.addSceneButton}>
          <Ionicons name="add-circle-outline" size={24} color="#4A90D9" />
          <Text style={styles.addSceneText}>Create New Scene</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dashboard')}>
          <Ionicons name="home-outline" size={24} color="#999" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Rooms')}>
          <Ionicons name="grid-outline" size={24} color="#999" />
          <Text style={styles.navText}>Rooms</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="color-wand" size={24} color="#4A90D9" />
          <Text style={[styles.navText, styles.navTextActive]}>Scenes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
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
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  sceneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sceneCardActive: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  sceneCardDisabled: {
    opacity: 0.7,
  },
  sceneIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sceneInfo: {
    flex: 1,
  },
  sceneHeader: {
    flexDirection: 'row',
    alignItems: 'center',

// TODO: Complete remaining implementation (70% done)
