// Rooms Screen - View devices by room

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';

const ROOMS = [
  { id: 1, name: 'Living Room', devices: 3, icon: 'tv-outline' },
  { id: 2, name: 'Bedroom', devices: 2, icon: 'bed-outline' },
  { id: 3, name: 'Kitchen', devices: 2, icon: 'restaurant-outline' },
  { id: 4, name: 'Bathroom', devices: 1, icon: 'water-outline' },
  { id: 5, name: 'Garage', devices: 1, icon: 'car-outline' },
  { id: 6, name: 'Garden', devices: 2, icon: 'leaf-outline' },
];

const Rooms = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header title="Rooms" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Manage devices by room</Text>
        
        <View style={styles.roomsGrid}>
          {ROOMS.map((room) => (
            <TouchableOpacity key={room.id} style={styles.roomCard}>
              <View style={styles.roomIconContainer}>
                <Ionicons name={room.icon} size={32} color="#4A90D9" />
              </View>
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.roomDevices}>{room.devices} devices</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addRoomButton}>
          <Ionicons name="add-circle-outline" size={24} color="#4A90D9" />
          <Text style={styles.addRoomText}>Add New Room</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dashboard')}>
          <Ionicons name="home-outline" size={24} color="#999" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="grid" size={24} color="#4A90D9" />
          <Text style={[styles.navText, styles.navTextActive]}>Rooms</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Scenes')}>
          <Ionicons name="color-wand-outline" size={24} color="#999" />
          <Text style={styles.navText}>Scenes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="person-outline" size={24} color="#999" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

// TODO: Complete remaining implementation (40% done)
