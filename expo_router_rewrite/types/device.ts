export interface Device {
  id: number;
  name: string;
  type: 'light' | 'lock' | 'thermostat';
  isOn: boolean;
  room?: string;
  temperature?: number;
  currentTemperature?: number;
}

export interface ThermostatUpdate {
  temperature?: number;
  currentTemperature?: number;
}
