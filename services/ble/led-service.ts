// services/ble/led-service.ts
import { Buffer } from 'buffer';
import { Device, State } from 'react-native-ble-plx';
import { getBleManager } from './ble-manager';

// UUIDs padrão da fita LEDDMX / LED LAMP
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

  scanAndConnect(
    deviceName: string,
    onConnected: (device: Device) => void,
    onError: (error: Error) => void
  ): void {
    getBleManager().startDeviceScan(null, null, async (error, device) => {
      if (error) {
        onError(error);
        getBleManager().stopDeviceScan();
        return;
      }

      if (device && (device.name === deviceName || device.localName === deviceName)) {
        getBleManager().stopDeviceScan();

        try {
          const connected = await device.connect();
          const discovered = await connected.discoverAllServicesAndCharacteristics();
          this.connectedDevice = discovered;
          this.lastColor = null;
          onConnected(discovered);
        } catch (err) {
          onError(err as Error);
        }
      }
    });
  }

  /**
   * Envia um array de bytes brutos convertidos para Base64
   */
  private async writeBytes(byteArray: number[]): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('Nenhum dispositivo LED conectado.');
    }

    const base64Data = Buffer.from(byteArray).toString('base64');

    await this.connectedDevice.writeCharacteristicWithoutResponseForService(
      LED_UUIDS.SERVICE,
      LED_UUIDS.CHARACTERISTIC,
      base64Data
    );
  }

  /**
   * Ligas/Desliga a fita
   * Frame Power: [0x7B, 0xFF, 0x04, 0x03 (ON) | 0x02 (OFF), 0xFF, 0xFF, 0xFF, 0xFF, 0xBF]
   */
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

  /**
   * Define a cor da fita
   * Frame RGB: [0x7B, 0xFF, 0x07, R, G, B, 0x00, 0xFF, 0xBF]
   */
  async setRgbColor(r: number, g: number, b: number, force = false): Promise<void> {
    const red = Math.max(0, Math.min(255, Math.floor(r)));
    const green = Math.max(0, Math.min(255, Math.floor(g)));
    const blue = Math.max(0, Math.min(255, Math.floor(b)));

    const colorKey = `${red},${green},${blue}`;

    // Anti-flood: evita reenviar a mesma cor durante varreduras do OBD2
    if (!force && this.lastColor === colorKey) {
      return;
    }

    this.lastColor = colorKey;

    const command = [0x7b, 0xff, 0x07, red, green, blue, 0x00, 0xff, 0xbf];
    await this.writeBytes(command);
  }

  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      await getBleManager().cancelDeviceConnection(this.connectedDevice.id);
      this.connectedDevice = null;
      this.lastColor = null;
    }
  }
}

export const ledService = new LedService();