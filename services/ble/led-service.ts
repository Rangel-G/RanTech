import BleManager, { bleEmitter } from "./ble-manager";

export const LED_UUIDS = {
  SERVICE: '0000ffe0-0000-1000-8000-00805f9b34fb',
  CHARACTERISTIC: '0000ffe1-0000-1000-8000-00805f9b34fb',
};

export interface LedDevice {
  id: string;
  name?: string;
}

export class LedService {
  private connectedDeviceId: string | null = null;
  private lastColor: string | null = null;
  private scanListener: any = null;
  private disconnectListener: any = null;

  async checkBluetoothState(): Promise<boolean> {
    const state = await BleManager.checkState();
    return state === 'on';
  }

  public isConnected(): boolean {
    return this.connectedDeviceId !== null;
  }

  scanAndConnect(
    deviceName: string,
    onConnected: (device: LedDevice) => void,
    onError: (error: Error) => void,
    timeoutMs = 8000
  ): void {
    const timeoutId = setTimeout(() => {
      this.scanListener?.remove();
      BleManager.stopScan();
      if (!this.connectedDeviceId) {
        onError(new Error('Timeout: Fita LED não encontrada.'));
      }
    }, timeoutMs);

    this.scanListener?.remove();
    this.scanListener = bleEmitter.addListener('BleManagerDiscoverPeripheral', async (peripheral) => {
      if (peripheral && (peripheral.name === deviceName || peripheral.advertising?.localName === deviceName)) {
        clearTimeout(timeoutId);
        this.scanListener?.remove();
        BleManager.stopScan();

        try {
          await BleManager.connect(peripheral.id);
          await BleManager.retrieveServices(peripheral.id);

          this.connectedDeviceId = peripheral.id;
          this.lastColor = null;

          // Monitora desconexão do dispositivo
          this.disconnectListener?.remove();
          this.disconnectListener = bleEmitter.addListener(
            'BleManagerDisconnectPeripheral',
            (data) => {
              if (data.peripheral === this.connectedDeviceId) {
                console.warn('Fita LED desconectou.');
                this.connectedDeviceId = null;
                this.lastColor = null;
              }
            }
          );

          onConnected({ id: peripheral.id, name: peripheral.name });
        } catch (err) {
          this.connectedDeviceId = null;
          onError(err as Error);
        }
      }
    });

    BleManager.scan({
      serviceUUIDs: [],
      seconds: Math.floor(timeoutMs / 1000),
      allowDuplicates: true,
    });
  }

  private async writeBytes(byteArray: number[]): Promise<void> {
    if (!this.connectedDeviceId) {
      return;
    }

    try {
      // Envia os bytes diretamente como array numérico
      await BleManager.writeWithoutResponse(
        this.connectedDeviceId,
        LED_UUIDS.SERVICE,
        LED_UUIDS.CHARACTERISTIC,
        byteArray
      );
    } catch (error) {
      console.warn('Falha ao enviar dados para a fita LED:', error);
      this.connectedDeviceId = null;
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

    if (!force && this.lastColor === colorKey) {
      return;
    }

    this.lastColor = colorKey;

    const command = [0x7b, 0xff, 0x07, red, green, blue, 0x00, 0xff, 0xbf];
    await this.writeBytes(command);
  }

  async updateShiftLight(
    rpm: number,
    redlineRpm: number,
    blinkIntervalMs: number,
    normalColor: [number, number, number],
    redlineColor: [number, number, number]
  ): Promise<void> {
    if (!this.connectedDeviceId) return;

    if (rpm < redlineRpm) {
      await this.setRgbColor(normalColor[0], normalColor[1], normalColor[2]);
      return;
    }

    const intervalSec = Math.max(0.02, blinkIntervalMs / 1000.0);
    const phase = Math.floor((Date.now() / 1000) / intervalSec) % 2;

    const [r, g, b] = phase === 0 ? redlineColor : [0, 0, 0];
    await this.setRgbColor(r, g, b);
  }

  async disconnect(): Promise<void> {
    if (this.connectedDeviceId) {
      try {
        this.disconnectListener?.remove();
        await BleManager.disconnect(this.connectedDeviceId);
      } catch (err) {
        console.warn('Erro ao desconectar:', err);
      } finally {
        this.connectedDeviceId = null;
        this.lastColor = null;
      }
    }
  }
}

export const ledService = new LedService();