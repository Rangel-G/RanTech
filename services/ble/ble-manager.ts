// services/ble/ble-manager.ts
import { BleManager } from 'react-native-ble-plx';

class BleManagerInstance {
    private static instance: BleManager | null = null;

    // O construtor privado impede a criação direta com "new BleManagerInstance()"
    private constructor() { }

    /**
     * Retorna a instância única do BleManager.
     * Se ainda não existir, cria uma nova.
     * Lazy initialization: só cria quando realmente necessário
     */
    public static getInstance(): BleManager {
        if (!BleManagerInstance.instance) {
            try {
                BleManagerInstance.instance = new BleManager();
            } catch (error) {
                console.warn('Failed to initialize BleManager:', error);
                throw new Error('BleManager initialization failed. Make sure native bindings are available.');
            }
        }
        return BleManagerInstance.instance;
    }
}

// Lazy getter - só instancia quando chamado
export const getBleManager = (): BleManager => BleManagerInstance.getInstance();