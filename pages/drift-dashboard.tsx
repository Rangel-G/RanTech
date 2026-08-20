import { ChannelBox } from '@/components/ui/channel-box';
import { RpmRamp } from '@/components/ui/rpmRamp';
import { useReception } from '@/services/reception';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function DriftDashboard() {
  const { data, toggleTc } = useReception(100);

  return (
    <View style={styles.container}>
      <RpmRamp rpm={data.rpm} rpmMax={data.rpmMax} />

      <View style={styles.twoColumnRow}>
        <View style={styles.boxWrapper}>
          <ChannelBox
            label="Giro Atual"
            value={Math.round(data.rpm)}
            unit="RPM"
            size="small"
            theme="default"
          />
        </View>
        <View style={styles.boxWrapper}>
          <ChannelBox
            label="Pico de Giro"
            value={Math.round(data.rpmMax)}
            unit="MAX RPM"
            size="small"
            theme="warning"
          />
        </View>
      </View>

      <View style={styles.twoColumnRow}>
        <View style={styles.boxWrapper}>
          <ChannelBox
            label="Velocidade Roda"
            value={Math.round(data.speed)}
            unit="KM/H"
            size="small"
            theme="default"
          />
        </View>
        <View style={styles.boxWrapper}>
          <ChannelBox
            label="Controle de Tração"
            value={data.tc ? 'ATIVO' : 'INATIVO'}
            unit="STATUS TC"
            size="small"
            theme={data.tc ? 'success' : 'error'}
            isActive={data.tc}
            onPress={toggleTc}
          />
        </View>
      </View>

      <View style={styles.fullWidthBox}>
        <ChannelBox
          label="Delta de Patinagem"
          value={data.wheelSpin}
          unit="RPM vs VSS"
          size="small"
          theme={data.wheelSpin === 'ESTÁVEL' ? 'success' : 'error'}
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
