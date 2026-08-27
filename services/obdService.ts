// /services/obdService.ts
import { Buffer } from 'buffer';
import { BleManager, Device } from 'react-native-ble-plx';

const OBD_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const OBD_CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

// Mude para "false" quando for compilar para o celular e ir para o carro!
const SIMULATION_MODE = true;

class OBDService {
    private manager: BleManager;
    private connectedDevice: Device | null = null;

    // Variável para guardar o listener no modo simulação
    private mockListener: ((hexData: string) => void) | null = null;

    constructor() {
        this.manager = new BleManager();
    }

    startScan(onDeviceFound: (device: Device) => void) {
        if (SIMULATION_MODE) {
            // Cria um dispositivo falso após 1 segundo
            setTimeout(() => {
                onDeviceFound({ id: 'SIM-001', name: 'OBDII_Simulador' } as Device);
            }, 1000);
            return;
        }

        this.manager.startDeviceScan(null, null, (error, device) => {
            if (device && device.name) onDeviceFound(device);
        });
    }

    stopScan() {
        if (!SIMULATION_MODE) this.manager.stopDeviceScan();
    }

    async connectToDevice(deviceId: string): Promise<Device> {
        if (SIMULATION_MODE) {
            // Finge que conectou instantaneamente
            await new Promise(resolve => setTimeout(resolve, 500));

            // Retornamos um objeto mockado mais completo, incluindo a função exigida
            return {
                id: deviceId,
                name: 'OBDII_Simulador',
                onDisconnected: () => {
                    // Apenas retorna um objeto vazio simulando a inscrição (subscription) da biblioteca real
                    return { remove: () => { } };
                }
            } as unknown as Device;
        }

        try {
            this.stopScan();
            const device = await this.manager.connectToDevice(deviceId);
            await device.discoverAllServicesAndCharacteristics();
            this.connectedDevice = device;
            await this.initializeELM327();
            return device;
        } catch (error) {
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
            // Responde com dados falsos gerados dinamicamente após 50ms (simulando latência)
            setTimeout(() => this.generateMockResponse(command), 50);
            return;
        }

        if (!this.connectedDevice) throw new Error('Nenhum dispositivo conectado');
        const base64Command = Buffer.from(command).toString('base64');
        await this.manager.writeCharacteristicWithResponseForDevice(
            this.connectedDevice.id, OBD_SERVICE_UUID, OBD_CHARACTERISTIC_UUID, base64Command
        );
    }

    startListening(onDataReceived: (hexData: string) => void) {
        if (SIMULATION_MODE) {
            this.mockListener = onDataReceived; // Guarda a função para usarmos no writeCommand
            return;
        }

        if (!this.connectedDevice) return;
        this.manager.monitorCharacteristicForDevice(
            this.connectedDevice.id, OBD_SERVICE_UUID, OBD_CHARACTERISTIC_UUID,
            (error, characteristic) => {
                if (characteristic?.value) {
                    const rawString = Buffer.from(characteristic.value, 'base64').toString('ascii');
                    onDataReceived(rawString);
                }
            }
        );
    }

    disconnect() {
        if (SIMULATION_MODE) return;
        if (this.connectedDevice) {
            this.manager.cancelDeviceConnection(this.connectedDevice.id);
            this.connectedDevice = null;
        }
    }

    // --- MOTOR DO SIMULADOR ---
    private generateMockResponse(command: string) {
        if (!this.mockListener) return;

        let response = '';

        // Remove o \r para avaliar o comando
        const cleanCmd = command.replace('\r', '');

        if (cleanCmd === '010C') {
            // Simulando RPM: variando entre 800 e 3500
            const rpm = Math.floor(Math.random() * (3500 - 800 + 1)) + 800;
            // Fórmula Inversa: (RPM * 4) = (A * 256) + B
            const value = rpm * 4;
            const A = Math.floor(value / 256).toString(16).padStart(2, '0').toUpperCase();
            const B = (value % 256).toString(16).padStart(2, '0').toUpperCase();
            response = `41 0C ${A} ${B}`;

        } else if (cleanCmd === '010D') {
            // Simulando Velocidade: variando entre 40 e 100 km/h
            const speed = Math.floor(Math.random() * (100 - 40 + 1)) + 40;
            const A = speed.toString(16).padStart(2, '0').toUpperCase();
            response = `41 0D ${A}`;

        } else if (cleanCmd === '0105') {
            // Simulando Temperatura do motor (Coolant): 85 a 95 ºC
            const temp = Math.floor(Math.random() * (95 - 85 + 1)) + 85;
            // Fórmula Inversa: A - 40 = temp => A = temp + 40
            const A = (temp + 40).toString(16).padStart(2, '0').toUpperCase();
            response = `41 05 ${A}`;

        } else if (cleanCmd === '0111') {
            // Simulando Acelerador: 0% a 50%
            const throttle = Math.floor(Math.random() * 50);
            // Fórmula Inversa: (A * 100) / 255 = throttle => A = (throttle * 255) / 100
            const A = Math.floor((throttle * 255) / 100).toString(16).padStart(2, '0').toUpperCase();
            response = `41 11 ${A}`;
        }
        else if (cleanCmd === '0104') {
            // Simula Carga do Motor: 20% a 85%
            const load = Math.floor(Math.random() * (85 - 20 + 1)) + 20;
            const A = Math.floor((load * 255) / 100).toString(16).padStart(2, '0').toUpperCase();
            response = `41 04 ${A}`;

        } else if (cleanCmd === 'ATRV') {
            // Simula Voltagem do Alternador: 13.5v a 14.4v
            const volts = (Math.random() * (14.4 - 13.5) + 13.5).toFixed(1);
            response = `${volts}V`;
        } else if (cleanCmd === '010A') {
            // Simula Pressão do Combustível (A * 3): ~300 a 400 kPa
            const press = Math.floor(Math.random() * (400 - 300 + 1)) + 300;
            const A = Math.floor(press / 3).toString(16).padStart(2, '0').toUpperCase();
            response = `41 0A ${A}`;

        } else if (cleanCmd === '010B') {
            // Simula Pressão MAP (A): 30 a 100 kPa
            const map = Math.floor(Math.random() * (100 - 30 + 1)) + 30;
            const A = map.toString(16).padStart(2, '0').toUpperCase();
            response = `41 0B ${A}`;

        } else if (cleanCmd === '010E') {
            // Simula Avanço de Ignição ((A/2) - 64): -10 a 40 graus
            const advance = Math.floor(Math.random() * (40 - (-10) + 1)) + (-10);
            const A = Math.floor((advance + 64) * 2).toString(16).padStart(2, '0').toUpperCase();
            response = `41 0E ${A}`;

        } else if (cleanCmd === '010F') {
            // Simula Temperatura IAT (A - 40): 25 a 55 ºC
            const iat = Math.floor(Math.random() * (55 - 25 + 1)) + 25;
            const A = Math.floor(iat + 40).toString(16).padStart(2, '0').toUpperCase();
            response = `41 0F ${A}`;

        } else if (cleanCmd === '012F') {
            // Simula Nível do Tanque ((A*100)/255): 10% a 100%
            const level = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
            const A = Math.floor((level * 255) / 100).toString(16).padStart(2, '0').toUpperCase();
            response = `41 2F ${A}`;
        }


        // Envia a resposta falsa se houver uma mapeada
        if (response) {
            this.mockListener(response);
        }
    }
}

export const obdService = new OBDService();