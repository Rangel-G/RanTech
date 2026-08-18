import { ChannelBox } from '@/components/ui/channel-box';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export function DriftDashboard() {
  const [data, setData] = useState({
    rpm: 0,
    rpmMax: 0,
    speed: 0,
    tc: false,
    wheelSpin: 'ESTÁVEL',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const newRpm = Math.max(0, Math.min(8000, Math.random() * 7000));
      setData((prev) => ({
        ...prev,
        rpm: newRpm,
        rpmMax: Math.max(prev.rpmMax, newRpm),
        speed: Math.max(0, prev.speed + Math.random() * 20 - 5),
        wheelSpin:
          Math.abs(newRpm - prev.speed * 70) > 1500
            ? 'PATINANDO'
            : 'ESTÁVEL',
      }));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Top row - 2 columns */}
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

      {/* Middle row - 2 columns */}
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
            value={data.tc ? 'ATIVO' : 'DESATIVADO'}
            unit="MODO SLIDE"
            size="small"
            theme="error"
          />
        </View>
      </View>

      {/* Bottom row - Full width */}
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
