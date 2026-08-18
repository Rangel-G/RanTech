import { ChannelBox } from '@/components/ui/channel-box';
import { GEAR_OPTIONS } from '@/constants/gear-options';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export function StreetDashboard() {
  const [data, setData] = useState({
    speed: 0,
    gear: 'N',
    tc: true,
    power: 0,
  });

  const toggleTC = () => {
    setData((prev) => ({
      ...prev,
      tc: !prev.tc,
    }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev, // Preserva o estado de tc atualizado pelo usuário
        speed: Math.max(0, prev.speed + Math.random() * 20 - 5),
        gear: GEAR_OPTIONS[Math.floor(Math.random() * GEAR_OPTIONS.length)],
        power: Math.max(0, Math.min(100, prev.power + Math.random() * 30 - 15)),
      }));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {/* Esquerda: Velocidade */}
        <View style={styles.leftColumn}>
          <ChannelBox
            label="Velocidade"
            value={Math.round(data.speed)}
            unit="KM/H"
            size="large"
            theme="default"
          />
        </View>

        {/* Direita: Grid 2x2 */}
        <View style={styles.rightSection}>
          <View style={styles.row}>
            <View style={styles.cell}>
              <ChannelBox
                label="Marcha"
                value={data.gear}
                unit="GEAR"
                size="small"
                theme="default"
              />
            </View>
            <View style={styles.cell}>
              <ChannelBox
                label="Carga Motor"
                value={Math.round(data.power)}
                unit="%"
                size="small"
                theme="default"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.cell}>
              <ChannelBox
                label="Controle de Tração"
                value={data.tc ? 'ATIVO' : 'INATIVO'}
                unit="STATUS TC"
                size="small"
                theme={data.tc ? 'success' : 'error'}
                isActive={data.tc}
                onPress={toggleTC}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070a',
    padding: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  leftColumn: {
    flex: 1.2,
  },
  rightSection: {
    flex: 2,
    flexDirection: 'column',
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  cell: {
    flex: 1,
  },
});