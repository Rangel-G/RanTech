import { Buffer } from 'buffer';
import { Device, State } from 'react-native-ble-plx';
import { getBleManager } from './ble-manager';

export const LED_UUIDS = {
  SERVICE: '0000ffe0-0000-1000-8000-00805f9b34fb',
  CHARACTERISTIC: '0000ffe1-0000-1000-8000-00805f9b34fb',
};

export class LedService {
  private connectedDevice: Device | null = null;
  private lastColor: string | null = null;

  async checkBluetoothState(): Promise<boolean> {
    const state = await getBleManager().state();
    return state === State.PoweredOn;
  }

  public isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  scanAndConnect(
    deviceName: string,
    onConnected: (device: Device) => void,
    onError: (error: Error) => void,
    timeoutMs = 8000
  ): void {
    // Timeout para não ficar escaneando infinitamente
    const timeoutId = setTimeout(() => {
      getBleManager().stopDeviceScan();
      if (!this.connectedDevice) {
        onError(new Error('Timeout: Fita LED não encontrada.'));
      }
    }, timeoutMs);

    getBleManager().startDeviceScan(null, null, async (error, device) => {
      if (error) {
        clearTimeout(timeoutId);
        getBleManager().stopDeviceScan();
        onError(error);
        return;
      }

      if (device && (device.name === deviceName || device.localName === deviceName)) {
        clearTimeout(timeoutId);
        getBleManager().stopDeviceScan();

        try {
          const connected = await device.connect();
          const discovered = await connected.discoverAllServicesAndCharacteristics();

          this.connectedDevice = discovered;
          this.lastColor = null;

          // Monitora desconexão automática da fita
          discovered.onDisconnected(() => {
            console.warn('Fita LED desconectou.');
            this.connectedDevice = null;
            this.lastColor = null;
          });

          onConnected(discovered);
        } catch (err) {
          this.connectedDevice = null;
          onError(err as Error);
        }
      }
    });
  }

  private async writeBytes(byteArray: number[]): Promise<void> {
    if (!this.connectedDevice) {
      return;
    }

    try {
      const base64Data = Buffer.from(byteArray).toString('base64');

      await this.connectedDevice.writeCharacteristicWithoutResponseForService(
        LED_UUIDS.SERVICE,
        LED_UUIDS.CHARACTERISTIC,
        base64Data
      );
    } catch (error) {
      console.warn('Falha ao enviar dados para a fita LED:', error);
      // Reseta estado interno caso a comunicação falhe
      this.connectedDevice = null;
      this.lastColor = null;
    }
  }

  async setPower(powerOn: boolean): Promise<void> {
    const command = [
      0x7b,
      0xff,
      0x04,
      powerOn ? 0x03 : 0x02,
      0xff,
      0xff,
      0xff,
      0xff,
      0xbf,
    ];
    await this.writeBytes(command);
  }

  async setRgbColor(r: number, g: number, b: number, force = false): Promise<void> {
    const red = Math.max(0, Math.min(255, Math.floor(r)));
    const green = Math.max(0, Math.min(255, Math.floor(g)));
    const blue = Math.max(0, Math.min(255, Math.floor(b)));

    const colorKey = `${red},${green},${blue}`;

    // Anti-flood: evita re-enviar comandos idênticos no ciclo
    if (!force && this.lastColor === colorKey) {
      return;
    }

    this.lastColor = colorKey;

    const command = [0x7b, 0xff, 0x07, red, green, blue, 0x00, 0xff, 0xbf];
    await this.writeBytes(command);
  }

  /**
   * Lógica do Shift Light baseada no RPM (Substitui a função do Python)
   */
  async updateShiftLight(
    rpm: number,
    redlineRpm: number,
    blinkIntervalMs: number,
    normalColor: [number, number, number],
    redlineColor: [number, number, number]
  ): Promise<void> {
    if (!this.connectedDevice) return;

    // Se estiver abaixo do redline, exibe cor normal sólida
    if (rpm < redlineRpm) {
      await this.setRgbColor(normalColor[0], normalColor[1], normalColor[2]);
      return;
    }

    // A partir do redline: efeito strobe (pisca alternando entre cor de redline e apagado)
    const intervalSec = Math.max(0.02, blinkIntervalMs / 1000.0);
    const phase = Math.floor((Date.now() / 1000) / intervalSec) % 2;

    const [r, g, b] = phase === 0 ? redlineColor : [0, 0, 0];
    await this.setRgbColor(r, g, b);
  }

  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      try {
        await getBleManager().cancelDeviceConnection(this.connectedDevice.id);
      } catch (err) {
        console.warn('Erro ao desconectar:', err);
      } finally {
        this.connectedDevice = null;
        this.lastColor = null;
      }
    }
  }
}

export const ledService = new LedService();