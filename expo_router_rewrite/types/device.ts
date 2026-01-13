export interface Device {
  id: number;
  name: string;
  type: 'light' | 'lock' | 'thermostat' | 'ledStrip';
  isOn: boolean;
  room?: string;
  temperature?: number;
  currentTemperature?: number;
  color?: string;
}

export interface ThermostatUpdate {
  temperature?: number;
  currentTemperature?: number;
}
