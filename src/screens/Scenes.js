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

// TODO: Complete remaining implementation (40% done)
