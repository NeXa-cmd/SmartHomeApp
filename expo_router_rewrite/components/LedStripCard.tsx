import { useState } from 'react';
import { View, Text, Switch, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Device } from '@/types/device';
import { socket } from '@/services/api';

interface LedStripCardProps {
    device: Device;
    onToggle: () => void;
    onColorChange: (color: string) => void;
}

export default function LedStripCard({ device, onToggle, onColorChange }: LedStripCardProps) {
    const [colorInput, setColorInput] = useState(device.color || '#ad1e1eff');

    const handleColorChange = (color: string) => {
        setColorInput(color);

        // Validate hex color format (with or without #)
        const hexPattern = /^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
        if (hexPattern.test(color)) {
            const formattedColor = color.startsWith('#') ? color : `#${color}`;
            onColorChange(formattedColor);

            // Send WebSocket event for LED strip color change
            socket.emit('room_led_color', {
                deviceId: device.id,
                color: formattedColor,
                room: device.room || 'bedroom'
            });
        }
    };

    const presetColors = [
        '#FF0000', // Red
        '#00FF00', // Green
        '#0000FF', // Blue
        '#FFFF00', // Yellow
        '#FF00FF', // Magenta
        '#00FFFF', // Cyan
        '#FF8800', // Orange
        '#8800FF', // Purple
        '#FFFFFF', // White
    ];

    return (
        <View style={[styles.card, device.isOn && styles.cardActive]}>
            <View style={styles.header}>
                <View style={styles.leftSection}>
                    <View style={[styles.iconContainer, { backgroundColor: (device.color || '#ad1e1eff') + '20' }]}>
                        <Ionicons name="color-wand" size={24} color={device.color || '#ad1e1eff'} />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.name}>{device.name}</Text>
                        <Text style={[styles.status, { color: device.isOn ? '#4CAF50' : '#9E9E9E' }]}>
                            {device.isOn ? 'On' : 'Off'}
                        </Text>
                    </View>
                </View>

                <Switch
                    value={device.isOn}
                    onValueChange={onToggle}
                    trackColor={{ false: '#E0E0E0', true: '#81C784' }}
                    thumbColor={device.isOn ? '#4CAF50' : '#BDBDBD'}
                />
            </View>

            {device.isOn && (
                <View style={styles.colorSection}>
                    <Text style={styles.sectionLabel}>Color Picker</Text>

                    {/* Color Input */}
                    <View style={styles.inputContainer}>
                        <View style={[styles.colorPreview, { backgroundColor: colorInput }]} />
                        <TextInput
                            style={styles.colorInput}
                            value={colorInput}
                            onChangeText={handleColorChange}
                            placeholder="#RRGGBB"
                            placeholderTextColor="#999"
                            autoCapitalize="characters"
                            maxLength={9}
                        />
                    </View>

                    {/* Preset Colors */}
                    <Text style={styles.presetLabel}>Quick Colors</Text>
                    <View style={styles.presetContainer}>
                        {presetColors.map((color) => (
                            <TouchableOpacity
                                key={color}
                                style={[
                                    styles.presetColor,
                                    { backgroundColor: color },
                                    colorInput.toUpperCase() === color && styles.presetColorActive
                                ]}
                                onPress={() => handleColorChange(color)}
                            />
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 4,
    },
    status: {
        fontSize: 14,
        fontWeight: '500',
    },
    colorSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
    },
    presetLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        marginTop: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    colorPreview: {
        width: 32,
        height: 32,
        borderRadius: 8,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    colorInput: {
        flex: 1,
        fontSize: 16,
        color: '#212121',
        fontFamily: 'monospace',
    },
    presetContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'center',
    },
    presetColor: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#E0E0E0',
    },
    presetColorActive: {
        borderColor: '#4CAF50',
        borderWidth: 3,
    },
});
