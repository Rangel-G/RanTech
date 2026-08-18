// services/storage/settings-storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    OBD: '@rantech:obd_settings',
    LED: '@rantech:led_settings',
    GEAR: '@rantech:gear_settings',
};

export interface ObdSettings {
    connected: boolean;
    connectionType: string;
    port: string;
    baudRate: string;
    protocol: string;
    ftdiDevice: string;
}

export interface LedSettings {
    name: string;
    uuid: string;
    redlineRpm: string;
    blinkSpeed: string;
    colorNormal: string;
    colorRedline: string;
    autoShift: boolean;
}

export interface GearSettings {
    ratios: string;
    differential: string;
    tirePerimeter: string;
}

export const DEFAULT_OBD_SETTINGS: ObdSettings = {
    connected: false,
    connectionType: 'bluetooth',
    port: 'COM4',
    baudRate: '115200',
    protocol: 'auto',
    ftdiDevice: '',
};

export const DEFAULT_LED_SETTINGS: LedSettings = {
    name: 'LEDDMX-000101',
    uuid: '0000ffe1-0000-1000-8000-00805f9b34fb',
    redlineRpm: '3000',
    blinkSpeed: '70',
    colorNormal: '#0084ff',
    colorRedline: '#ff0000',
    autoShift: true,
};

export const DEFAULT_GEAR_SETTINGS: GearSettings = {
    ratios: '3.58,1.93,1.41,1.11,0.88',
    differential: '4.25',
    tirePerimeter: '1.83',
};

export const SettingsStorage = {
    async getObdSettings(): Promise<ObdSettings> {
        try {
            const data = await AsyncStorage.getItem(KEYS.OBD);
            return data ? { ...DEFAULT_OBD_SETTINGS, ...JSON.parse(data) } : DEFAULT_OBD_SETTINGS;
        } catch {
            return DEFAULT_OBD_SETTINGS;
        }
    },
    async saveObdSettings(settings: ObdSettings): Promise<void> {
        await AsyncStorage.setItem(KEYS.OBD, JSON.stringify(settings));
    },

    async getLedSettings(): Promise<LedSettings> {
        try {
            const data = await AsyncStorage.getItem(KEYS.LED);
            return data ? { ...DEFAULT_LED_SETTINGS, ...JSON.parse(data) } : DEFAULT_LED_SETTINGS;
        } catch {
            return DEFAULT_LED_SETTINGS;
        }
    },
    async saveLedSettings(settings: LedSettings): Promise<void> {
        await AsyncStorage.setItem(KEYS.LED, JSON.stringify(settings));
    },

    async getGearSettings(): Promise<GearSettings> {
        try {
            const data = await AsyncStorage.getItem(KEYS.GEAR);
            return data ? { ...DEFAULT_GEAR_SETTINGS, ...JSON.parse(data) } : DEFAULT_GEAR_SETTINGS;
        } catch {
            return DEFAULT_GEAR_SETTINGS;
        }
    },
    async saveGearSettings(settings: GearSettings): Promise<void> {
        await AsyncStorage.setItem(KEYS.GEAR, JSON.stringify(settings));
    },
};