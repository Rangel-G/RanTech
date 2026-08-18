import { ChannelBox } from '@/components/ui/channel-box';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export function StreetDashboard() {
  const [data, setData] = useState({
    speed: 0,
    gear: 'N',
    tc: true,
    power: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        speed: Math.max(0, prev.speed + Math.random() * 20 - 5),
        gear: ['N', 'P', 'R', 'D', 'S'][Math.floor(Math.random() * 5)],
        power: Math.max(0, Math.min(100, prev.power + Math.random() * 30 - 15)),
      }));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <ChannelBox
          label="Velocidade"
          value={Math.round(data.speed)}
          size="medium"
          theme="default"
        />
        <ChannelBox
          label="Marcha"
          value={data.gear}
          size="medium"
          theme="default"
        />
        <ChannelBox
          label="Controle de Tração"
          value={data.tc ? 'ATIVO' : 'INATIVO'}
          size="medium"
          theme={data.tc ? 'success' : 'warning'}
          isActive={data.tc}
        />
        <ChannelBox
          label="Carga Motor"
          value={`${Math.round(data.power)}%`}
          size="medium"
          theme="default"
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
  grid: {
    gap: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  box: {
    width: '48%',
  },
});
