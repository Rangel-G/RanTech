// services/storage/led-storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const LED_NAME_KEY = '@rantech:led_device_name';
const LED_UUID_KEY = '@rantech:led_char_uuid';

export const DEFAULT_LED_NAME = 'LEDDMX-000101';
export const DEFAULT_LED_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

export interface LedConfig {
    name: string;
    uuid: string;
}

export const LedStorage = {
    /**
     * Busca as configurações salvas ou retorna os valores padrão
     */
    async getConfig(): Promise<LedConfig> {
        try {
            const [savedName, savedUuid] = await Promise.all([
                AsyncStorage.getItem(LED_NAME_KEY),
                AsyncStorage.getItem(LED_UUID_KEY),
            ]);

            return {
                name: savedName ? savedName : DEFAULT_LED_NAME,
                uuid: savedUuid ? savedUuid : DEFAULT_LED_UUID,
            };
        } catch {
            return {
                name: DEFAULT_LED_NAME,
                uuid: DEFAULT_LED_UUID,
            };
        }
    },

    /**
     * Salva o nome e a UUID da Fita LED
     */
    async setConfig(name: string, uuid: string): Promise<void> {
        try {
            await Promise.all([
                AsyncStorage.setItem(LED_NAME_KEY, name.trim()),
                AsyncStorage.setItem(LED_UUID_KEY, uuid.trim().toLowerCase()),
            ]);
        } catch (error) {
            console.error('Erro ao salvar configurações da Fita LED:', error);
        }
    },
};