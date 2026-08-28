// services/obdService.ts
import BleManager, { bleEmitter, ensureBleManagerStarted } from "./ble/ble-manager";
import { requestBlePermissions } from "./ble/ble-permissions";

const OBD_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const OBD_CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

const SIMULATION_MODE = false;

export interface OBDDevice {
    id: string;
    name?: string;
}

class OBDService {
    private connectedDeviceId: string | null = null;
    private mockListener: ((hexData: string) => void) | null = null;
    private scanListener: ReturnType<typeof bleEmitter.addListener> | null = null;
    private notifyListener: ReturnType<typeof bleEmitter.addListener> | null = null;

    /**
     * Inicia o scan de dispositivos OBD via BLE.
     * @param onDeviceFound Chamado a cada periférico encontrado.
     * @param onError Chamado se a permissão for negada, o Bluetooth estiver
     * desligado, ou o BleManager falhar ao iniciar — evita falhas silenciosas.
     */
    async startScan(
        onDeviceFound: (device: OBDDevice) => void,
        onError?: (error: Error) => void
    ): Promise<void> {
        if (SIMULATION_MODE) {
            setTimeout(() => {
                onDeviceFound({ id: 'SIM-001', name: 'OBDII_Simulador' });
            }, 1000);
            return;
        }

        try {
            const hasPermission = await requestBlePermissions();
            if (!hasPermission) {
                onError?.(new Error('Permissões de Bluetooth negadas.'));
                return;
            }

            await ensureBleManagerStarted();

            this.scanListener?.remove();
            this.scanListener = bleEmitter.addListener('BleManagerDiscoverPeripheral', (peripheral) => {
                if (peripheral.name) {
                    onDeviceFound({ id: peripheral.id, name: peripheral.name });
                }
            });

            await BleManager.scan({
                serviceUUIDs: [],
                seconds: 10,
                allowDuplicates: true,
            });
        } catch (error) {
            console.error('Erro ao iniciar scan OBD:', error);
            onError?.(error instanceof Error ? error : new Error('Falha ao iniciar scan Bluetooth.'));
        }
    }

    stopScan() {
        if (!SIMULATION_MODE) {
            this.scanListener?.remove();
            this.scanListener = null;
            BleManager.stopScan();
        }
    }

    async connectToDevice(deviceId: string): Promise<OBDDevice> {
        if (SIMULATION_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return { id: deviceId, name: 'OBDII_Simulador' };
        }

        try {
            await ensureBleManagerStarted();

            this.stopScan();
            await BleManager.connect(deviceId);
            await BleManager.retrieveServices(deviceId);
            this.connectedDeviceId = deviceId;
            await this.initializeELM327();
            return { id: deviceId, name: 'OBDII Device' };
        } catch (error) {
            this.connectedDeviceId = null;
            throw error;
        }
    }

    private async initializeELM327() {
        await this.writeCommand('ATZ\r');
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.writeCommand('ATE0\r');
        await this.writeCommand('ATSP0\r');
    }

    async writeCommand(command: string) {
        if (SIMULATION_MODE) {
            setTimeout(() => this.generateMockResponse(command), 50);
            return;
        }

        if (!this.connectedDeviceId) throw new Error('Nenhum dispositivo conectado');

        // Converte a string ASCII do comando em um Array de Bytes (números)
        const byteArray = command.split('').map(char => char.charCodeAt(0));
        await BleManager.write(
            this.connectedDeviceId,
            OBD_SERVICE_UUID,
            OBD_CHARACTERISTIC_UUID,
            byteArray
        );
    }

    async startListening(onDataReceived: (hexData: string) => void) {
        if (SIMULATION_MODE) {
            this.mockListener = onDataReceived;
            return;
        }

        if (!this.connectedDeviceId) return;

        this.notifyListener?.remove();
        this.notifyListener = bleEmitter.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            ({ value, peripheral }) => {
                if (peripheral === this.connectedDeviceId && value) {
                    // 'value' já é recebido como um array de bytes numéricos (number[])
                    const rawString = String.fromCharCode(...value);
                    onDataReceived(rawString);
                }
            }
        );

        await BleManager.startNotification(
            this.connectedDeviceId,
            OBD_SERVICE_UUID,
            OBD_CHARACTERISTIC_UUID
        );
    }

    async disconnect() {
        if (SIMULATION_MODE) return;
        if (this.connectedDeviceId) {
            this.notifyListener?.remove();
            this.notifyListener = null;
            await BleManager.disconnect(this.connectedDeviceId);
            this.connectedDeviceId = null;
        }
    }

    // --- MOTOR DO SIMULADOR ---
    private generateMockResponse(command: string) {
        if (!this.mockListener) return;

        let response = '';
        const cleanCmd = command.replace('\r', '');

        if (cleanCmd === '010C') {
            const rpm = Math.floor(Math.random() * (3500 - 800 + 1)) + 800;
            const value = rpm * 4;
            const A = Math.floor(value / 256).toString(16).padStart(2, '0').toUpperCase();
            const B = (value % 256).toString(16).padStart(2, '0').toUpperCase();
            response = `41 0C ${A} ${B}`;
        } else if (cleanCmd === '010D') {
            const speed = Math.floor(Math.random() * (100 - 40 + 1)) + 40;
            const A = speed.toString(16).padStart(2, '0').toUpperCase();
            response = `41 0D ${A}`;
        } else if (cleanCmd === '0105') {
            const temp = Math.floor(Math.random() * (95 - 85 + 1)) + 85;
            const A = (temp + 40).toString(16).padStart(2, '0').toUpperCase();
            response = `41 05 ${A}`;
        } else if (cleanCmd === '0111') {
            const throttle = Math.floor(Math.random() * 50);
            const A = Math.floor((throttle * 255) / 100).toString(16).padStart(2, '0').toUpperCase();
            response = `41 11 ${A}`;
        } else if (cleanCmd === '0104') {
            const load = Math.floor(Math.random() * (85 - 20 + 1)) + 20;
            const A = Math.floor((load * 255) / 100).toString(16).padStart(2, '0').toUpperCase();
            response = `41 04 ${A}`;
        } else if (cleanCmd === 'ATRV') {
            const volts = (Math.random() * (14.4 - 13.5) + 13.5).toFixed(1);
            response = `${volts}V`;
        } else if (cleanCmd === '010A') {
            const press = Math.floor(Math.random() * (400 - 300 + 1)) + 300;
            const A = Math.floor(press / 3).toString(16).padStart(2, '0').toUpperCase();
            response = `41 0A ${A}`;
        } else if (cleanCmd === '010B') {
            const map = Math.floor(Math.random() * (100 - 30 + 1)) + 30;
            const A = map.toString(16).padStart(2, '0').toUpperCase();
            response = `41 0B ${A}`;
        } else if (cleanCmd === '010E') {
            const advance = Math.floor(Math.random() * (40 - (-10) + 1)) + (-10);
            const A = Math.floor((advance + 64) * 2).toString(16).padStart(2, '0').toUpperCase();
            response = `41 0E ${A}`;
        } else if (cleanCmd === '010F') {
            const iat = Math.floor(Math.random() * (55 - 25 + 1)) + 25;
            const A = Math.floor(iat + 40).toString(16).padStart(2, '0').toUpperCase();
            response = `41 0F ${A}`;
        } else if (cleanCmd === '012F') {
            const level = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
            const A = Math.floor((level * 255) / 100).toString(16).padStart(2, '0').toUpperCase();
            response = `41 2F ${A}`;
        } else if (cleanCmd === '0110') {
            const maf = Math.floor(Math.random() * (150 - 5 + 1)) + 5;
            const value = maf * 100;
            const A = Math.floor(value / 256).toString(16).padStart(2, '0').toUpperCase();
            const B = (value % 256).toString(16).padStart(2, '0').toUpperCase();
            response = `41 10 ${A} ${B}`;
        }

        if (response) {
            this.mockListener(response);
        }
    }
}

export const obdService = new OBDService();