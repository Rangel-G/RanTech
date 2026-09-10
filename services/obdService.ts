import { OBD_PIDS, ObdPid } from "../constants/obdPids";
import BleManager, { bleEmitter, ensureBleManagerStarted } from "./ble/ble-manager";
import { requestBlePermissions } from "./ble/ble-permissions";

const OBD_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const OBD_CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

const SIMULATION_MODE = false;

export interface OBDDevice {
    id: string;
    name?: string;
}

export type OBDDataCallback = (pidKey: string, value: number) => void;

class OBDService {
    private connectedDeviceId: string | null = null;
    private scanListener: ReturnType<typeof bleEmitter.addListener> | null = null;
    private notifyListener: ReturnType<typeof bleEmitter.addListener> | null = null;

    private isPolling = false;
    private responseBuffer = '';
    private pendingResolve: ((data: string) => void) | null = null;

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
            this.connectedDeviceId = deviceId;
            return { id: deviceId, name: 'OBDII_Simulador' };
        }

        try {
            await ensureBleManagerStarted();

            this.stopScan();
            await BleManager.connect(deviceId);
            await BleManager.retrieveServices(deviceId);
            this.connectedDeviceId = deviceId;

            this.setupNotificationListener();
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
        await this.writeCommand('ATE0\r'); // Desativa eco
        await this.writeCommand('ATL0\r'); // Desativa cabeçalhos / linefeeds
        await this.writeCommand('ATSP0\r'); // Busca automática de protocolo
    }

    /**
     * Inicia o ciclo contínuo de consulta dos PIDs OBD2
     */
    async startPolling(onDataReceived: OBDDataCallback) {
        if (this.isPolling) return;
        this.isPolling = true;

        const pidsToQuery: { key: string; pidObj: ObdPid }[] = [
            { key: 'RPM', pidObj: OBD_PIDS.RPM },
            { key: 'SPEED', pidObj: OBD_PIDS.SPEED },
            { key: 'COOLANT_TEMP', pidObj: OBD_PIDS.COOLANT_TEMP },
            { key: 'THROTTLE_POS', pidObj: OBD_PIDS.THROTTLE_POS },
            { key: 'ENGINE_LOAD', pidObj: OBD_PIDS.ENGINE_LOAD },
            { key: 'BATTERY', pidObj: OBD_PIDS.BATTERY },
            { key: 'MAP', pidObj: OBD_PIDS.MAP },
        ];

        let index = 0;

        while (this.isPolling && (this.connectedDeviceId || SIMULATION_MODE)) {
            const currentItem = pidsToQuery[index];

            try {
                const rawResponse = await this.queryPid(currentItem.pidObj.pid);
                const parsedValue = currentItem.pidObj.parse(rawResponse);

                if (parsedValue !== null && !isNaN(parsedValue)) {
                    onDataReceived(currentItem.key, parsedValue);
                }
            } catch (error) {
                console.warn(`[OBD] Falha ao ler PID ${currentItem.key}:`, error);
            }

            index = (index + 1) % pidsToQuery.length;
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    stopPolling() {
        this.isPolling = false;
        this.pendingResolve = null;
        this.responseBuffer = '';
    }

    private queryPid(command: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingResolve = null;
                this.responseBuffer = '';
                reject(new Error(`Timeout no comando OBD: ${command}`));
            }, 1000);

            this.pendingResolve = (response) => {
                clearTimeout(timeout);
                resolve(response);
            };

            try {
                await this.writeCommand(`${command}\r`);
            } catch (err) {
                clearTimeout(timeout);
                this.pendingResolve = null;
                reject(err);
            }
        });
    }

    private setupNotificationListener() {
        if (!this.connectedDeviceId || SIMULATION_MODE) return;

        this.notifyListener?.remove();
        this.notifyListener = bleEmitter.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            ({ value, peripheral }) => {
                if (peripheral === this.connectedDeviceId && value) {
                    const chunk = String.fromCharCode(...value);
                    this.handleIncomingChunk(chunk);
                }
            }
        );

        BleManager.startNotification(
            this.connectedDeviceId,
            OBD_SERVICE_UUID,
            OBD_CHARACTERISTIC_UUID
        ).catch((err) => console.warn('[OBD] Erro ao ativar notificações BLE:', err));
    }

    private handleIncomingChunk(chunk: string) {
        this.responseBuffer += chunk;

        // O caractere '>' indica o fim da transmissão do chip ELM327
        if (this.responseBuffer.includes('>')) {
            const fullResponse = this.responseBuffer.replace('>', '').trim();
            this.responseBuffer = '';

            if (this.pendingResolve) {
                const resolve = this.pendingResolve;
                this.pendingResolve = null;
                resolve(fullResponse);
            }
        }
    }

    async writeCommand(command: string) {
        if (SIMULATION_MODE) {
            setTimeout(() => this.generateMockResponse(command), 50);
            return;
        }

        if (!this.connectedDeviceId) throw new Error('Nenhum dispositivo conectado');

        const byteArray = command.split('').map(char => char.charCodeAt(0));
        await BleManager.write(
            this.connectedDeviceId,
            OBD_SERVICE_UUID,
            OBD_CHARACTERISTIC_UUID,
            byteArray
        );
    }

    async disconnect() {
        this.stopPolling();
        if (SIMULATION_MODE) {
            this.connectedDeviceId = null;
            return;
        }

        if (this.connectedDeviceId) {
            this.notifyListener?.remove();
            this.notifyListener = null;
            await BleManager.disconnect(this.connectedDeviceId).catch(() => { });
            this.connectedDeviceId = null;
        }
    }

    // --- MOTOR DO SIMULADOR ---
    private generateMockResponse(command: string) {
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
        } else {
            response = 'OK';
        }

        this.handleIncomingChunk(response + '>');
    }
}

export const obdService = new OBDService();