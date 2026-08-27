import { NativeEventEmitter, NativeModules } from 'react-native';
import BleManager from 'react-native-ble-manager';

// Inicializa o módulo nativo do BLE Manager
BleManager.start({ showAlert: false });

const BleManagerModule = NativeModules.BleManager;
export const bleEmitter = new NativeEventEmitter(BleManagerModule);

export default BleManager;