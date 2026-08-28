// services/ble/ble-manager.ts
import { NativeEventEmitter, NativeModules } from 'react-native';
import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;

if (!BleManagerModule) {
    console.warn(
        '[BLE] Módulo nativo BleManager não encontrado. Rode "npx expo prebuild --clean" ' +
        'e reconstrua o app nativo após adicionar/alterar a lib.'
    );
}

// Só cria o emitter se o módulo nativo existir — evita o crash de import
export const bleEmitter = BleManagerModule
    ? new NativeEventEmitter(BleManagerModule)
    : new NativeEventEmitter();

let startPromise: Promise<void> | null = null;

/**
 * Inicializa o BleManager de forma preguiçosa e idempotente.
 * Deve ser chamado antes de qualquer operação BLE — nunca no escopo do módulo.
 */
export function ensureBleManagerStarted(): Promise<void> {
    if (!startPromise) {
        startPromise = BleManager.start({ showAlert: false }).catch((error) => {
            console.warn('[BLE] Falha ao iniciar BleManager:', error);
            startPromise = null; // permite retry na próxima chamada
            throw error;
        });
    }
    return startPromise;
}

export default BleManager;