import { ChannelBox } from '@/components/ui/channel-box';
import { RpmRamp } from '@/components/ui/rpmRamp';
import { useCalculatedGear } from '@/hooks/useCalculateGear';
import { useCarData } from '@/hooks/useCarData';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export function DriftDashboard() {
  const { rpm, speed, throttlePos } = useCarData();
  const currentGear = useCalculatedGear(rpm, speed);

  // Estado local para o botão de TC (pode ser usado no futuro para acionar um relé via Bluetooth)
  const [tcEnabled, setTcEnabled] = useState(true);

  // --- LÓGICA DE DETECÇÃO DE PATINAGEM (WHEEL SPIN) ---
  let wheelSpinStatus = 'ESTÁVEL';
  let spinTheme: 'success' | 'error' | 'warning' | 'default' = 'success';

  // Se o carro está em movimento, o acelerador está pressionado, mas o calculador
  // de marchas perdeu a referência ('N'), significa que o RPM descolou da Velocidade.
  if (speed > 15 && throttlePos > 40 && currentGear === 'N') {
    wheelSpinStatus = 'PATINANDO (DRIFT)';
    spinTheme = 'warning'; // Fica amarelo/laranja indicando perda de tração
  }

  // Falha de leitura ou carro parado
  if (speed === 0 && rpm === 0) {
    spinTheme = 'default';
    wheelSpinStatus = 'AGUARDANDO DADOS';
  }

  return (
    <View style={styles.container}>
      {/* Assumindo 8000 como rpmMax visual, já que não temos PID para isso */}
      <RpmRamp rpm={rpm} rpmMax={8000} />

      <View style={styles.twoColumnRow}>
        <View style={styles.boxWrapper}>
          <ChannelBox
            label="Giro Atual"
            value={Math.round(rpm)}
            unit="RPM"
            size="small"
            theme="default"
          />
        </View>
        <View style={styles.boxWrapper}>
          <ChannelBox
            label="Velocidade Roda"
            value={Math.round(speed)}
            unit="KM/H"
            size="small"
            theme="default"
          />
        </View>
      </View>

      <View style={styles.twoColumnRow}>
        <View style={styles.boxWrapper}>
          <ChannelBox
            label="Marcha"
            value={currentGear}
            unit="GEAR"
            size="small"
            theme="default"
          />
        </View>
        <View style={styles.boxWrapper}>
          <ChannelBox
            label="Controle de Tração"
            value={tcEnabled ? 'ATIVO' : 'INATIVO'}
            unit="STATUS TC"
            size="small"
            theme={tcEnabled ? 'success' : 'error'}
            isActive={tcEnabled}
            onPress={() => setTcEnabled(!tcEnabled)}
          />
        </View>
      </View>

      <View style={styles.fullWidthBox}>
        <ChannelBox
          label="Delta de Patinagem"
          value={wheelSpinStatus}
          unit="RPM vs VSS"
          size="small"
          theme={spinTheme}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(2, 8, 16, 0.96)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 255, 255, 0.12)',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  boxWrapper: {
    flex: 1,
  },
  fullWidthBox: {
    width: '100%',
  },
});